import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-headers',
  imports: [CommonModule, RouterOutlet, RouterLink,
    RouterLinkActive],
  templateUrl: './headers.html',
  styleUrl: './headers.css',
})


export class Headers {
  constructor(private router: Router) { }
  menuAbierto = true;
  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarSesion(): void {
    Swal.fire({
      title: "¿Cerrar sesión?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar"
    }).then((result) => {

      if (result.isConfirmed) {
        this.router.navigateByUrl('/login');
      }

    });


  }

}
