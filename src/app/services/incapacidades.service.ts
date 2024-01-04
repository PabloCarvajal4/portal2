import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Incapacidades } from '../models/incapacidades';

@Injectable({
  providedIn: 'root'
})
export class IncapacidadesService {
  url = 'http://10.10.0.30:8082/api';
  constructor(private http: HttpClient) { }

  getIncapacidades(pais: string): Observable<any>{
    return this.http.get(this.url + '/Incapacidades/incapacidad-colaborador?pais=' + pais);
  }

  getIncapacidadesAsc(pais: string): Observable<any>{
    return this.http.get(this.url + '/Incapacidades/incapacidad-colaborador-Asc?pais=' + pais);
  }

  getIncapacidadesDesc(pais: string): Observable<any>{
    return this.http.get(this.url + '/Incapacidades/incapacidad-colaborador-Desc?pais=' + pais);
  }

  getIncapacidad(id: number): Observable<any>{
    return this.http.get(this.url + '/Incapacidades/' + id);
  }
  
  guardarIncapacidad(incapacidad: Incapacidades): Observable<any> {
    return this.http.post(this.url + '/Incapacidades', incapacidad);
  }

  deleteIncapacidad(id: number): Observable<any>{
    return this.http.delete(this.url + '/Incapacidades/' + id);
  }

  guardarIncapacidadArchivo(incapacidad: Incapacidades): Observable<any> {
    return this.http.post(this.url + '/Incapacidades/Guardar-Archivo', incapacidad);
  }

  public postIncapacidadesArchivo(incapacidades: FormData): Observable<any> {
    return this.http.post<any>(`${this.url}/Guardar-Archivo`, incapacidades);
  }

  subirArchivo(incapacidades_id?: number, codigo_colaborador?:number, infotipo?: number, tipo_incapacidad?:string, fecha_inicio?:Date, fecha_final?: Date, diagnostico?: string, fecha_notificacion?:Date, archivo?:string, fecha_creacion?:Date, fecha_modificacion?:Date, usuario_creo?:number, usuario_cambio?:number): Observable<any> {
    const url = `${this.url}/Incapacidades/archivo?incapacidades_id=${incapacidades_id}&codigo_colaborador=${codigo_colaborador}&infotipo=${infotipo}&tipo_incapacidad=${tipo_incapacidad}&fecha_inicio=${fecha_inicio}&fecha_final=${fecha_final}&diagnostico=${diagnostico}&fecha_notificacion=${fecha_notificacion}&archivo=${archivo}&fecha_creacion=${fecha_creacion}&fecha_modificacion=${fecha_modificacion}&usuario_creo=${usuario_creo}&usuario_cambio=${usuario_cambio}`;

    // Realiza la solicitud POST a la URL construida
    return this.http.post(url, {});
  }

  getMaxIncapacidad(): Observable<any> {
    return this.http.get(this.url + '/Incapacidades/MaxValor');
  }

  guardarIncapacidadFile(incapacidades: Incapacidades, archivo: File): Observable<Incapacidades> {
    const formData = new FormData();
    formData.append('ARCHIVO', archivo);
    formData.append('INCAPACIDADES_ID', incapacidades.incapacidadeS_ID.toString());
    formData.append('CODIGO_COLABORADOR', incapacidades.codigO_COLABORADOR.toString());
    formData.append('INFOTIPO', incapacidades.infotipo.toString());
    formData.append('TIPO_INCAPACIDAD', incapacidades.tipO_INCAPACIDAD);
    formData.append('FECHA_INICIO', incapacidades.fechA_INICIO.toISOString());
    formData.append('FECHA_FINAL', incapacidades.fechA_FINAL.toISOString());
    formData.append('DIAGNOSTICO', incapacidades.diagnostico);
    formData.append('FECHA_NOTIFICACION', incapacidades.fechA_NOTIFICACION.toISOString());
    formData.append('FECHA_CREACION', incapacidades.fechA_CREACION.toISOString());
    formData.append('FECHA_MODIFICACION', incapacidades.fechA_MODIFICACION.toISOString());
    formData.append('USUARIO_CREO', incapacidades.usuariO_CREO.toString());
    formData.append('USUARIO_CAMBIO', incapacidades.usuariO_CAMBIO.toString());

    const headers = new HttpHeaders();
    // No es necesario configurar el encabezado Content-Type al usar FormData

    return this.http.post<Incapacidades>(`${this.url}/Incapacidades/Guardar-Archivo`, formData, { headers });
  }

  obtenerArchivo(nombreArchivo: string): Observable<Blob> {
    const url = `${this.url}/Incapacidades/imagen/${nombreArchivo}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
