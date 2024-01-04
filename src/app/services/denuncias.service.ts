import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Denuncias } from '../models/denuncias';

@Injectable({
  providedIn: 'root'
})
export class DenunciasService {
  url = 'http://10.10.0.30:8082/api';
  constructor(private http: HttpClient) {}

  getDenuncias(pais : string): Observable<any>{
    return this.http.get(this.url + '/Denuncias/denuncia-colaborador?pais=' + pais)
  }
  
  getDenunciasAsc(pais : string): Observable<any>{
    return this.http.get(this.url + '/Denuncias/denuncia-colaborador-asc?pais=' + pais)
  }

  getDenunciasDesc(pais : string): Observable<any>{
    return this.http.get(this.url + '/Denuncias/denuncia-colaborador-desc?pais=' + pais)
  }

  getDenuncia(id: number): Observable<any>{
    return this.http.get(this.url + '/Denuncias/' + id);
  }

  guardarDenuncia(denuncia: Denuncias): Observable<any> {
    return this.http.post(this.url + '/Denuncias', denuncia);
  }

  getMaxDenuncia(): Observable<any> {
    return this.http.get(this.url + '/Denuncias/MaxValor');
  }

  deleteDenuncia(id: number): Observable<any>{
    return this.http.delete(this.url + '/Denuncias/' + id);
  }

  guardarDenunciaFile(denuncias: Denuncias, archivo: File): Observable<Denuncias> {
    const formData = new FormData();
    formData.append('EVIDENCIA', archivo);
    formData.append('DENUNCIA_ID', denuncias.denunciA_ID.toString());
    formData.append('CODIGO_COLABORADOR', denuncias.codigO_COLABORADOR.toString());
    formData.append('TIPO_DENUNCIA', denuncias.tipO_DENUNCIA);
    formData.append('CONCEPTO', denuncias.concepto);
    formData.append('CENTRO_COSTO', denuncias.centrO_COSTO);
    formData.append('UBICACION', denuncias.ubicacion);
    formData.append('FECHA_OCURRIDO', denuncias.fechA_OCURRIDO.toISOString());
    formData.append('FECHA_CREACION', denuncias.fechA_CREACION.toISOString());
    formData.append('FECHA_MODIFICACION', denuncias.fechA_MODIFICACION.toISOString());
    formData.append('USUARIO_CREO', denuncias.usuariO_CREO.toString());
    formData.append('USUARIO_CAMBIO', denuncias.usuariO_CAMBIO.toString());

    const headers = new HttpHeaders();
    // No es necesario configurar el encabezado Content-Type al usar FormData

    return this.http.post<Denuncias>(`${this.url}/Denuncias/Guardar-Archivo`, formData, { headers });
  }

  obtenerImagen(nombreArchivo: string): Observable<Blob> {
    const url = `${this.url}/Denuncias/imagen/${nombreArchivo}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
