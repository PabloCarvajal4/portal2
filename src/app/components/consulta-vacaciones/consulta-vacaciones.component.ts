import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { Vacaciones } from 'src/app/models/vacaciones';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { VacacionesService } from 'src/app/services/vacaciones.service';
import { CredencialService } from 'src/app/services/credencial.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { DatePipe } from '@angular/common'
import { JwtHelperService } from '@auth0/angular-jwt';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consulta-vacaciones',
  templateUrl: './consulta-vacaciones.component.html',
  styleUrls: ['./consulta-vacaciones.component.css'],
})
export class ConsultaVacacionesComponent implements OnInit {
  colaboradorSeleccionado: any;
  vacacionesSeleccionado: any;
  username: any;
  listVacaciones: Vacaciones[] = [];
  fechaInicio: string = ''; 
  fechaFin: string = '';
  codigo_colaborador!: number;
  puesto:any;
  esAdmin: boolean = false;
  user = {
    codigo_colaborador: '',
    contrasena:'',
    estados_id:'1'
  }
  departamento:any;
  depto:any;
  documentoSubido:any;
  nombreImagen:any;
  credencialSeleccionado:any;
  contrasena:any;

  constructor(private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService, private fb: FormBuilder, private aRouter: ActivatedRoute, 
  private _credencialService: CredencialService,private _vacacionesService: VacacionesService,private datePipe: DatePipe){

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
    this.obtenerVacacionesPorColaborador(colaboradorId);
    this.codigo_colaborador = colaboradorId;
    }else{
      alert('Acceso no Autorizado...')
      window.history.back();
    }
}

DecodeToken(token: string): string {
  return jwt_decode(token);
  }

  totalDiasVacaciones(): number {
    let suma = 0;
  
    for (let i = 0; i < this.listVacaciones.length; i++) {
      const registro = this.listVacaciones[i];
  
      suma += Number(registro.cantidad);
    }
  
    return suma;
  }
  totalDiasVacacionesGozados(): number {
    let suma = 0;
  
    for (let i = 0; i < this.listVacaciones.length; i++) {
      const registro = this.listVacaciones[i];
  
      suma += Number(registro.liquidcont);
    }
  
    return suma;
  }
totalDiasVacacionesPendientes(): number {
  let suma = 0;

  for (let i = 0; i < this.listVacaciones.length; i++) {
    const registro = this.listVacaciones[i];

    suma += Number(registro.diaS_PENDIENTES);
  }

  return suma;
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
obtenerVacacionesPorColaborador(codigo_colaborador: number){
  this._vacacionesService.obtenerVacaciones(codigo_colaborador).subscribe(data => {
    this.listVacaciones = data;
  }, error => {
    console.log(error);
  })
}

transformarFecha(fecha: string): string {
  const dateObject = new Date(fecha);
  dateObject.setDate(dateObject.getDate() + 1); 

  const dia = this.datePipe.transform(dateObject, 'dd');
  const mesAbreviado = this.datePipe.transform(dateObject, 'MMM', 'es');
  const ano = this.datePipe.transform(dateObject, 'yyyy');
  const fechaFormateada = `${dia}-${mesAbreviado}.${ano}`;

  return fechaFormateada;
}

filtrarDatos(codigo_colaborador: string, fechaInicio: string, fechaFin: string) {
  this._vacacionesService.filtrarVacaciones(codigo_colaborador, this.transformarFecha(fechaInicio), this.transformarFecha(fechaFin))
    .subscribe(data => {
      this.listVacaciones = data;
    }, error => {
      console.error(error);
    });
}

}

function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}
