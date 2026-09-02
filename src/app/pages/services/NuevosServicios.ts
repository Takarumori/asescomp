import { HttpClient } from '@angular/common/http';
import { Component, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NuevosServicios {

  private http = inject(HttpClient);

  private apiUrl =
    'https://localhost:7066/api/NuevossServiciosMaster';

  obtenerClientes(): Observable<any[]> {

    return this.http.get<any[]>(this.apiUrl);
  }

  guardarServicio(servicio: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, servicio);
  }
  actualizarServicio(id: number, servicio: any) {
    return this.http.put(
      `${this.apiUrl}/${id}`,
      servicio
    );
  }

  eliminarServicio(id: number) {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }

}
