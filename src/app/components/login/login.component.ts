import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef  } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { NavigationEnd, Router } from '@angular/router'
import { Historial_InicioSesion } from 'src/app/models/iniciosesion';
import { ToastrService } from 'ngx-toastr';
import { NgToastService } from 'ng-angular-popup';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { filter, take } from 'rxjs';
import { CredencialService } from '../../services/credencial.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  credencialForm: FormGroup;
  codigo_colaborador!: number;
  user = {
    codigo_colaborador: null,
    contrasena:''
  }
  estado:any;
  esAdmin: any;
  depto:any;
  valorOriginal = this.user.codigo_colaborador;
  claveSecreta = 'mi-clave-secreta';

  colaboradorId: number | undefined;
  maxConsultaId!: number ;
  maxValor!: number;
  fechaI!:any;
  unidadN!:any;
  centroC!:any;
  fechaA!:any;
  codigo:any;

  constructor(private authService: AuthService, private router: Router,  private toastr: ToastrService, private toast: NgToastService, private cdr: ChangeDetectorRef, private fb: FormBuilder, private aRouter: ActivatedRoute, private route: ActivatedRoute, private _credencialService: CredencialService) { 

    const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0);
      this.fechaA = fechaActual;
    this.credencialForm = this.fb.group({
      codigo_colaborador: ['', Validators.required],
      contrasena: ['', Validators.required],
      fecha_creacion: ['29/8/2023', Validators.required],
      fecha_modificacion: ['29/8/2023', Validators.required],
      usuario_creo: ['1', Validators.required],
      usuario_cambio: ['1', Validators.required],
      estados_id : ['', Validators.required],
  })
  const codigoColaboradorParam = this.aRouter.snapshot.paramMap.get('codigo_colaborador');
  if (codigoColaboradorParam !== null) {
    this.codigo_colaborador = parseInt(codigoColaboradorParam);
  } else {
    // Manejar el caso en el que el parámetro sea null, por ejemplo, asignar un valor por defecto.
  }
}
  
ngOnInit(): void {
this.obtenerSesionId();
}

  signIn() {
    const gerente = /gerente/gi;
    const ddhh = 'Desarrollo Humano';

    this.authService.InicioSesion(this.user).subscribe(
      (res) => {
        localStorage.setItem('token', res.token);
        this.esAdmin = res.cargo;
        this.depto = res.departamento;
        this.centroC = res.descriP_CENTRO_COSTO;
        this.unidadN = res.descriP_CENTRO_COSTO;
        this.codigo = res.codigo;
        
        if (res.estado == 'Activo') { 
          if (this.user.contrasena == 'Ladylee.123'){
            this.router.navigate([`/cambio-password/${this.user.codigo_colaborador}`])
            this.agregarSesion(); 
          }else if (this.depto === ddhh){
            this.router.navigate([`/home-ddhh/${this.user.codigo_colaborador}`]);
            this.toast.success({ detail: "Bienvenido", summary: "Portal de Colaboradores DDHH", duration: 5000 }); 
            this.agregarSesion(); 
          }else if (this.esAdmin.match(gerente)) {
            this.router.navigate([`/home-admin/${this.user.codigo_colaborador}`]);
            this.toast.success({ detail: "Bienvenido", summary: "Portal de Colaboradores DDHH", duration: 5000 });
            this.agregarSesion();
          }else{
            this.router.navigate([`/home/${this.user.codigo_colaborador}`]);
            this.toast.success({ detail: "Bienvenido", summary: "Portal de Colaboradores DDHH", duration: 5000 });
            this.agregarSesion();
          }
      }else{
        this.toast.error({ detail: "Usuario inactivo", summary: 'Estado de usuario no válido', duration: 3000 });
      }
    },
      (err) => {
        this.toast.error({ detail: "Error", summary: 'Credenciales Incorrectas', duration: 2000000 });
      }
    );
  }
  
  obtenerSesionId() {
    this._credencialService.getMaxSesion().subscribe(
      (resultado: number) => {
        this.maxValor = resultado;
      },
      (error) => {
        console.error('Error al obtener el valor máximo:', error);
      }
    );
  }

  agregarSesion() {
    const INICIOSESION: Historial_InicioSesion = {
      sesioN_ID: this.maxValor + 1,
      codigO_COLABORADOR: parseInt(this.user.codigo_colaborador),
      fechA_INGRESO: new Date(),
      unidaD_NEGOCIO: this.unidadN,
      centrO_COSTO: this.centroC,
      fechA_CREACION: this.fechaA,
      fechA_MODIFICACION: this.fechaA,
      usuariO_CREO: parseInt(this.user.codigo_colaborador),
      usuariO_CAMBIO: parseInt(this.user.codigo_colaborador),
    }

    this._credencialService.guardarSesion(INICIOSESION).subscribe(data => {
    }, error => {
    })
  }
  onSubmit(value: string) {
    this.authService.inputValue = value;
  }
}
