import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { Vacaciones } from 'src/app/models/vacaciones';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { CredencialService } from 'src/app/services/credencial.service';
import { DenunciasService } from 'src/app/services/denuncias.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { DatePipe } from '@angular/common'
import { Incapacidades } from 'src/app/models/incapacidades';
import { NgToastService } from 'ng-angular-popup';
import { Denuncias } from 'src/app/models/denuncias';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-denuncia',
  templateUrl: './denuncia.component.html',
  styleUrls: ['./denuncia.component.css']
})
export class DenunciaComponent {
  denunciaForm: FormGroup;
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
  evidencia!:any;
  departamento:any;
  depto:any;
  documentoSubido:any;
  nombreImagen:any;

  model = {
    DENUNCIA_ID: this.maxValor + 1,
    CODIGO_COLABORADOR: 1010,
    TIPO_DENUNCIA: '',
    CONCEPTO: '',
    CENTRO_COSTO: '',
    UBICACION: '',
    FECHA_OCURRIDO: new Date('2023-10-10'),
    FILE: null,
    EVIDENCIA: 'No',
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
    private datePipe: DatePipe, private _credencialService: CredencialService, private _denunciasService: DenunciasService, private toast: NgToastService, private http: HttpClient) {

      const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a medianoche
    this.denunciaForm = this.fb.group({
      //denuncias_id: ['', Validators.required],
      //codigo_colaborador: ['', Validators.required],
      tipo_denuncia: ['', Validators.required],
      concepto: ['', Validators.required],
      centro_costo: ['', Validators.required],
      ubicacion: ['',Validators.required],
      fecha_ocurrido : ['',Validators.required],
      evidencia: [''],
      fecha_creacion: [fechaActual, Validators.required],
      fecha_modificacion: [fechaActual, Validators.required],
      usuario_creo: [1, Validators.required],
      usuario_cambio : [1, Validators.required],
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
        this.obtenerDenunciaId();
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

  onSubmit() {
    this.maxValor += 1;
    const formData = new FormData();
    formData.append('DENUNCIA_ID', this.maxValor.toString());
    formData.append('CODIGO_COLABORADOR', this.colaboradorId.toString());
    formData.append('TIPO_DENUNCIA', this.model.TIPO_DENUNCIA);
    formData.append('CONCEPTO', this.model.CONCEPTO);
    formData.append('CENTRO_COSTO', this.model.CENTRO_COSTO);
    formData.append('UBICACION', this.model.UBICACION);
    formData.append('FECHA_OCURRIDO', this.model.FECHA_OCURRIDO.toString());
    formData.append('EVIDENCIA', this.model.EVIDENCIA)
    formData.append('FECHA_CREACION', this.model.FECHA_CREACION.toDateString());
    formData.append('FECHA_MODIFICACION', this.model.FECHA_MODIFICACION.toDateString());
    formData.append('USUARIO_CREO', this.model.USUARIO_CREO.toString());
    formData.append('USUARIO_CAMBIO', this.model.USUARIO_CAMBIO.toString());

    if (this.selectedFile) {
      formData.append('FILE', this.selectedFile, this.selectedFile.name);
    }

    this.http.post('http://10.10.0.30:8082/api/Denuncias/ruta-archivo', formData).subscribe(
      response => {
        console.log('Respuesta del servidor:', response);
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
        // Realizar acciones adicionales después de recibir una respuesta exitosa
      },
      response => {
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Denuncia Enviada!',
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
      this.model.TIPO_DENUNCIA &&
      this.model.CONCEPTO &&
      this.model.CENTRO_COSTO &&
      this.model.UBICACION &&
      this.model.FECHA_OCURRIDO
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

