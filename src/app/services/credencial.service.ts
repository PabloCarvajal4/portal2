import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Credencial } from '../models/credencial';
import { Historial_InicioSesion } from '../models/iniciosesion';

@Injectable({
  providedIn: 'root'
})
export class CredencialService {
  url = 'http://10.10.0.30:8082/api';
  user = {
    codigo_colaborador: '',
    contrasena:'',
    estados_id: '1'
  }

  constructor(private http: HttpClient) { }

  getColaboradores(): Observable<any> {
    return this.http.get(this.url + '/Credenciales');
  }

  guardarColaborador(codigo_colaborador: number,credencial: Credencial): Observable<any> {
    return this.http.put(this.url + `/Credenciales/`+codigo_colaborador+'/', credencial);
  }

  eliminarColaborador(id: string): Observable<any> {
    return this.http.delete(this.url +  '/Credenciales/' + id);
  }
  
  obtenerColaborador(codigo_colaborador: number): Observable<any> {
    return this.http.get(this.url + '/Credenciales/' + codigo_colaborador);
  }

  guardarSesion(iniciosesion: Historial_InicioSesion): Observable<any> {
    return this.http.post(this.url + '/Historial_InicioSesion', iniciosesion);
  }

  actualizarSesion(sesion_id: string, iniciosesion: Historial_InicioSesion): Observable<any> {
    return this.http.put(this.url + '/Historial_InicioSesion/' + sesion_id, iniciosesion);
  }

  getMaxSesion(): Observable<any> {
    return this.http.get(this.url + '/Historial_InicioSesion/MaxValor');
  }

  getSesiones(): Observable<any> {
    return this.http.get(this.url + '/Historial_InicioSesion');
  }

  getCredencial(id: number): Observable<any> {
    return this.http.get(this.url +  '/Credenciales/' + id);
  }
}
