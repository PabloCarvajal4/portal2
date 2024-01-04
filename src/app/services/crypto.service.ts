import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private claveSecreta = 'tu-clave-secreta'; // Reemplaza con tu clave secreta

  desencriptarTextoCifrado(textoCifrado: string): string {
    // Decodificar la cadena si está codificada para ser URL seguro
    const textoCifradoDecodificado = decodeURIComponent(textoCifrado);

    // Desencriptar usando AES
    const bytes = CryptoJS.AES.decrypt(textoCifradoDecodificado, this.claveSecreta);

    // Convertir a texto
    const textoDesencriptado = bytes.toString(CryptoJS.enc.Utf8);

    return textoDesencriptado;
  }
}
