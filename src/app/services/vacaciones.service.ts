import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VacacionesService {
  url = 'http://10.10.0.30:8082/api';

  constructor(private http: HttpClient) { }
  obtenerVacaciones(codigo_colaborador: number): Observable<any> {
    return this.http.get(this.url + '/ConsultaVacaciones/codigo_colaborador?codigo=' + codigo_colaborador);
  }

  filtrarVacaciones(codigo_colaborador: string, fechaInicio?: string, fechaFin?: string): Observable<any> {
    return this.http.get( this.url+`/ConsultaVacaciones/filtrar?noEmple=${codigo_colaborador}&fechaInicio=${fechaInicio}&fechaFinal=${fechaFin}`);
    
  }

}
