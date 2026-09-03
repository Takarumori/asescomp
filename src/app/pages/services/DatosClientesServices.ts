import { HttpClient } from '@angular/common/http';
import { Component, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatosClientesServices {
   private http = inject(HttpClient);

  private apiUrl =
    'https://api.asescomp.com/api/DatosClientesMaster';

  obtenerClientes(): Observable<any[]> {

    return this.http.get<any[]>(this.apiUrl);
  }

}
