import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Colaborador } from '../models/colaborador';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class ColaboradorService {
  url = 'http://10.10.0.30:8082/api';
apiKey = '4ed916a14a4f52975372ab194dc6deeb';
  constructor(private http: HttpClient) { }

  getColaboradores(): Observable<any> {
    return this.http.get(this.url + '/Colaboradores');
  }

  getCumpleaneros(fecha: string): Observable<any> {
    return this.http.get(this.url + '/Colaboradores/cumpleaneros?fechaEspecifica=' + fecha);
  }

  getCumpleanio(codigo: number,fecha: string): Observable<any> {
    return this.http.get(this.url + '/Colaboradores/cumpleanio?codigo=' + codigo + '&fecha=' + fecha);
  }

  getAniversario(fecha: string, codigo: number): Observable<any> {
    return this.http.get( this.url + '/Colaboradores/aniversario?codigo=' + codigo + '&fecha=' + fecha);
  }

  guardarColaborador(colaborador: Colaborador): Observable<any> {
    return this.http.post(this.url + '/Colaboradores', colaborador);
  }

  actualizarFotografia(codigo_colaborador: number,colaborador: Colaborador): Observable<any>{
    return this.http.put(this.url + '/Colaboradores/' + codigo_colaborador + '/ActualizarFotografia', colaborador)
  }

  eliminarColaborador(id: string): Observable<any> {
    return this.http.delete(this.url +  '/Colaboradores/' + id);
  }
  
  obtenerColaborador(codigo_colaborador: number): Observable<any> {
    return this.http.get(this.url + '/Colaboradores/colaborador-credencial?codigo=' + codigo_colaborador);
  }
  obtenerColaboradorPs(codigo_colaborador: number): Observable<any> {
    return this.http.get(this.url + '/cambio-password/' + codigo_colaborador);
  }

  obtenerColaboradoresArea(area: string): Observable<any> {
    return this.http.get(this.url + '/Colaboradores/por-area?departamento=' + area);
  }

  getWeather(lat: string, lon: string): Observable<any> {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=c8948c69065cbccf5c8c4a18b803e8c9`;

    return this.http.get(apiUrl);
  }

  obtenerImagen(nombreArchivo: string): Observable<Blob> {
    const url = `${this.url}/Colaboradores/imagen/${nombreArchivo}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
