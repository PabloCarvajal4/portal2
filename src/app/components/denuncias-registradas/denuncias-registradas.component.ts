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
import { Denuncias } from 'src/app/models/denuncias';
import { DenunciasService } from 'src/app/services/denuncias.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-denuncias-registradas',
  templateUrl: './denuncias-registradas.component.html',
  styleUrls: ['./denuncias-registradas.component.css']
})
export class DenunciasRegistradasComponent implements OnInit{
  incapacidadForm: FormGroup;
  colaboradorSeleccionado: any;
  vacacionesSeleccionado: any;
  listDenuncias: Denuncias[] = [];
  listDenuncia: Denuncias[] = [];
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
    nombreArchivoDenuncia:any;
    credencialSeleccionado:any;
    contrasena:any;

  constructor(private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService, private fb: FormBuilder, private aRouter: ActivatedRoute, 
  private datePipe: DatePipe, private _denunciasService: DenunciasService, private _credencialService: CredencialService, private toast: NgToastService, private http: HttpClient){

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
        this.obtenerDenunciaId();
        this.obtenerDenuncias();
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
  obtenerDenunciaId() {
    this._denunciasService.getMaxDenuncia().subscribe(
      (resultado: number) => {
        this.maxValor = resultado;
      },
      (error) => {
        console.error('Error al obtener el valor máximo:', error);
      }
    );
  }

  obtenerDenuncias(){
    this._denunciasService.getDenuncias(this.pais).subscribe(data => {
      this.listDenuncias = data;
    }, error => {
      console.log(error);
    })
  }

  obtenerDenunciasAsc(){
    this._denunciasService.getDenunciasAsc(this.pais).subscribe(data => {
      this.listDenuncias = data;
    }, error => {
      console.log(error);
    })
  }

  obtenerDenunciasDesc(){
    this._denunciasService.getDenunciasDesc(this.pais).subscribe(data => {
      this.listDenuncias = data;
    }, error => {
      console.log(error);
    })
  }

   async obtenerDenunciaPorColaborador(denuncia_id: number) {
    try {
      const data = await this._denunciasService.getDenuncia(denuncia_id).toPromise();
      this.listDenuncia = data;
      this.nombreArchivoDenuncia = data.evidencia
      this.obtenerArchivoDenuncia()
    } catch (error) {
      console.error(error);
    }
  }

  obtenerArchivoDenuncia(){
    this._denunciasService.obtenerImagen(this.nombreArchivoDenuncia).subscribe(
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

  onFileSelected(event: any) {
    const selectedFile = event.target.files[0]; 

    if (selectedFile) {
      const fileName = selectedFile.name; 
      console.log("Nombre del archivo seleccionado: " + fileName);
      this.archivo = fileName;
    }
    
  }
  
}
function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}

