import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Solicitudes } from '../models/solicitudes';
import { Vacaciones } from '../models/vacaciones';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  url = 'http://10.10.0.30:8082/api';
  constructor(private http: HttpClient) { }

  getSolicitudes(departamento: string, pais: string): Observable<any> {
    return this.http.get(this.url + '/ConsultaSolicitudes/solicitud-colaborador?nombreDepartamento=' + departamento + '&pais=' + pais);
  }

  getSolicitudesGenerales(pais: string): Observable<any> {
    return this.http.get(this.url + '/ConsultaSolicitudes/solicitudes-pais?pais=' + pais);
  }

  getSolicitudesResueltas(pais:string):Observable<any>{
    return this.http.get(this.url + '/ConsultaSolicitudes/solicitudes-resueltas?pais=' + pais)
  }

  getSolicitudesResueltasCategoria(id: number, pais:string):Observable<any>{
    return this.http.get(this.url + '/ConsultaSolicitudes/solicitudes-resueltas-categoria?categoria=' + id + '&pais=' + pais)
  }

  getSolicitud(codigo: number): Observable<any> {
    return this.http.get(this.url + '/ConsultaSolicitudes/' + codigo);
  }

  obtenerSolicitudes(codigo_colaborador: number): Observable<any> {
    return this.http.get(this.url + '/ConsultaSolicitudes/por-codigo?codigo=' + codigo_colaborador);
  }

  getMaxSolicitud(): Observable<any> {
    return this.http.get(this.url + '/ConsultaSolicitudes/MaxValor');
  }
  guardarSolicitud(solicitud: Solicitudes): Observable<any> {
    return this.http.post(this.url + '/ConsultaSolicitudes', solicitud);
  }

  enviarSolicitud(solicitud: Solicitudes): Observable<any> {
    return this.http.post(this.url + '/ConsultaSolicitudes', solicitud);
  }

  ActualizarSolicitud(consulta_id: number,solicitudes: Solicitudes): Observable<any> {
    return this.http.put(this.url + `/ConsultaSolicitudes/`+consulta_id, solicitudes);
  }

  eliminarColaborador(id: string): Observable<any> {
    return this.http.delete(this.url +  '/ConsultaSolicitudes/' + id);
  }
  
  obtenerColaborador(codigo_colaborador: number): Observable<any> {
    return this.http.get(this.url + '/ConsultaSolicitudes/' + codigo_colaborador);
  }

  agregarVacaciones(vacaciones: Vacaciones): Observable<any> {
    return this.http.post(this.url + '/ConsultaVacaciones', vacaciones);
  }

  getMaxVacaciones(): Observable<any> {
    return this.http.get(this.url + '/ConsultaVacaciones/MaxValor');
  }
}
