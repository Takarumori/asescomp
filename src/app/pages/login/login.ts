import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Services } from '../services/services';
@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private loginService = inject(Services);
  nombre: string = '';
  pass: string = '';

  recordar: boolean = false;
  mostrarPassword: boolean = false;
  cargando: boolean = false;

  constructor(
    private router: Router,

  ) { }



iniciarSesion(): void {

  // Validar campos vacíos
  if (!this.nombre || !this.pass) {

    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Ingresa usuario y contraseña'
    });

    return;
  }

  this.cargando = true;

  this.loginService
    .login(this.nombre, this.pass)
    .subscribe({

      next: (respuesta: any) => {


        this.cargando = false;

        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Inicio de sesión correcto',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {

          this.router.navigateByUrl('/dasboard');

        });

      },

      error: (error) => {


        this.cargando = false;

        Swal.fire({
          icon: 'error',
          title: 'Acceso denegado',
          text: 'Usuario o contraseña incorrectos'
        });

      }

    });
}
}
