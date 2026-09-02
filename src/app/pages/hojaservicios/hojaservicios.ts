import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { Nuevoservicios } from '../nuevoservicios/nuevoservicios';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NuevosServicios } from '../services/NuevosServicios';
import Swal from 'sweetalert2';
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";

@Component({
  selector: 'app-hojaservicios',
  imports: [
    CommonModule,
    FormsModule],
  templateUrl: './hojaservicios.html',
  styleUrl: './hojaservicios.css',
})
export class Hojaservicios implements OnInit {
  ultimoFolio: number = 0;
  servicioSeleccionado: number | null = null;
  private dialog = inject(MatDialog);
  private datosClientesService = inject(NuevosServicios);
  private cdr = inject(ChangeDetectorRef);
  // AQUÍ SE GUARDARÁN LOS DATOS DE SQL SERVER
  servicios: any[] = [];
  ngOnInit(): void {

    const folioGuardado = localStorage.getItem('ultimoFolio');

    this.ultimoFolio = folioGuardado
      ? Number(folioGuardado)
      : 0;

    this.cargarClientes();

    // ESCUCHAR CAMBIOS


    console.log('🔄 Actualizando tabla automáticamente...');

    this.cargarClientes();

  }

  cargarClientes(): void {

    this.datosClientesService.obtenerClientes().subscribe({

      next: (datos) => {

        this.servicios = datos;

        this.cdr.detectChanges();

      },

      error: (error) => {
        console.error('Error al cargar servicios:', error);
      }

    });

  }

  formatearFecha(fecha: any): string {

    if (!fecha) {
      return '';
    }

    const date = new Date(fecha);

    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();

    return `${dia}/${mes}/${anio}`;
  }

  nuevoServicio(): void {
    const siguienteFolio = this.ultimoFolio + 1;

    const dialogRef = this.dialog.open(Nuevoservicios, {

      width: '850px',
      maxWidth: '95vw',
      disableClose: true,

      data: {
        folio: siguienteFolio
      }

    });

    dialogRef.afterClosed().subscribe(resultado => {

      if (resultado) {
        console.log('Servicio modificado:', resultado);

        this.servicios = this.servicios.map(servicio =>
          servicio.idservicio === resultado.idservicio
            ? resultado
            : servicio
        );

      }
      // 🔄 REFRESCAR TABLA
      this.cargarClientes();
    });

  }

  modificarServicio(servicio: any): void {

    const dialogRef = this.dialog.open(Nuevoservicios, {

      width: '850px',
      maxWidth: '95vw',
      disableClose: true,

      data: {
        servicio: servicio
      }

    });
    dialogRef.afterClosed().subscribe(resultado => {

      if (resultado) {

        console.log(
          'Servicio modificado:',
          resultado
        );


      }
      // 🔄 REFRESCAR TABLA
      this.cargarClientes();
    });

  }

  eliminarServicio(id: number): void {

    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar servicio?',
      text: '¿Estás seguro de que deseas eliminar este servicio?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d'
    }).then((resultado) => {

      // Si presiona cancelar
      if (!resultado.isConfirmed) {
        return;
      }

      // Eliminar servicio
      this.datosClientesService
        .eliminarServicio(id)
        .subscribe({

          next: () => {

            console.log('Servicio eliminado correctamente');

            // 🔄 Actualizar tabla
            this.cargarClientes();

            // ✅ Mensaje de éxito
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado exitosamente!',
              text: 'El servicio se eliminó correctamente.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#008fd5'
            });

          },

          error: (error) => {

            console.error('Error al eliminar:', error);

            // ❌ Mensaje de error
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el servicio.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#008fd5'
            });

          }

        });

    });
  }

  exportarPDF(servicio: any): void {
    //this.servicioSeleccionado = servicio.idServicio;
    const doc = new jsPDF();
    // ========================= // IMAGEN // =========================
    const imagen = new Image();

    imagen.src = 'assets/Logo.png';

    imagen.onload = () => {
      console.log('✅ Imagen cargada correctamente');
      console.log('Ancho:', imagen.width);
      console.log('Alto:', imagen.height);

      // ==========================================
      // CREAR CANVAS
      // ==========================================

      const canvas = document.createElement('canvas');

      canvas.width = imagen.naturalWidth;
      canvas.height = imagen.naturalHeight;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        console.error('❌ No se pudo crear el contexto del canvas');
        return;
      }

      // Dibujar imagen en canvas
      ctx.drawImage(
        imagen,
        0,
        0
      );

      // ==========================================
      // CONVERTIR IMAGEN A BASE64
      // ==========================================

      const imagenBase64 = canvas.toDataURL('image/jpeg', 1.0);

      console.log('✅ Imagen convertida a Base64');

      // ==========================================
      // AGREGAR IMAGEN AL PDF
      // ==========================================

      doc.addImage(
        imagenBase64,
        'PNG',
        2,
        2,
        205,
        40
      );

      console.log('✅ Imagen agregada al PDF');

        // ========================= // TÍTULO // =========================
    doc.setFontSize(16);
    doc.text('HOJA DE SERVICIO', 105, 49, { align: 'center' });
    doc.setFontSize(10);
    // ========================= // DATOS DEL SERVICIO // =========================
    // ========================= // FOLIO // =========================
    const datos = [['Folio', servicio.folio ?? '']];
    autoTable(doc, {
      body: datos,
      startY: 45,
      theme: 'grid',
      styles: {
        fontSize: 10
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          textColor: [255, 41, 0],   // Negro
          lineColor: [0, 0, 0],   // Bordes negros
          lineWidth: 0.5,
          cellWidth: 15
        },
        1: {
          cellWidth: 18,
          textColor: [255, 41, 0],   // Negro
          lineColor: [0, 0, 0],   // Bordes negros
          lineWidth: 0.5
        }
      }
    });
    // ========================= // FECHA // =========================
    const datos1 = [['Fecha', this.formatearFecha(servicio.fecha)]];
    autoTable(doc, {
      body: datos1,
      startY: 45,
      theme: 'grid',
      margin: {
        left: 160
      },
      styles: {
        fontSize: 10
      },
      columnStyles: {
        0: {
          fontStyle: 'bold',
          textColor: [255, 41, 0],   // Negro
          lineColor: [0, 0, 0],   // Bordes negros
          lineWidth: 0.5,
          cellWidth: 15
        },
        1: {
          cellWidth: 25,
          textColor: [255, 41, 0],   // Negro
          lineColor: [0, 0, 0],   // Bordes negros
          lineWidth: 0.5
        }
      }
      // ========================= // FECHA // =========================


    });

    // ========================= // DATOS CLIENTES // =========================
    doc.setFontSize(16);
    doc.text('DATOS DEL CLIENTE', 105, 60, { align: 'center' });
    doc.setFontSize(10);

    const datos3 = [
      ['NOMBRE', servicio.nombre ?? ''],
      ['TELEFONO', servicio.telefono ?? ''],
      ['CONTRASEÑA', servicio.pass ?? '']
    ];
    autoTable(doc, {
      body: datos3,
      startY: 63,
      theme: 'grid',
      styles: { fontSize: 10 },
      columnStyles: {
        0:
        {
          fontStyle: 'bold',
          textColor: [0, 0, 0],   // Negro
          lineColor: [0, 0, 0],   // Bordes negros
          lineWidth: 0.5,
          cellWidth: 40
        },
        1: {
          textColor: [0, 0, 0],   // Negro
          lineColor: [0, 0, 0],   // Bordes negros
          lineWidth: 0.5,
          cellWidth: 140
        }
      }
    });

    // ========================= // DATOS DEL EQUIPO // =========================
    doc.setFontSize(16);
    doc.text('DATOS DEL EQUIPO', 105, 95, { align: 'center' });
    doc.setFontSize(10);

    const datos4 = [[
      servicio.tipo ?? '',
      servicio.marca ?? '',
      servicio.modelo ?? '',
      servicio.serie ?? '',
      servicio.cables ?? ''
    ]];

    autoTable(doc, {
      head: [[
        'TIPO',
        'MARCA',
        'MODELO',
        'NUMERO DE SERIE',
        'CABLES'
      ]],

      body: datos4,

      startY: 98,

      theme: 'grid',

      styles: {
        fontSize: 10,
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        halign: 'center',
        valign: 'middle'
      },

      headStyles: {
        fontStyle: 'bold',
        fillColor: [255, 255, 255], // Fondo blanco
        textColor: [0, 0, 0],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
        halign: 'center'
      },

      columnStyles: {
        0: {
          cellWidth: 20
        },
        1: {
          cellWidth: 35
        },
        2: {
          cellWidth: 35
        },
        3: {
          cellWidth: 50
        },
        4: {
          cellWidth: 40
        }
      }
    });


    // ========================= FALLA REPORTADA =========================
    doc.setFontSize(16);
    doc.text('FALLA REPORTADA', 105, 122, { align: 'center' });
    doc.setFontSize(10);

    const datosProblemas: RowInput[] = [
      [
        {
          content: 'EQUIPOS DE COMPUTO',
          colSpan: 2,
          styles: {
            halign: 'center',
            fontStyle: 'bold',
            textColor: [0, 0, 0],
            fillColor: [255, 255, 255]
          }
        },
        {
          content: 'IMPRESORAS',
          colSpan: 2,
          styles: {
            halign: 'center',
            fontStyle: 'bold',
            textColor: [0, 0, 0],
            fillColor: [255, 255, 255]
          }
        }
      ],

      [
        'NO ENCIENDE',
        'BLOQUEO O LENTITUD',
        'NO JALA LAS HOJAS',
        'JALA MAS DE UNA HOJA'
      ],

      [
        'SE REINICIA',
        'PROBLEMAS DE VIRUS',
        'IMPRIME CON MANCHAS',
        'NO IMPRIME'
      ],

      [
        'SIN SEÑAL DE VIDEO O PANTALLA DAÑADA',
        'TECLADO DAÑADO',
        'NO ENCIENDE',
        'ARRUGA / ATORA LAS HOJAS'
      ],

      [
        'PROBLEMAS DE HARDWARE',
        'PROBLEMAS DE SOFTWARE',
        'ERROR EN EL PANEL DE CONTROL',
        'PROBLEMAS DE CARTUCHOS / TONER'
      ]
    ];

    autoTable(doc, {
      body: datosProblemas,

      startY: 125,

      margin: {
        left: 15,
        right: 15
      },

      tableWidth: 180,

      theme: 'grid',

      styles: {
        fontSize: 7,
        font: 'helvetica',
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,

        // MUY IMPORTANTE
        cellPadding: {
          top: 3,
          right: 2,
          bottom: 3,
          left: 9
        },

        valign: 'top',
        halign: 'left'
      },

      columnStyles: {
        0: {
          cellWidth: 45
        },
        1: {
          cellWidth: 45
        },
        2: {
          cellWidth: 45
        },
        3: {
          cellWidth: 45
        }
      },

      didDrawCell: (data) => {

        // No dibujar casillas en los encabezados
        if (data.section !== 'body' || data.row.index === 0) {
          return;
        }

        const checkboxSize = 4;

        // Posición de la casilla
        const x = data.cell.x + 2;

        // Casilla arriba de la celda
        const y = data.cell.y + 3;

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);

        // Dibujar cuadrado
        doc.rect(
          x,
          y,
          checkboxSize,
          checkboxSize
        );

        // =========================
        // MARCAR SEGÚN SQL SERVER
        // =========================

        let marcado = false;

        switch (data.row.index) {

          case 1:
            if (data.column.index === 0) marcado = !!(
              servicio.noenciende === true ||
              servicio.noenciende === 1 ||
              servicio.noenciende === '1'
            );

            if (data.column.index === 1) marcado = !!(
              servicio.bloqueo === true ||
              servicio.bloqueo === 1 ||
              servicio.bloqueo === '1'
            );

            if (data.column.index === 2) marcado = !!(
              servicio.nojalas === true ||
              servicio.nojalas === 1 ||
              servicio.nojalas === '1'
            );

            if (data.column.index === 3) marcado = !!(
              servicio.jalamas === true ||
              servicio.jalamas === 1 ||
              servicio.jalamas === '1'
            );
            break;

          case 2:
            if (data.column.index === 0) marcado = !!(
              servicio.reinicia === true ||
              servicio.reinicia === 1 ||
              servicio.reinicia === '1'
            );

            if (data.column.index === 1) marcado = !!(
              servicio.problemasvirus === true ||
              servicio.problemasvirus === 1 ||
              servicio.problemasvirus === '1'
            );

            if (data.column.index === 2) marcado = !!(
              servicio.imprimemancha === true ||
              servicio.imprimemancha === 1 ||
              servicio.imprimemancha === '1'
            );

            if (data.column.index === 3) marcado = !!(
              servicio.noimprime === true ||
              servicio.noimprime === 1 ||
              servicio.noimprime === '1'
            );
            break;

          case 3:
            if (data.column.index === 0) marcado = !!(
              servicio.sinsenial === true ||
              servicio.sinsenial === 1 ||
              servicio.sinsenial === '1'
            );

            if (data.column.index === 1) marcado = !!(
              servicio.teclado === true ||
              servicio.teclado === 1 ||
              servicio.teclado === '1'
            );

            if (data.column.index === 2) marcado = !!(
              servicio.noenciendeimpresora === true ||
              servicio.noenciendeimpresora === 1 ||
              servicio.noenciendeimpresora === '1'
            );

            if (data.column.index === 3) marcado = !!(
              servicio.arrugaoatora === true ||
              servicio.arrugaoatora === 1 ||
              servicio.arrugaoatora === '1'
            );
            break;

          case 4:
            if (data.column.index === 0) marcado = !!(
              servicio.problemashardware === true ||
              servicio.problemashardware === 1 ||
              servicio.problemashardware === '1'
            );

            if (data.column.index === 1) marcado = !!(
              servicio.problemassoftware === true ||
              servicio.problemassoftware === 1 ||
              servicio.problemassoftware === '1'
            );

            if (data.column.index === 2) marcado = !!(
              servicio.errorenelpanel === true ||
              servicio.errorenelpanel === 1 ||
              servicio.errorenelpanel === '1'
            );

            if (data.column.index === 3) marcado = !!(
              servicio.problemasdecartuchos === true ||
              servicio.problemasdecartuchos === 1 ||
              servicio.problemasdecartuchos === '1'
            );
            break;
        }

        // =========================
        // DIBUJAR X
        // =========================

        if (marcado) {

          doc.setLineWidth(0.7);

          // Primera diagonal
          doc.line(
            x + 1,
            y + 1,
            x + checkboxSize - 1,
            y + checkboxSize - 1
          );

          // Segunda diagonal
          doc.line(
            x + checkboxSize - 1,
            y + 1,
            x + 1,
            y + checkboxSize - 1
          );
        }
      }
    });

    // ========================= // OTROS // =========================

    doc.setFontSize(10);
    doc.setFontSize(10);

    doc.text('Otros (Describa):', 20, 180);

    doc.text(servicio.otros || '', 50, 180);

    doc.text('___________________________________________________________________________',
      47, 180
    );
    doc.setFontSize(10);

    // ========================= // SERVICIOS // =========================

    doc.setFontSize(16);
    doc.text('SERVICIOS',
      105, 188, { align: 'center' });
    doc.setFontSize(10);

    const Serviciosproblemas: RowInput[] = [

      [
        'MANTENIMIENTO PREVENTIVO/CORRECTIVO',
        'RESTAURACION DE SISTEMA OPERATIVA',
        'INSTALACION/ACTUALIZACION DE PROGRAMAS',
        'INSTALACION DE ANTIVIRUS',
        'RESPALDO DE INFORMACION'
      ]
    ];

    autoTable(doc, {
      body: Serviciosproblemas,

      startY: 190,

      margin: {
        left: 15,
        right: 15
      },

      tableWidth: 180,

      theme: 'grid',

      styles: {
        fontSize: 4.8,
        font: 'helvetica',
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
        lineColor: [0, 0, 0],
        lineWidth: 0.5,

        // MUY IMPORTANTE
        cellPadding: {
          top: 3,
          right: 2,
          bottom: 3,
          left: 9
        },

        valign: 'top',
        halign: 'left'
      },

      columnStyles: {
        0: {
          cellWidth: 36
        },
        1: {
          cellWidth: 36
        },
        2: {
          cellWidth: 36
        },
        3: {
          cellWidth: 36
        },
        4: {
          cellWidth: 36
        }
      },

      didDrawCell: (data) => {

        // No dibujar casillas en los encabezados
        if (data.section !== 'body') {
          return;
        }

        const checkboxSize = 4;

        // Posición de la casilla
        const x = data.cell.x + 2;

        // Casilla arriba de la celda
        const y = data.cell.y + 3;

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);

        // Dibujar cuadrado
        doc.rect(
          x,
          y,
          checkboxSize,
          checkboxSize
        );

        // =========================
        // MARCAR SEGÚN SQL SERVER
        // =========================

        let marcado = false;

        switch (data.column.index) {

          case 0:
            marcado = (
              servicio.mantenimiento === true ||
              servicio.mantenimiento === 1 ||
              servicio.mantenimiento === '1'
            );
            break;

          case 1:
            marcado = (
              servicio.restauracion === true ||
              servicio.restauracion === 1 ||
              servicio.restauracion === '1'
            );
            break;

          case 2:
            marcado = (
              servicio.instalacion === true ||
              servicio.instalacion === 1 ||
              servicio.instalacion === '1'
            );
            break;

          case 3:
            marcado = (
              servicio.instalacionvirus === true ||
              servicio.instalacionvirus === 1 ||
              servicio.instalacionvirus === '1'
            );
            break;

          case 4:
            marcado = (
              servicio.respaldo === true ||
              servicio.respaldo === 1 ||
              servicio.respaldo === '1'
            );
            break;

        }

        // =========================
        // DIBUJAR X
        // =========================

        if (marcado) {

          doc.setLineWidth(0.7);

          // /
          doc.line(
            x + 1,
            y + 1,
            x + checkboxSize - 1,
            y + checkboxSize - 1
          );

          // \
          doc.line(
            x + checkboxSize - 1,
            y + 1,
            x + 1,
            y + checkboxSize - 1
          );
        }
      }
    });

    // ========================= // OTROS SERVICIOS// =========================

    doc.setFontSize(10);

    doc.text('Otros (Describa):', 20, 206);

    doc.text(servicio.otrosservicios || '', 50, 206);

    doc.text('___________________________________________________________________________',
      47, 206
    );


    // ========================= // DIAGNOSTICO // =========================
    doc.setFontSize(16);
    doc.text('DIAGNOSTICO', 105, 213, { align: 'center' });
    doc.setFontSize(10);

    // =========================
    // RECTÁNGULO DE FONDO
    // =========================

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);

    doc.rect(
      15,   // X
      215,  // Y
      180,  // Ancho
      10    // Alto
    );

    // =========================
    // DATOS ENCIMA DEL RECTÁNGULO
    // =========================

    doc.text(
      servicio.diagnosticos || '',
      20,
      222
    );
    // ========================== ACUERDO ===========================================


    doc.setFontSize(8);
    doc.setTextColor(255, 0, 0);
    doc.text('Toda revisión cuyo mantenimiento no sea autorizado tendrá un costo $150.00', 15, 228);
    doc.text('El cliente acepta ser el propietario legitimo del equipo que deja para su reparación.', 15, 231);
    doc.text('Para entregar el equipo es necesario entregar esta hoja.', 15, 234);

    doc.text('Después de 30 días de reparado y/o entregada la cotizacion de mantenimiento se cobra $10.00/ dia transcurrido + IVA por el almacenamiento.', 15, 237);
    doc.text('Después de 90 días de reparado y/o entregada la cotizacion de mantenimiento el equipo pasara a ser propiedad de ASESCOMP', 15, 240);
    doc.text('Las reparaciones tiene garantía limitada de 6 meses y son válidas en las oficinas de ASESCOMP, salvo que indique lo contrario por escrito ', 15, 243);
    doc.text('el cliente y/o responsable del equipo acepta haber leído la presente hoja de servicio y acepta las condiciones expresadas en su totalidad.', 15, 246);
    doc.text('Las piezas facturadas como  "A cambio", no se podrán entregar al cliente bajo ninguna consideración', 15, 249);


    //===================================== FIRMA DE NOSOTROS ========================================================================
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 255);
    doc.text('Recibió equipo', 25, 260);
    doc.setTextColor(0, 0, 0);
    doc.text('________________________', 15, 268);

    //===================================== FIRMA DE CLIENTE ========================================================================
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 255);
    doc.text('Entegó equipo', 125, 260);
    doc.setTextColor(0, 0, 0);
    doc.text('________________________', 115, 268);


    // ========================= // VER PDF EN NAVEGADOR // =========================
    doc.output('dataurlnewwindow');
    };
    imagen.onerror = () => {

      console.error('❌ NO SE PUDO CARGAR LA IMAGEN:', imagen.src);

    }



  }
}

