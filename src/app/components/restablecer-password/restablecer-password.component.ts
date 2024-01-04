import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CredencialService } from 'src/app/services/credencial.service';
import { Credencial } from 'src/app/models/credencial';
import { Colaborador } from 'src/app/models/colaborador';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { ToastrService } from 'ngx-toastr';
import { NgToastService } from 'ng-angular-popup';
import { duration } from 'moment';
import { AuthService } from '../../services/auth.service'
import Swal from 'sweetalert2';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-restablecer-password',
  templateUrl: './restablecer-password.component.html',
  styleUrls: ['./restablecer-password.component.css']
})
export class RestablecerPasswordComponent {
  credencialForm: FormGroup;
  colaboradorSeleccionado: any;
  username: any;
  codigo_colaborador!: number;
  inputControl: FormControl = new FormControl('', [Validators.minLength(8)]);
  colaboradorId: number | undefined;
  user = {
    codigo_colaborador: '',
    contrasena:'',
  }

  puesto:any;
  esAdmin: boolean = false;
  departamento:any;
  depto:any;
  primeraVez:any;
  primerSesion:boolean = false;
  cod:any;
  documentoSubido:any;
  nombreImagen:any;
  credencialSeleccionado:any;
  contrasena:any;
  
  constructor(private fb: FormBuilder,
              private router: Router,
              private toastr: ToastrService,
              private _credencialService: CredencialService,
              private aRouter: ActivatedRoute,
              private _colaboradorService: ColaboradorService,
              private toast: NgToastService,
              private authService: AuthService) { 

    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); 
    this.credencialForm = this.fb.group({
      codigo_colaborador: ['', Validators.required],
      contrasena: ['Ladylee.123', Validators.required],
      fecha_creacion: ['29/8/2023', Validators.required],
      fecha_modificacion: [fechaActual, Validators.required],
      usuario_creo: ['1', Validators.required],
      usuario_cambio: ['1', Validators.required],
    })
    const codigoColaboradorParam = this.aRouter.snapshot.paramMap.get('codigo_colaborador');
    if (codigoColaboradorParam !== null) {
      this.codigo_colaborador = parseInt(codigoColaboradorParam);
    } else {
    }
  }

  async ngOnInit(): Promise<void> {
    const helper = new JwtHelperService();
    this.esEditar();
    this.aRouter.params.subscribe(params => {
      this.username = params['codigo_colaborador'];
    });
    
    const colaboradorId = this.username;
    this.user = this.authService.getCurrentUser();

    const token = helper.decodeToken(this.authService.getToken());

    if (token.nameid == this.username) {
      await this.obtenerColaborador(colaboradorId);

    if (this.primeraVez == 'Ladylee.123'){
      Swal.fire({
        icon: 'info',
        text: 'Primero debes cambiar tu contraseña para acceder a las demás funcionalidades.',
      })
    }else{

    }
    }else{
      alert('Acceso no Autorizado...')
      window.history.back();
    }
  }

  DecodeToken(token: string): string {
    return jwt_decode(token);
    }
    
  agregarCredencial() {
    const gerente = /gerente/gi;
    const ddhh = 'Desarrollo Humano';

    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth(); // Los meses empiezan desde 0 (enero) hasta 11 (diciembre)
    const dia = fechaActual.getDate();

    const CREDENCIAL: Credencial = {
      codigO_COLABORADOR: this.credencialForm.get('codigo_colaborador')?.value,
      contrasena: this.credencialForm.get('contrasena')?.value,
      fechA_CREACION: this.credencialForm.get('fecha_creacion')?.value,
      fechA_MODIFICACION: this.credencialForm.get('fecha_modificacion')?.value,
      usuariO_CREO: this.credencialForm.get('usuario_creo')?.value,
      usuariO_CAMBIO: this.credencialForm.get('usuario_cambio')?.value,
      estadoS_ID: this.credencialForm.get('estados_id')?.value,
    }

    this._credencialService.guardarColaborador(this.credencialForm.get('codigo_colaborador')?.value ,CREDENCIAL).subscribe(data => {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: '¡Contraseña Restablecida!',
        showConfirmButton: false,
        timer: 1500
      })
      setTimeout(() => {  
        location.reload();
    }, 2000);
    }, error => {
      console.log(error);
      this.toast.error({detail:'Error', duration:3000})
      this.credencialForm.reset();
    })
  }

  esEditar() {
    if(this.codigo_colaborador !== null) {
      this._credencialService.obtenerColaborador(this.codigo_colaborador).subscribe(data => {
        this.credencialForm.setValue({
          codigo_colaborador: data.codigO_COLABORADOR,
          contrasena: '',
          fecha_creacion: data.fechA_CREACION,
          fecha_modificacion: data.fechA_MODIFICACION,
          usuario_creo: data.usuariO_CREO,
          usuario_cambio: data.usuario_cambio
        })
      })
    }
  }
  
  async obtenerColaborador(codigo_colaborador: number) {
    const gerente = /gerente/gi;
    const ddhh = 'Desarrollo Humano';
  
    try {
      const data = await this._colaboradorService.obtenerColaborador(codigo_colaborador).toPromise();
      
      this.colaboradorSeleccionado = data;
      this.puesto = data.descripcioN_POSICION_LARGA;
      this.departamento = data.departamento;
      this.primeraVez = data.contrasena;
      this.obtenerCredencial(codigo_colaborador);
      if (data.nO_EMPLE !== undefined) {
        this.cod = data.nO_EMPLE;
      } else {
        console.error('La propiedad codigO_COLABORADOR está indefinida en la respuesta del servicio.');
      }
      
      if (this.departamento === ddhh) {
        this.depto = true;
      } else if (this.puesto.match(gerente) && this.departamento != ddhh) {
        this.esAdmin = true;
      } else if (this.puesto != gerente && this.departamento != ddhh) {
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
    this.contrasena = data.constrasena;
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

}
function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}
