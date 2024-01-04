import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Constancias } from '../models/contancias';

@Injectable({
  providedIn: 'root'
})
export class ConstanciasService {
  url = 'http://10.10.0.30:8082/api';
  constructor(private http: HttpClient) { }

  getConstancias(pais: string): Observable<any>{
    return this.http.get(this.url + '/Constancias/constancias-generadas?pais=' + pais)
  }

  getConstanciasNuevas(): Observable<any>{
    return this.http.get(this.url + '/Constancias/constancias-nuevas')
  }

  getConstanciasVerificadas(): Observable<any>{
    return this.http.get(this.url + '/Constancias/constancias-verificadas')
  }

  getConstanciaId(id: number): Observable<any>{
    return this.http.get(this.url + '/Constancias/' + id)
  }

  guardarConstancia(constancia: Constancias): Observable<any> {
    return this.http.post(this.url + '/Constancias', constancia);
  }
  
  guardarConstanciaArchivo(constancia: Constancias): Observable<any> {
    return this.http.post(this.url + '/Constancias/archivo', constancia);
  }

  actualizarConstanciaArchivo(constancia: Constancias): Observable<any> {
    return this.http.post(this.url + '/Constancias/guardar-constancias', constancia);
  }

  getMaxValorConstancia(): Observable<any> {
    return this.http.get(this.url + '/Constancias/MaxValor');
  }

  getMaxConstancia(tipo_constancia: string): Observable<any> {
    return this.http.get(this.url + '/Constancias/constanciaMaxValor?tipoConstancia=' + tipo_constancia);
  }

  ActualizarConstancia(constancia_id: number,constancia: Constancias): Observable<any> {
    return this.http.put(this.url + `/Constancias/archivo/`+constancia_id, constancia);
  }

  getFecha(id: number): Observable<any>{
    return this.http.get(this.url + '/Constancias/fecha?codigo=' + id)
  }
  obtenerImagen(nombreArchivo: string): Observable<Blob> {
    const url = `${this.url}/Constancias/imagen/${nombreArchivo}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
