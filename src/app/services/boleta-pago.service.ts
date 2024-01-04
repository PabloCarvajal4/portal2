import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BoletaPagoService {
  url = 'http://10.10.0.30:8082/api';
  apiUrl= 'https://localhost:7097/api/';

  constructor(private http: HttpClient) { }

  obtenerBoleta(codigo_colaborador: string): Observable<any> {
    return this.http.get(this.url + '/Boleta_Pago/comprobante_colaborador?codigo=' + codigo_colaborador);
  }

  obtenerBoletaId(codigo: string, periodo:string, periodo_fin:string): Observable<any> {
    return this.http.get(this.url + '/Boleta_Pago/boletaPago-colaborador?codigo=' + codigo + '&periodo=' + periodo + '&periodo_fin=' + periodo_fin);
  }

  filtrarBoletas(codigo_colaborador: number, fechaInicio?: string, fechaFin?: string): Observable<any> {
    return this.http.get( this.url+`/Boleta_Pago/filtrar?codigo=${codigo_colaborador}&periodo=${fechaInicio}&periodo_fin=${fechaFin}`);
    
  }

  obtenerDeducciones(codigo: string, periodo:number, periodo_fin:number): Observable<any> {
    return this.http.get(this.url + `/Boleta_Pago/deducciones?codigo=${codigo}&mes=${periodo}&anio=${periodo_fin}`);
  }
}
