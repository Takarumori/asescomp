import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Dasboard } from './pages/dasboard/dasboard';
import { Headers } from './pages/headers/headers';
import { Hojaservicios } from './pages/hojaservicios/hojaservicios';
import { Nuevoservicios } from './pages/nuevoservicios/nuevoservicios';

export const routes: Routes = [

  {path: "", redirectTo: "login", pathMatch: "full"},
  {path: "login", component: Login},
  { path: "", component: Headers,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dasboard',
        component: Dasboard
      },

      {
        path: 'hojaservicios',
        component: Hojaservicios
      },
      {
        path : 'nuevoservicios',
        component: Nuevoservicios
      }
    ]
  },

];
