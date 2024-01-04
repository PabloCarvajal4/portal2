import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { Vacaciones } from 'src/app/models/vacaciones';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { CredencialService } from 'src/app/services/credencial.service';
import { IncapacidadesService } from 'src/app/services/incapacidades.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { DatePipe } from '@angular/common'
import { Incapacidades } from 'src/app/models/incapacidades';
import { NgToastService } from 'ng-angular-popup';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { response } from 'express';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-cambiar-foto',
  templateUrl: './cambiar-foto.component.html',
  styleUrls: ['./cambiar-foto.component.css']
})
export class CambiarFotoComponent {
  colaboradorSeleccionado: any;
  username: any;
  codigo_colaborador!: number;
  colaboradorId: number | undefined;
  user = {
    codigo_colaborador: '',
    contrasena:''
  }

  puesto:any;
  esAdmin: boolean = false;
  profileImage: string = 'https://i.postimg.cc/prPLwC7S/usuario.png';
  departamento:any;
  depto:any;

  num_identidad:any;
  nombre:any;
  unidad_org:any;
  unidad_negocio:any;
  centro_c:any;
  estado:any;
  fecha_i:any;
  cargo:any;
  num_patronal:any;
  pais:any;
  ciudad:any;
  compania:any;
  correo:any;
  FILE = null;
  fotografia:any;
  fecha_c:any;
  ucreo=1;
  ucambio=1;
  private selectedFile: File = null;

  documentoSubido:any;
  nombreImagen:any;
  credencialSeleccionado:any;
  contrasena:any;

  constructor(private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService, private aRouter: ActivatedRoute, private _credencialService: CredencialService, 
  private toast: NgToastService, private http: HttpClient) { }

    ngOnInit(): void {
      const helper = new JwtHelperService();
      
      this.aRouter.params.subscribe(params => {
        this.username = params['codigo_colaborador'];
      });
      const colaboradorId = this.username;
      this.user = this.authService.getCurrentUser();

      const token = helper.decodeToken(this.authService.getToken());

      if (token.nameid == this.username) {
        this.obtenerColaborador(colaboradorId);
      this.colaboradorId = colaboradorId;
      }else{
        alert('Acceso no Autorizado...')
        window.history.back();
      }  
  }

  DecodeToken(token: string): string {
    return jwt_decode(token);
    }
    
  async obtenerColaborador(codigo_colaborador: number) {
    const gerente = /gerente/gi;
    const ddhh = 'Desarrollo Humano';
    try {
      const data = await this._colaboradorService.obtenerColaborador(codigo_colaborador).toPromise();
      this.colaboradorSeleccionado = data;
      this.num_identidad = data.identidaD_FORMATO;
      this.nombre = data.nombre;
      this.unidad_org = data.unidaD_ORGANIZATIVA;
      this.unidad_negocio = data.unidaD_NEGOCIO;
      this.centro_c = data.descriP_CENTRO_COSTO;
      this.estado = data.estado;
      this.fecha_i = data.fechA_INGRESO;
      this.puesto = data.descripcioN_POSICION_LARGA;
      this.num_patronal = data.numerO_PATRONAL;
      this.pais = data.pais;
      this.ciudad = data.ciudad;
      this.departamento = data.departamento;
      this.compania = data.compania;
      this.correo = data.correo;
      this.fecha_c = data.fechA_CREACION;

      this.obtenerCredencial(codigo_colaborador);
      if (this.departamento === ddhh) {
        this.depto = true;   
      }
      else if (this.puesto.match(gerente) && this.departamento != ddhh) {
        this.esAdmin = true;
      }else if (this.puesto != gerente && this.departamento != ddhh) {
        this.esAdmin = false;
        this.depto = false;
      }
  
       if (this.puesto.match(gerente)) {
        this.esAdmin = true;
      } else {
        this.esAdmin = false;
      }
    } catch (error) {
      console.error(error);
    }
  }

  obtenerCredencial(codigo_colaborador: number){
    this._credencialService.getCredencial(codigo_colaborador).subscribe(data => {
      this.credencialSeleccionado = data;
      this.contrasena = data.contrasena;
      this.nombreImagen = data.fotografia;
      this.obtenerImagen();
    }, error => {
      console.log(error);
    })
  }

  obtenerImagen(){
    this._colaboradorService.obtenerImagen(this.nombreImagen).subscribe(
      (imagen: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          this.documentoSubido = reader.result;
        };
        reader.readAsDataURL(imagen);
      },
      error => {
        console.error('Error al obtener la imagen', error);
      }
    );
  }
  
  actualizarFotografia() {
    const formData = new FormData();
    formData.append('CODIGO_COLABORADOR', this.colaboradorId.toString());
    formData.append('contrasena', this.contrasena);
    formData.append('FOTOGRAFIA', this.fotografia)
    formData.append('FECHA_CREACION', new Date().toISOString());
    formData.append('FECHA_MODIFICACION', new Date().toISOString());
    formData.append('USUARIO_CREO', this.ucreo.toString());
    formData.append('USUARIO_CAMBIO', this.ucambio.toString());

    if (this.selectedFile) {
      formData.append('FILE', this.selectedFile, this.selectedFile.name);
    }
    this.http.put(`http://10.10.0.30:8082/api/Colaboradores/${this.colaboradorId}/ActualizarFotografia`, formData).subscribe(
      response => {
        console.log('Respuesta del servidor:', response);
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: '¡Solicitud Enviada!',
          showConfirmButton: false,
          timer: 1500
        })
        //setTimeout(() => {
        //  location.reload();
        //}, 2000);
        // Realizar acciones adicionales después de recibir una respuesta exitosa
      },
      response => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: '¡Fotografía Actualizada!',
          showConfirmButton: false,
          timer: 1500
        })
        setTimeout(() => {
          location.reload();
        }, 2000);
      }
    );
  }

  eliminarFotografia() {
    const formData = new FormData();
    formData.append('CODIGO_COLABORADOR', this.colaboradorId.toString());
    formData.append('contrasena', this.contrasena);
    formData.append('FOTOGRAFIA', this.fotografia)
    formData.append('FECHA_CREACION', new Date().toISOString());
    formData.append('FECHA_MODIFICACION', new Date().toISOString());
    formData.append('USUARIO_CREO', this.ucreo.toString());
    formData.append('USUARIO_CAMBIO', this.ucambio.toString());

    if (this.selectedFile) {
      formData.append('FILE', this.selectedFile, this.selectedFile.name);
    }
    console.log(formData)
    // Realizar la solicitud POST al controlador de ASP.NET Core
    this.http.put(`http://10.10.0.30:8082/api/Colaboradores/${this.colaboradorId}/EliminarFotografia`, formData).subscribe(
      response => {
        console.log('Respuesta del servidor:', response);
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: '¡Fotografía Actualizada!',
          showConfirmButton: false,
          timer: 1500
        })
        //setTimeout(() => {
        //  location.reload();
        //}, 2000);
        // Realizar acciones adicionales después de recibir una respuesta exitosa
      },
      error => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: '¡Fotografía Eliminada!',
          showConfirmButton: false,
          timer: 1500
        })
        setTimeout(() => {
          location.reload();
        }, 2000);
      }
    );
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  onImageChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.documentoSubido = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }
  
}
function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}

