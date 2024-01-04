import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CryptoJS } from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncriptacionService {

  private key = 'my-secret-key'; // Clave secreta para encriptar/desencriptar

  constructor() { }

  
}
