import { Component, inject, Inject, OnInit } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NuevosServicios } from '../services/NuevosServicios';
import { AlertaDialog } from '../alerta-dialog/alerta-dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-nuevoservicios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './nuevoservicios.html',
  styleUrl: './nuevoservicios.css',
})
export class Nuevoservicios implements OnInit {
  folio: number = 0;
  fecha: string = '';
  guardando = false;
  modoEdicion: boolean = false;
  idservicio: number | null = null;
  readonly dialogRef = inject(MatDialogRef<Nuevoservicios>);
  private nuevosServicios = inject(NuevosServicios);
  private dialog = inject(MatDialog);


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    if (data?.servicio) {

      this.modoEdicion = true;

      this.idservicio = data.servicio.idservicio;

      this.servicio = {
        ...this.servicio,
        ...data.servicio
      };

    }
  }

  ngOnInit(): void {

    if (this.modoEdicion) {

      // Mantener datos originales
      this.folio = this.servicio.folio;

      this.fecha = this.servicio.fecha;

    } else {

      // Nuevo servicio
      this.generarFolio();
      this.generarFecha();

    }

  }


  servicio = {
    folio: 0,
    fecha: '',

    nombre: '',
    telefono: '',
    correo: '',
    pass: '',

    tipo: '',
    marca: '',
    modelo: '',
    serie: '',
    cables: '',

    noenciende: false,
    bloqueo: false,
    reinicia: false,
    problemasvirus: false,
    sinsenial: false,
    teclado: false,
    problemashardware: false,
    problemassoftware: false,

    nojalas: false,
    jalamas: false,
    imprimemancha: false,
    noimprime: false,
    noenciendeimpresora: false,
    arrugaoatora: false,
    errorenelpanel: false,
    problemasdecartuchos: false,

    otros: '',

    mantenimiento: false,
    restauracion: false,
    instalacion: false,
    instalacionvirus: false,
    respaldo: false,

    otrosservicios: '',
    diagnosticos: ''
  };

  guardar(): void {

    // ============================================
    // VALIDAR CAMPOS OBLIGATORIOS
    // ============================================

    const camposFaltantes: string[] = [];

    if (!this.servicio.nombre.trim()) {
      camposFaltantes.push('Nombre completo');
    }

    if (!this.servicio.telefono.trim()) {
      camposFaltantes.push('Teléfono');
    }

    if (!this.servicio.correo.trim()) {
      camposFaltantes.push('Correo');
    }

    if (!this.servicio.pass.trim()) {
      camposFaltantes.push('Contraseña');
    }

    if (!this.servicio.tipo.trim()) {
      camposFaltantes.push('Tipo de equipo');
    }

    if (!this.servicio.marca.trim()) {
      camposFaltantes.push('Marca');
    }

    if (!this.servicio.modelo.trim()) {
      camposFaltantes.push('Modelo');
    }

    if (!this.servicio.serie.trim()) {
      camposFaltantes.push('Número de serie');
    }

    if (!this.servicio.cables.trim()) {
      camposFaltantes.push('Cables');
    }

    if (!this.servicio.diagnosticos.trim()) {
      camposFaltantes.push('Diagnóstico');
    }


    // ============================================
    // SI FALTAN CAMPOS
    // ============================================

    if (camposFaltantes.length > 0) {

      this.dialog.open(AlertaDialog, {
        width: '400px',
        data: {
          campos: camposFaltantes
        }
      });

      return;
    }


    // ============================================
    // PREPARAR DATOS PARA NUEVO SERVICIO
    // ============================================

    if (!this.modoEdicion) {

      this.servicio.folio = this.folio;

      this.servicio.fecha = new Date().toISOString();

    }


    // ============================================
    // ACTIVAR LOADING
    // ============================================

    this.guardando = true;


    console.log(
      this.modoEdicion
        ? 'Modificando servicio:'
        : 'Guardando servicio:',
      this.servicio
    );


    // ============================================
    // MODIFICAR
    // ============================================

    if (this.modoEdicion && this.idservicio !== null) {
      console.time('TIEMPO MODIFICAR');
      this.nuevosServicios
        .actualizarServicio(
          this.idservicio,
          this.servicio
        )
        .subscribe({

          next: (respuesta) => {
            console.timeEnd('TIEMPO MODIFICAR');
            console.log(
              'Servicio modificado correctamente:',
              respuesta
            );
            //window.location.reload();
            this.guardando = false;
            this.dialogRef.close(respuesta);

            Swal.fire({
              icon: 'success',
              title: '¡Modificado exitosamente!',
              text: 'El servicio se modificó correctamente.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#008fd5'
            }).then(() => {

              this.dialogRef.close(respuesta);

            });
          },

          error: (error) => {
            console.timeEnd('TIEMPO MODIFICAR');
            console.error(
              'Error al modificar:',
              error
            );

            // QUITAR LOADING
            this.guardando = false;


            Swal.fire({
              icon: 'error',
              title: 'Error al modificar',
              text: 'No se pudo modificar el servicio.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#d33'
            });

          }

        });

      return;
    }


    // ============================================
    // NUEVO SERVICIO
    // ============================================
    console.time('TIEMPO GUARDAR');
    this.nuevosServicios
      .guardarServicio(this.servicio)
      .subscribe({

        next: (respuesta) => {
          console.timeEnd('TIEMPO GUARDAR');
          console.log(
            'Servicio guardado correctamente:',
            respuesta
          );
          //window.location.reload();
          // ✅ AHORA SÍ GUARDAMOS EL ÚLTIMO FOLIO
          localStorage.setItem(
            'ultimoFolio',
            this.servicio.folio.toString()
          );
          this.dialogRef.close(respuesta);

          this.guardando = false;

          Swal.fire({
            icon: 'success',
            title: '¡Guardado exitosamente!',
            text: 'El nuevo servicio se guardó correctamente.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#008fd5'
          }).then(() => {

            this.dialogRef.close(respuesta);

          });

        },

        error: (error) => {
          console.timeEnd('TIEMPO GUARDAR');
          console.error(
            'Error al guardar:',
            error
          );

          // QUITAR LOADING
          this.guardando = false;


          Swal.fire({
            icon: 'error',
            title: 'Error al guardar',
            text: 'No se pudo guardar el servicio.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#d33'
          });

        }

      });

  }

  cancelar(): void {

    this.dialogRef.close();

  }

  generarFolio(): void {

    const ultimoFolio = localStorage.getItem('ultimoFolio');

    if (ultimoFolio !== null) {

      this.folio = Number(ultimoFolio) + 1;

    } else {

      this.folio = 1;

    }

    if (this.folio > 999) {
      this.folio = 1;
    }

    // SOLO asignamos el folio al formulario
    // NO lo guardamos todavía
    this.servicio.folio = this.folio;

  }


  generarFecha(): void {

    const hoy = new Date();

    this.fecha = hoy.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

  }

}
