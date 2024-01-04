import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Colaborador } from 'src/app/models/colaborador';
import { Solicitudes } from 'src/app/models/solicitudes';
import { Vacaciones } from 'src/app/models/vacaciones';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { SolicitudesService } from 'src/app/services/solicitudes.service';
import { CredencialService } from 'src/app/services/credencial.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgToastService } from 'ng-angular-popup';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-aprobacion-solicitudes',
  templateUrl: './aprobacion-solicitudes.component.html',
  styleUrls: ['./aprobacion-solicitudes.component.css']
})
export class AprobacionSolicitudesComponent implements OnInit {
  @ViewChild('fechaInicioInput', { static: true }) fechaInicioInput: ElementRef<HTMLInputElement>;
  @ViewChild('fechaFinalInput', { static: true }) fechaFinalInput: ElementRef<HTMLInputElement>;
  
  solicitudForm: FormGroup;
  listSolicitudes: Solicitudes[] = [];
  listSolicitud: Solicitudes[] =[];
  colaboradorSeleccionado: any;
  username: any;
  user = {
    codigo_colaborador: '',
    contrasena: ''
  };
  filterDepto = '';
  departamento: any;
  ColaboradorId: number | undefined;
  codigo_colaborador!: number;
  puesto:any;
  esAdmin: boolean = false;
  id:any;
  codigo:any;
  errorMensaje: string = '';
  maxValor:any;
  fechaInicio!: Date;
  fechaFin!: Date;

  estadoActual:any;
  cod:any;
  soli:any;
  tipo_soli:any;
  desc:any;
  fecha_emi:any;
  fechaI: Date = new Date('2023-9-27');
  fechaF: Date = new Date('2023-9-28');
  fechaC:any;
  obs:any;
  area:any;
  depto:any;
  pais:any;
  documentoSubido:any;
  nombreImagen:any;
  credencialSeleccionado:any;
  contrasena:any;

  solicitud = {
    fechA_INICIO: new Date(''), // Supongamos que tienes las fechas aquí
    fechA_FINAL: new Date(''),
  };

  compania:any;
  diferenciasDias: number[] = [];
  departamentosUnicos: string[] = [];
  filtroDepto = '';
  filtroTipoSolicitud = '';
  constructor(
    private authService: AuthService,
    private router: Router,
    private _colaboradorService: ColaboradorService,
    private fb: FormBuilder,
    private aRouter: ActivatedRoute,
    private _solicitudesService: SolicitudesService,
    private toast: NgToastService, private _credencialService: CredencialService
  ) 
  {
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a medianoche
    this.fechaC = fechaActual;
    this.solicitudForm = this.fb.group({
      estado: ['En proceso', Validators.required],
      observacion: ['', Validators.required],
      fecha_aprobacion:[fechaActual, Validators.required],
      fecha_modificacion: [fechaActual, Validators.required],
      usuario_creo: [1, Validators.required],
      usuario_cambio : [1, Validators.required],
    })
     const codigoColaboradorParam = this.aRouter.snapshot.paramMap.get('codigo_colaborador');
     if (codigoColaboradorParam !== null) {
       this.codigo_colaborador = parseInt(codigoColaboradorParam);
     } else {
      
     }
  }

  async ngOnInit(): Promise<void> {
    const gerente = /gerente/gi;
    const ddhh = 'Desarrollo Humano';
    const helper = new JwtHelperService();
  
    this.aRouter.params.subscribe(params => {
      this.username = params['codigo_colaborador']; 
    });
  
    const colaboradorId = this.username;
    this.user = this.authService.getCurrentUser();
  
    const token = helper.decodeToken(this.authService.getToken());
  
    if (token.nameid == this.username) {
      await this.obtenerColaborador(colaboradorId); 
      this.ColaboradorId = colaboradorId;
      this.obtenerSolicitudId();
    } else {
      alert('Acceso no Autorizado...')
      window.history.back();
    }
  }
  
  DecodeToken(token: string): string {
    return jwt_decode(token);
    }
    
  async obtenerColaborador(codigo_colaborador: number): Promise<void> {
    const gerente = /gerente/gi;
    const ddhh = 'Desarrollo Humano';
    try {
      const data = await this._colaboradorService.obtenerColaborador(codigo_colaborador).toPromise();
      this.colaboradorSeleccionado = data;
      this.puesto = data.descripcioN_POSICION_LARGA;
      this.area = data.departamento;
      this.pais = data.pais;
      this.compania = data.descripcioN_CIA;

      this.obtenerCredencial(codigo_colaborador);
      if (this.area === ddhh) {
        this.depto = true;   
      }
      else if (this.puesto.match(gerente) && this.area != ddhh) {
        this.esAdmin = true;
      }else if (this.puesto != gerente && this.area != ddhh) {
        this.esAdmin = false;
        this.depto = false;
      }
  
       if (this.puesto.match(gerente)) {
        this.esAdmin = true;
      } else {
        this.esAdmin = false;
      }

      this.departamento = data.departamento;

      if (this.puesto.match(gerente) || this.departamento == ddhh){
        this.obtenerSolicitudes(this.departamento);
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

  obtenerSolicitudes(departamento: string) {
    if (this.departamento == 'Desarrollo Humano') {
      this._solicitudesService.getSolicitudesGenerales(this.pais).subscribe(
        data => {
          this.listSolicitudes = data;
          this.diferenciasDias = this.listSolicitudes.map(solicitud =>
            this.calcularDiferenciaDias(new Date(solicitud.fechA_INICIO), new Date(solicitud.fechA_FINAL))
          );
          this.departamentosUnicos = Array.from(new Set(this.listSolicitudes.map(solicitud => solicitud.departamento)));
        },
        error => {
          console.log(error);
        }
      );
    } else {
      this._solicitudesService.getSolicitudes(departamento, this.pais).subscribe(
        data => {
          this.listSolicitudes = data;
          this.diferenciasDias = this.listSolicitudes.map(solicitud =>
            this.calcularDiferenciaDias(new Date(solicitud.fechA_INICIO), new Date(solicitud.fechA_FINAL))
          );
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  obtenerSolicitud(codigo:number) {
    this._solicitudesService.getSolicitud(codigo).subscribe(
      dato => {
        this.listSolicitud = dato;
        this.id = dato.consultA_ID;

        console.log(this.id)
      },
      error => {
        console.log(error);
      }
    );
  }

  obtenerSolicitudId() {
    this._solicitudesService.getMaxVacaciones().subscribe(
      (resultado: number) => {
        this.maxValor = resultado;
      },
      (error) => {
        console.error('Error al obtener el valor máximo:', error);
      }
    );
  }

  calcularDiferenciaDias(fechainicio: Date, fechafinal: Date): number {
    const fechaInicio = fechainicio
    const fechaFinal = fechafinal;
    const diferenciaEnMilisegundos = fechaFinal.getTime() - fechaInicio.getTime();
    const diferenciaEnDias = Math.floor(diferenciaEnMilisegundos / (1000 * 60 * 60 * 24));
    return diferenciaEnDias +1;
  }


  actualizarSolicitud(consultaId: number, codigo_colaborador: number,solicitudId:number, tipo_solicitud:string, descripcion:string, fecha_emision:Date, fecha_inicio:Date, fecha_final:Date, estado:string, fecha_creacion:Date ) {
    this.cod = codigo_colaborador;
    this.estadoActual = estado;
    this.soli = solicitudId;
    this.tipo_soli = tipo_solicitud;
    this.desc = descripcion;
    this.fecha_emi = fecha_emision;
    this.fechaI = fecha_inicio;
    this.fechaF = fecha_final;

    const fechaActual = new Date();
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth(); // Los meses empiezan desde 0 (enero) hasta 11 (diciembre)
    const dia = fechaActual.getDate();

    const SOLICITUD: Solicitudes = {
      consultA_ID: consultaId,
      codigO_COLABORADOR: this.cod,
      solicituD_ID: this.soli,
      tipO_SOLICITUD: this.tipo_soli,
      descripcion: this.desc,
      fechA_EMISION: this.fecha_emi,
      fechA_INICIO: this.fechaI,
      fechA_FINAL: this.fechaF,
      estado: this.estadoActual,
      observacion: this.solicitudForm.get('observacion')?.value,
      aprobacioN_ID: this.ColaboradorId,
      fechA_APROBACION: this.solicitudForm.get('fecha_aprobacion')?.value,
      fechA_CREACION: this.fechaC,
      fechA_MODIFICACION: this.solicitudForm.get('fecha_modificacion')?.value,
      usuariO_CREO: this.solicitudForm.get('usuario_creo')?.value,
      usuariO_CAMBIO: this.solicitudForm.get('usuario_cambio')?.value,
      nombre: this.solicitudForm.get('nombre')?.value,
      departamento: this.solicitudForm.get('departamento')?.value,

    }

    const VACACIONES: Vacaciones = {
      consultA_ID: this.maxValor +1,
      codigO_COLABORADOR: this.cod,
      fechA_INICIAL: this.fechaI,
      fechA_FINAL: this.fechaF,
      cantidad: this.calcularDiferenciaDias(new Date(this.fechaI),new Date(this.fechaF)).toString(),
      liquidcont: this.calcularDiferenciaDias(new Date(this.fechaI),new Date(this.fechaF)).toString(),
      dias: this.calcularDiferenciaDias(new Date(this.fechaI),new Date(this.fechaF)),
      diaS_GOZADOS: this.calcularDiferenciaDias(new Date(this.fechaI),new Date(this.fechaF)),
      diaS_PENDIENTES: 0,
      compania: this.compania,
      fechA_CREACION: this.fechaC,
      fechA_MODIFICACION: this.fechaC,
      usuariO_CREO: 1,
      usuariO_CAMBIO: 1,
      concepto: "Días Pendientes",
      fechA_INICIO: new Date(),
      descripcioN_CIA : this.compania,
      departamento : this.departamento
    }
    
    if (this.tipo_soli == 'Vacaciones'){
      console.log(VACACIONES);
      this._solicitudesService.ActualizarSolicitud(consultaId, SOLICITUD).subscribe(
        (data) => {
          this.toast.success({ detail: "Respuesta Enviada",summary:"Actualización de registro correcto", duration: 5000 });
          setTimeout(() => {
            location.reload();
          }, 2000);
        },
        (error) => {
          console.log(error);
          this.toast.error({ detail: "Error al actualizar el registro", duration: 3000 });
          this.solicitudForm.reset();
        }
      );
    
      if(this.estadoActual == "Aprobada"){
      this._solicitudesService.agregarVacaciones(VACACIONES).subscribe(
        (data) => {
          this.toast.success({ detail: "Respuesta Enviada",summary:"Actualización de registro correcto", duration: 5000 });
          setTimeout(() => {
            location.reload();
          }, 2000);
        },
        (error) => {
          console.log(error);
          this.toast.error({ detail: "Error al actualizar el registro", duration: 3000 });
          this.solicitudForm.reset();
        }
      );
      }
    }else{
      this._solicitudesService.ActualizarSolicitud(consultaId, SOLICITUD).subscribe(
      (data) => {
        this.toast.success({ detail: "Respuesta Enviada",summary:"Actualización de registro correcto", duration: 5000 });
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      (error) => {
        console.log(error);
        this.toast.error({ detail: "Error al actualizar el registro", duration: 3000 });
        this.solicitudForm.reset();
      }
    );
  }
    }
    
}
function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}

