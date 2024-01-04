import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { Vacaciones } from 'src/app/models/vacaciones';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { IncapacidadesService } from 'src/app/services/incapacidades.service';
import { CredencialService } from 'src/app/services/credencial.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { DatePipe } from '@angular/common'
import { Incapacidades } from 'src/app/models/incapacidades';
import { NgToastService } from 'ng-angular-popup';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { response } from 'express';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-incapacidades',
  templateUrl: './incapacidades.component.html',
  styleUrls: ['./incapacidades.component.css']
})
export class IncapacidadesComponent implements OnInit{
  incapacidadForm: FormGroup;
  colaboradorSeleccionado: any;
  vacacionesSeleccionado: any;
  username: any;
  codigo_colaborador!: number;
  colaboradorId: number | undefined;
  user = {
    codigo_colaborador: '',
    contrasena:'',
    estados_id:'1'
  }
   maxConsultaId!: number ;
  maxValor!: number;
  fechaInicio!: Date;
  fechaFin!: Date;
  puesto:any;
  esAdmin: boolean = false;
  departamento:any; 
  depto:any;
  documentoSubido:any;
  nombreImagen:any;

    incapacidad_id = this.maxValor +1;
    tipo_incapacidad: string = '';
    fecha_inicio: Date = new Date('');
    fecha_final: Date = new Date('');
    diagnostico : string = '';
    fecha_notificacion: Date = new Date('2023-9-14');
    archivo: any;
    fecha_creacion: Date = new Date('2023-9-14');
    fecha_modificacion: Date = new Date('2023-9-14');
    usuario_creo: number = 1;
    usuario_cambio : number = 1;

    model = {
      INCAPACIDADES_ID: this.maxValor + 1,
      CODIGO_COLABORADOR: 1010,
      INFOTIPO: 2001,
      TIPO_INCAPACIDAD: '',
      FECHA_INICIO: new Date('2023-10-10'),
      FECHA_FINAL: new Date('2023-10-10'),
      DIAGNOSTICO: '',
      FECHA_NOTIFICACION: new Date(),
      FILE: null,
      ARCHIVO: 'No',
      FECHA_CREACION: new Date(),
      FECHA_MODIFICACION:new Date(),
      USUARIO_CREO: 1,
      USUARIO_CAMBIO: 1
    };
    private selectedFile: File | null = null;
    formularioCompleto: boolean = false;
    credencialSeleccionado:any;
    contrasena:any;

  constructor(private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService, private fb: FormBuilder, private aRouter: ActivatedRoute, 
  private datePipe: DatePipe, private _incapacidadesService: IncapacidadesService, private toast: NgToastService, private http: HttpClient, private _credencialService: CredencialService){

    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a medianoche
    this.incapacidadForm = this.fb.group({
      //incapacidades_id: ['', Validators.required],
      //codigo_colaborador: ['', Validators.required],
      infotipo: [2001, Validators.required],
      tipo_incapacidad: ['', Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_final: ['',Validators.required],
      diagnostico : ['',Validators.required],
      fecha_notificacion: [fechaActual, Validators.required],
      archivo: ['', Validators.required],
      fecha_creacion: [fechaActual, Validators.required],
      fecha_modificacion: [fechaActual, Validators.required],
      usuario_creo: [1, Validators.required],
      usuario_cambio : [1, Validators.required],
      //ruta : ['', Validators.required],
    });
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
        this.obtenerIncapacidadId();
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
      this.puesto = data.descripcioN_POSICION_LARGA;
      this.departamento = data.departamento;
      this.obtenerCredencial(codigo_colaborador)
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
  
  obtenerIncapacidadId() {
    this._incapacidadesService.getMaxIncapacidad().subscribe(
      (resultado: number) => {
        this.maxValor = resultado;
      },
      (error) => {
        console.error('Error al obtener el valor máximo:', error);
      }
    );
  }

  onSubmit() {
    this.maxValor += 1;
    const formData = new FormData();
    formData.append('INCAPACIDADES_ID', this.maxValor.toString());
    formData.append('CODIGO_COLABORADOR', this.colaboradorId.toString());
    formData.append('INFOTIPO', this.model.INFOTIPO.toString());
    formData.append('TIPO_INCAPACIDAD', this.model.TIPO_INCAPACIDAD);
    formData.append('FECHA_INICIO', this.model.FECHA_INICIO.toString());
    formData.append('FECHA_FINAL', this.model.FECHA_FINAL.toString());
    formData.append('DIAGNOSTICO', this.model.DIAGNOSTICO);
    formData.append('FECHA_NOTIFICACION', this.model.FECHA_NOTIFICACION.toDateString());
    formData.append('ARCHIVO', this.model.ARCHIVO)
    formData.append('FECHA_CREACION', this.model.FECHA_CREACION.toDateString());
    formData.append('FECHA_MODIFICACION', this.model.FECHA_MODIFICACION.toDateString());
    formData.append('USUARIO_CREO', this.colaboradorId.toString());
    formData.append('USUARIO_CAMBIO', this.colaboradorId.toString());

    if (this.selectedFile) {
      formData.append('FILE', this.selectedFile, this.selectedFile.name);
    }
    this.http.post('http://10.10.0.30:8082/api/Incapacidades/ruta-archivo', formData).subscribe(
      response => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Incapacidad Enviada!',
          showConfirmButton: false,
          timer: 1500
        })
        setTimeout(() => {
          location.reload();
        }, 2000);
      },
      response => {
        console.log(response);
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Incapacidad Enviada!',
          showConfirmButton: false,
          timer: 1500
        })
        setTimeout(() => {
          location.reload();
        }, 2000);
      }
    );
  }

  verificarFormulario() {
    this.formularioCompleto = !!(
      this.model.TIPO_INCAPACIDAD &&
      this.model.FECHA_INICIO &&
      this.model.FECHA_FINAL &&
      this.model.DIAGNOSTICO &&
      this.selectedFile
    );
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 0) {
      this.selectedFile = files[0];
    }
  }
  
}

function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}

