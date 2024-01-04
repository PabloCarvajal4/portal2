import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Sugerencia } from '../models/sugerencia';

@Injectable({
  providedIn: 'root'
})
export class SugerenciasService {
  url = 'http://10.10.0.30:8082/api';
  constructor(private http: HttpClient) { }

  guardarIncapacidad(sugerencia: Sugerencia): Observable<any> {
    return this.http.post(this.url + '/Sugerencias', sugerencia);
  }

  getMaxIncapacidad(): Observable<any> {
    return this.http.get(this.url + '/Sugerencias/MaxValor');
  }

  getSugerencias(): Observable<any>{
    return this.http.get(this.url + '/Sugerencias')
  }
  
  getSugerenciaCategoria(categoria: string): Observable<any>{
    return this.http.get(this.url + '/Sugerencias/sugerencia-categoria?categoria=' + categoria);
  }

  deleteSugerenciaCategoria(mensaje_id: number): Observable<any>{
    return this.http.delete(this.url + '/Sugerencias/' + mensaje_id);
  }
}
