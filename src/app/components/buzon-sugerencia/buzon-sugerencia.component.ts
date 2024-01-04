import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { DatePipe } from '@angular/common'
import { Sugerencia } from 'src/app/models/sugerencia';
import { NgToastService } from 'ng-angular-popup';
import { SugerenciasService } from 'src/app/services/sugerencias.service';
import { CredencialService } from 'src/app/services/credencial.service';
import Swal from 'sweetalert2';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-buzon-sugerencia',
  templateUrl: './buzon-sugerencia.component.html',
  styleUrls: ['./buzon-sugerencia.component.css']
})
export class BuzonSugerenciaComponent {
  sugerenciaForm: FormGroup;
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
  text: string = '';
  maxWords: number = 1000;
  puesto:any;
  esAdmin: boolean = false;
  departamento:any;
  depto:any;
  documentoSubido:any;
  nombreImagen:any;
  credencialSeleccionado:any;
  contrasena:any;

  constructor(private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService, private fb: FormBuilder, private aRouter: ActivatedRoute, private toast: NgToastService, private _sugerenciaService: SugerenciasService, private _credencialService: CredencialService) { 

    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a medianoche
    this.sugerenciaForm = this.fb.group({
      //consulta_id: ['', Validators.required],
      //codigo_colaborador: ['', Validators.required],
      mensaje: ['', Validators.required],
      fecha_creacion: [fechaActual, Validators.required],
      fecha_modificacion: [fechaActual, Validators.required],
      usuario_creo: ['1', Validators.required],
      usuario_cambio : ['1', Validators.required],
      categoria : ['', Validators.required],
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

  get palabrasDisponibles(): number {
    const wordCount = this.text.trim().split(/\s+/).length;
    return Math.max(this.maxWords - wordCount, 0);
  }

  onInput(event: any) {
    const wordCount = this.text.trim().split(/\s+/).length;

    if (wordCount > this.maxWords) {
      const words = this.text.trim().split(/\s+/);
      words.splice(this.maxWords);
      this.text = words.join(' ');
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
  obtenerConsultaId() {
    this._sugerenciaService.getMaxIncapacidad().subscribe(
      (resultado: number) => {
        this.maxValor = resultado;
      },
      (error) => {
        console.error('Error al obtener el valor máximo:', error);
      }
    );
  }

  agregarSugerencia() {
    const SOLICITUDES: Sugerencia = {
      mensajE_ID: this.maxValor + 1,
      mensaje: this.sugerenciaForm.get('mensaje')?.value,
      fechA_CREACION: this.sugerenciaForm.get('fecha_creacion')?.value,
      fechA_MODIFICACION: this.sugerenciaForm.get('fecha_modificacion')?.value,
      usuariO_CREO: this.colaboradorId,
      usuariO_CAMBIO: this.colaboradorId,
      categoria: this.sugerenciaForm.get('categoria')?.value,
    }

    this._sugerenciaService.guardarIncapacidad(SOLICITUDES).subscribe(data => {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: '¡Gracias por tu Sugerencia!',
        showConfirmButton: false,
        timer: 1500
      })
      setTimeout(() => {
        location.reload();
      }, 2000);
    }, error => {
      console.log(error);
      this.toast.error({detail:'Error', duration:3000})
      this.sugerenciaForm.reset();
    })
  }

}

function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}
