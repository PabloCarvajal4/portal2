import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { Vacaciones } from 'src/app/models/vacaciones';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { SolicitudesService } from 'src/app/services/solicitudes.service';
import { CredencialService } from 'src/app/services/credencial.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { DatePipe } from '@angular/common'
import { Incapacidades } from 'src/app/models/incapacidades';
import { NgToastService } from 'ng-angular-popup';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Solicitudes } from 'src/app/models/solicitudes';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-solicitudes-respondidas',
  templateUrl: './solicitudes-respondidas.component.html',
  styleUrls: ['./solicitudes-respondidas.component.css']
})
export class SolicitudesRespondidasComponent implements OnInit{
  incapacidadForm: FormGroup;
  colaboradorSeleccionado: any;
  vacacionesSeleccionado: any;
  listSolicitudes: Solicitudes[] = [];
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
  pais:any;
  fotoSubida:any;

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
 
    filter ='';
    documentoSubido:any;
    nombreImagen:any;
    mostrarTable: boolean = false;
    seleccionado: string = '';
    credencialSeleccionado:any;
    contrasena:any;

  constructor(private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService, private fb: FormBuilder, private aRouter: ActivatedRoute, private _credencialService: CredencialService, private datePipe: DatePipe, private _solicitudesService: SolicitudesService, private toast: NgToastService, private http: HttpClient){

    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a medianoche
    
  }

  async ngOnInit(): Promise<void> {
    const helper = new JwtHelperService();
    
    this.aRouter.params.subscribe(params => {
      this.username = params['codigo_colaborador'];
    });
    const colaboradorId = this.username;
    this.user = this.authService.getCurrentUser();

    const token = helper.decodeToken(this.authService.getToken());

    if (token.nameid == this.username) {
      await this.obtenerColaborador(colaboradorId);
      this.colaboradorId = colaboradorId;
      this.obtenerSolicitudes();
    }else{
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
      this.departamento = data.departamento;
      this.pais = data.pais;
      this.obtenerCredencial(codigo_colaborador);
      if (this.departamento === ddhh) {
        this.depto = true;   
      } else if (this.puesto.match(gerente) && this.departamento !== ddhh) {
        this.esAdmin = true;
      } else if (this.puesto !== gerente && this.departamento !== ddhh) {
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
          this.fotoSubida = reader.result;
        };
        reader.readAsDataURL(imagen);
      },
      error => {
        console.error('Error al obtener la imagen', error);
      }
    );
  }
  obtenerSolicitudes(){
    this._solicitudesService.getSolicitudesResueltas(this.pais).subscribe(data => {
      this.listSolicitudes = data;
    }, error => {
      console.log(error);
    })
  }

  obtenerSolicitudesCategoria(id: number){
    this._solicitudesService.getSolicitudesResueltasCategoria(id, this.pais).subscribe(data => {
      this.listSolicitudes = data;
      this.mostrarTable = true
    }, error => {
      console.log(error);
    })
  }

  seleccionChange() {
    if (this.seleccionado === '') {
      this.obtenerSolicitudes();
    } else {
      const categoria = parseInt(this.seleccionado, 10);
      this.obtenerSolicitudesCategoria(categoria);
    }
  }
}
function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}

