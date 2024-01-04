import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { SolicitudesService } from 'src/app/services/solicitudes.service';
import { CredencialService } from 'src/app/services/credencial.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { Solicitudes } from 'src/app/models/solicitudes';
import Swal from 'sweetalert2';
import { JwtHelperService } from '@auth0/angular-jwt';


@Component({
  selector: 'app-dashboards',
  templateUrl: './dashboards.component.html',
  styleUrls: ['./dashboards.component.css']
})
export class DashboardsComponent {
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
  nombreImagen:any;
  credencialSeleccionado:any;
  contrasena:any;

  constructor(private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService, private fb: FormBuilder, private aRouter: ActivatedRoute, private _solicitudesService: SolicitudesService, private _credencialService: CredencialService, private toast: NgToastService){ 
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a medianoche
      }

      async ngOnInit() {
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
}

function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}

