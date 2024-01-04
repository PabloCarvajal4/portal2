import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { SolicitudesService } from 'src/app/services/solicitudes.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { Solicitudes } from 'src/app/models/solicitudes';
import Swal from 'sweetalert2';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-solicitud-carnet',
  templateUrl: './solicitud-carnet.component.html',
  styleUrls: ['./solicitud-carnet.component.css']
})
export class SolicitudCarnetComponent {
  solicitudForm: FormGroup;
  colaboradorSeleccionado: any;
  codigo_colaborador!: number;
  username: any;
  user = {
    codigo_colaborador: '',
    contrasena:'',
    estados_id:'1'
  }
  colaboradorId: number | undefined;
  maxConsultaId!: number ;
  maxValor!: number;
  fechaInicio!: Date;
  fechaFin!: Date;
  puesto:any;
  esAdmin: boolean = false;
  departamento:any;
  depto:any;
  documentoSubido:any;

  constructor(private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService, private fb: FormBuilder, private aRouter: ActivatedRoute, private _solicitudesService: SolicitudesService, private toast: NgToastService){ 
    
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a medianoche
    this.solicitudForm = this.fb.group({
      //consulta_id: ['', Validators.required],
      //codigo_colaborador: ['', Validators.required],
      solicitud_id: [3, Validators.required],
      tipo_solicitud: ['Carnet', Validators.required],
      descripcion: ['', Validators.required],
      fecha_emision: [fechaActual, Validators.required],
      fecha_inicio: [fechaActual,Validators.required],
      fecha_final : [fechaActual,Validators.required],
      estado: ['En proceso', Validators.required],
      observacion: ['En proceso', Validators.required],
      aprobacion_id: [1, Validators.required],
      //fecha_aprobacion:['', Validators.required],
      fecha_creacion: [fechaActual, Validators.required],
      fecha_modificacion: [fechaActual, Validators.required],
      usuario_creo: ['1', Validators.required],
      usuario_cambio : ['1', Validators.required],
    })
      }
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
        this.obtenerConsultaId();
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
        this.puesto = data.cargo;
        this.departamento = data.departamento;
        this.documentoSubido = "assets/Colaboradores/" + data.fotografia;
        
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

    obtenerConsultaId() {
      this._solicitudesService.getMaxSolicitud().subscribe(
        (resultado: number) => {
          this.maxValor = resultado;
        },
        (error) => {
          console.error('Error al obtener el valor máximo:', error);
        }
      );
    }
    
    validarFecha() {
      if (this.fechaInicio > this.fechaFin) {
        this.fechaFin = this.fechaInicio;
      }
    }
    agregarSolicitud() {
      const SOLICITUDES: Solicitudes = {
        consultA_ID: this.maxValor + 1,
        codigO_COLABORADOR: this.colaboradorId,
        solicituD_ID: this.solicitudForm.get('solicitud_id')?.value,
        tipO_SOLICITUD: this.solicitudForm.get('tipo_solicitud')?.value,
        descripcion: this.solicitudForm.get('descripcion')?.value,
        fechA_EMISION: this.solicitudForm.get('fecha_emision')?.value,
        fechA_INICIO: this.solicitudForm.get('fecha_inicio')?.value,
        fechA_FINAL: this.solicitudForm.get('fecha_final')?.value,
        estado: this.solicitudForm.get('estado')?.value,
        observacion: this.solicitudForm.get('observacion')?.value,
        aprobacioN_ID: this.solicitudForm.get('aprobacion_id')?.value,
        fechA_APROBACION: this.solicitudForm.get('fecha_aprobacion')?.value,
        fechA_CREACION: this.solicitudForm.get('fecha_creacion')?.value,
        fechA_MODIFICACION: this.solicitudForm.get('fecha_modificacion')?.value,
        usuariO_CREO: this.solicitudForm.get('usuario_creo')?.value,
        usuariO_CAMBIO: this.solicitudForm.get('usuario_cambio')?.value,
        nombre: this.solicitudForm.get('nombre')?.value,
      departamento: this.solicitudForm.get('departamento')?.value,
      }
  
      this._solicitudesService.guardarSolicitud(SOLICITUDES).subscribe(data => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: '¡Solicitud Enviada!',
          showConfirmButton: false,
          timer: 1500
        })
        setTimeout(() => {
          location.reload();
        }, 2000);
      }, error => {
        this.toast.error({detail:'Error', duration:3000})
        this.solicitudForm.reset();
      })
    }

    }
function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}

