import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Correo } from '../models/correo';

@Injectable({
  providedIn: 'root'
})
export class CorreoService {
  url = 'http://10.10.0.30:8082/api';
  private apiUrl = 'http://10.10.0.30:8082/api/email/enviar-con-adjunto';
  private apiUrlImagen = 'http://10.10.0.30:8082/api/email/enviar-con-imagen';
  private apiUrlAutomatico = 'http://10.10.0.30:8082/api/email/enviar-correo-cumpleanio';
  constructor(private http: HttpClient) { }

  enviarCorreo(correo: Correo): Observable<any> {
    return this.http.post(this.url + '/email/enviar', correo);
  }

  enviarCorreoGeneral(correo: Correo): Observable<any> {
    return this.http.post(this.url + '/email/enviar-general', correo);
  }

  enviarCorreoConAdjunto(destinatario: string, asunto: string, pdfData: string, nombreAdjunto: string): Observable<any> {
    const requestData = { destinatario, asunto, pdfData, nombreAdjunto };

    return this.http.post<any>(this.apiUrl, requestData);
  }

  enviarCorreoConAdjuntoImagen(destinatario: string, asunto: string, pdfData: string, nombreAdjunto: string): Observable<any> {
    const requestData = { destinatario, asunto, pdfData, nombreAdjunto };

    return this.http.post<any>(this.apiUrlImagen, requestData);
  }

  enviarCorreoConAdjuntoAutomatico(destinatario: string, asunto: string, pdfData: string, nombreAdjunto: string): Observable<any> {
    const requestData = { destinatario, asunto, pdfData, nombreAdjunto};

    return this.http.post<any>(this.apiUrlAutomatico, requestData);
  }

  enviarCorreoAutomatico(request: any): Observable<any> {
    return this.http.post<any>(`${this.url}/email/enviar-correo-cumpleanio`, request);
  }
}
