import { HttpClient } from '@angular/common/http';
import { Component, inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Services {
   private http = inject(HttpClient);

  private apiUrl = 'https://localhost:7066/api/LoginsMaster/login';

  login(nombre: string, pass: string) {

    return this.http.post(this.apiUrl, {
      nombre: nombre,
      pass: pass
    });

  }
}
