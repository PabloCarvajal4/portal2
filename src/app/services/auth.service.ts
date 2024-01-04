import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  codigo: number;
  private token: string;
  inputValue: string | undefined;
  private URL = 'http://10.10.0.30:8082/api/CREDENCIALES';

  constructor(private http: HttpClient, private router: Router) { }

  InicioSesion(user: any) {
    return this.http.post<any>(this.URL + '/login', user);
  }

  getCurrentUser(): any {
    return this.inputValue;
  }

  obtenerUsuario(id: string): Observable<any> {
    return this.http.get(this.URL + '/Credenciales/' + id);
  }

  guardarInformacionUsuario(infoUsuario: any): void {
    this.codigo = infoUsuario.codigo;
  }

  loggedIn() {
    return !!localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

  setToken(token: string) {
    this.token = token;
  }
  
  getToken() {
    return localStorage.getItem('token');
  }

  get usuarioAutenticado(): boolean {
    // Verificar si el token existe en localStorage para determinar si el usuario ha iniciado sesión
    return !!localStorage.getItem('token');
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token !== null && token !== undefined;
  }

}

