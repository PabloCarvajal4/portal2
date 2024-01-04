import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { Credencial } from 'src/app/models/credencial';
import { Historial_InicioSesion } from 'src/app/models/iniciosesion';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { EncriptacionService } from '../../services/encriptacion.service';
import { CredencialService } from '../../services/credencial.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DatePipe } from '@angular/common';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{
  colaboradorForm: FormGroup;
  id: string | null;
  listProductos: Credencial[] = [];
  listCumpleaneros: Colaborador[] = [];
  listCumpleaneros2:any;
  listCumpleanio: Colaborador[] = [];
  colaboradorSeleccionado: any;
  username: any;
  puesto:any;
  user = {
    codigo_colaborador: '',
    contrasena:'',
    estados_id:'1'
  }
  esAdmin: boolean = false;
  sesionAgregada: boolean = false;

  colaboradorId: number | undefined;
  maxConsultaId!: number ;
  maxValor!: number;
  fechaI!:any;
  unidadN!:any;
  centroC!:any;
  fechaA!:any;
  documentoSubido:any;
  nombreImagen:any;
  codigoUsuario: number;
  diaDelMes:any;
  pais:any;
  token:any;
  fechaNacimiento:any;
  tamanoArreglo:any;
  tamanoArregloAniversario:any;
  AniosAniversario:any;
  fechaIngreso:any;
  fechaIngresoValidar:any;
  fechaFormateada:any;
  fechaIngresoValidarCumpleanio:any;
  fechaFormateadaCumpleanio:any;
  dia: number;
  mes: string;
  credencialSeleccionado:any;
  contrasena:any;

  SanPedroSula:any;
  spsTemperatura:any;
  Madrid:any;
  madridTemperatura:any;
  Alajuela:any;
  alajuelaTemperatura:any;

  constructor(private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService,
  private fb: FormBuilder,
  private aRouter: ActivatedRoute,
  private toast: NgToastService,private datePipe: DatePipe,
  private encriptacionService: EncriptacionService, private _credencialService: CredencialService) 
    { 
      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0);
      this.fechaA = fechaActual;
    }

    ngOnInit(): void {
      const fechaActual = new Date();
      const nombresMesesAbreviados = [
      'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const mes = nombresMesesAbreviados[fechaActual.getMonth()];
      const dia = fechaActual.getDate().toString();
      const fechaHoy = `${dia}-${mes}`;

      const helper = new JwtHelperService();

      this.aRouter.params.subscribe(params => {
        this.username = params['codigo_colaborador'];
      });

      const colaboradorId = this.username;
      this.user = this.authService.getCurrentUser();
    
      const token = helper.decodeToken(this.authService.getToken());

      if (token.nameid == this.username) {
        this.SanPedroSula = moment().tz('America/Tegucigalpa').format('HH:mm:ss');
        this._colaboradorService.getWeather('15.5049', '-88.0256').subscribe((data) => {
        this.spsTemperatura = Math.round(data.main.temp - 273.15);
        });        
        this.Madrid = moment().tz('Europe/Madrid').format('HH:mm:ss');
        this._colaboradorService.getWeather('40.4168', '-3.7038').subscribe((data) => {
        this.madridTemperatura = Math.round(data.main.temp - 273.15);
        }); 
        this.Alajuela = moment().tz('America/Costa_Rica').format('HH:mm:ss');
        this._colaboradorService.getWeather('10.0170', '-84.2147').subscribe((data) => {
        this.alajuelaTemperatura = Math.round(data.main.temp - 273.15);
        });
        this.obtenerColaborador(colaboradorId).subscribe(() => { 
          this.obtenerCumpleaneros()

          this.obtenerCumpleaniero().then(() => {
            const diasDespuesCumpleanio = 9000;
            const fechaHoy = new Date();
            const fechaCumpleanio = new Date(this.fechaFormateadaCumpleanio);
          
            const diferenciaDias = Math.floor((fechaHoy.getTime() - fechaCumpleanio.getTime()) / (1000 * 60 * 60 * 24));
          
            if (diferenciaDias >= 0 && diferenciaDias <= diasDespuesCumpleanio && this.tamanoArreglo == 0) {
              this.openModal();
            } else {
            }
          });

          this.obtenerAniversario().then(() => {
            const fechaHoy = new Date();
            const fechaAniversario = new Date(this.fechaFormateada);
            const diasDespuesAniversario = 9000;
          
            const diferenciaDiasAniversario = Math.floor((fechaHoy.getTime() - fechaAniversario.getTime()) / (1000 * 60 * 60 * 24));
          
            if (diferenciaDiasAniversario >= 0 && diferenciaDiasAniversario <= diasDespuesAniversario && this.tamanoArregloAniversario == 0) {
              if (this.AniosAniversario > 0) {
                this.openModalAniversario();
              }
            }
          });

        });
      }else{
        alert('Acceso no Autorizado...')
        window.history.back();
      }
    }
    
    DecodeToken(token: string): string {
      return jwt_decode(token);
      }

      obtenerDiaYMes(fecha:string) {
        const partes = fecha.split('-');
    
        this.dia = parseInt(partes[0].replace('.', ''), 10);
    
        this.mes = partes[1];
      }

    obtenerColaborador(codigo_colaborador: number) {
      return this._colaboradorService.obtenerColaborador(codigo_colaborador).pipe(
        switchMap(data => {
          this.colaboradorSeleccionado = data;
          this.puesto = data.descripcioN_POSICION_LARGA;
          this.colaboradorId = data.nO_EMPLE;
          this.unidadN = data.unidaD_NEGOCIO;
          this.centroC = data.descriP_CENTRO_COSTO;
          this.sesionAgregada = true;
          this.pais = data.pais;
          this.fechaIngreso = data.fechA_INGRESO;
          this.fechaNacimiento = data.fechA_NACIMIENTO;
          
          const fechaNacimientoCompleta = data.fechA_NACIMIENTO;
          this.fechaIngresoValidarCumpleanio = this.obtenerDiaYMes(fechaNacimientoCompleta);
          this.fechaFormateadaCumpleanio = (this.dia+'-'+this.mes)

          const fechaIngresoCompleta = data.fechA_INGRESO;
          
          this.fechaIngresoValidar = this.obtenerDiaYMes(fechaIngresoCompleta);
          this.fechaFormateada = (this.dia+'-'+this.mes)
          this.obtenerCredencial(codigo_colaborador)
          return of(null); 
        })
      );
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

    formatDate(date: Date): string {
      return this.datePipe.transform(date, 'dd-MMM.-yy') || '';
    }

    transformarFecha(fecha: string): string {
      const fechaOriginal = new Date(fecha);
      const fechaFormateada = this.datePipe.transform(fechaOriginal, 'yyyy-MM-dd');
      return fechaFormateada;
    }

    async obtenerCumpleaneros() {
      try {
        const fechaActual = new Date();
        const anio = fechaActual.getFullYear();
        const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
        const dia = fechaActual.getDate().toString().padStart(2, '0');
        const fechaHoy = `${mes}-${dia}`;
        const fechaHoyParaCumpleanieros = `${anio}-${mes}-${dia}`;
        const diaDelMes = fechaActual.getDate();
        this.diaDelMes = diaDelMes

        const data = await this._colaboradorService.getCumpleaneros(fechaHoy).toPromise();
        this.listCumpleaneros = data;

        const data2 = await this._colaboradorService.getCumpleaneros(fechaHoyParaCumpleanieros).toPromise();
        this.listCumpleaneros2 = data2;
      } catch (error) {
        console.error(error);
      }
    }

    async obtenerCumpleaniero() {
      try {
        const fechaActual = new Date();
        const year = fechaActual.getFullYear().toString();
        const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
        const dia = fechaActual.getDate().toString().padStart(2, '0');
        const fechaHoy = `${year}-${mes}-${dia}`;
        const diaDelMes = fechaActual.getDate();
        this.diaDelMes = diaDelMes
  
        const data = await this._colaboradorService.getCumpleanio(this.colaboradorId, this.transformarFecha(this.fechaNacimiento)).toPromise();
        this.listCumpleanio = data;
        this.tamanoArreglo = this.listCumpleanio.length;

      } catch (error) {
        console.error(error);
      }
    }
    async obtenerAniversario() {
      try {
        const fechaActual = new Date();
        const year = fechaActual.getFullYear().toString();
        const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0');
        const dia = fechaActual.getDate().toString().padStart(2, '0');
        const fechaHoy = `${year}-${mes}-${dia}`;
        const diaDelMes = fechaActual.getDate();
        this.diaDelMes = diaDelMes
  
        const data = await this._colaboradorService.getAniversario(this.fechaIngreso, this.colaboradorId).toPromise();
        this.AniosAniversario = data.años;
        this.tamanoArregloAniversario = data.resultados.length;
      } catch (error) {
        console.error(error);
      }
    }

    async actualizarSesionCumpleanio() {
      const data = await this._credencialService.getMaxSesion().toPromise();
      this.maxValor = data;

      const ACTUALIZARINICIOSESION: Historial_InicioSesion = {
        sesioN_ID: this.maxValor,
        codigO_COLABORADOR: this.colaboradorId,
        fechA_INGRESO: this.fechaNacimiento,
        unidaD_NEGOCIO: this.centroC,
        centrO_COSTO: this.centroC,
        fechA_CREACION: this.fechaA,
        fechA_MODIFICACION: this.fechaA,
        usuariO_CREO: this.colaboradorId,
        usuariO_CAMBIO: this.colaboradorId,
      }
      this._credencialService.actualizarSesion(this.maxValor.toString(), ACTUALIZARINICIOSESION).subscribe(data => {
      }, error => {
      })
    }
    
    async actualizarSesionAniversario() {
      const data = await this._credencialService.getMaxSesion().toPromise();
      this.maxValor = data;
  
      const ACTUALIZARINICIOSESION: Historial_InicioSesion = {
        sesioN_ID: this.maxValor,
        codigO_COLABORADOR: this.colaboradorId,
        fechA_INGRESO: this.fechaIngreso,
        unidaD_NEGOCIO: this.centroC,
        centrO_COSTO: this.centroC,
        fechA_CREACION: this.fechaA,
        fechA_MODIFICACION: this.fechaA,
        usuariO_CREO: this.colaboradorId,
        usuariO_CAMBIO: this.colaboradorId,
      }
      this._credencialService.actualizarSesion(this.maxValor.toString(), ACTUALIZARINICIOSESION).subscribe(data => {
      }, error => {
      })
    }

  cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('profileImage')
  }

  openModal() {
    const modalId = 'exampleModal';
    const currentModal = document.getElementById(modalId);
    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    const balloonsContainer = document.querySelector('.balloons-container') as HTMLElement;
  
    if (currentModal && overlay && balloonsContainer) {
      if (!currentModal.classList.contains('show')) {
        currentModal.classList.add('show');
        currentModal.setAttribute('aria-hidden', 'false');
        currentModal.style.display = 'block';
  
        overlay.style.display = 'block';
  
        // Muestra los globos aquí
        balloonsContainer.innerHTML = ''; // Limpia el contenido previo si es necesario
        for (let i = 0; i < 3; i++) { // Ajusta según la cantidad de globos que desees mostrar
          const balloon = document.createElement('div');
          balloon.className = 'balloon';
          balloonsContainer.appendChild(balloon);
        }
  
        currentModal.addEventListener('click', (event) => {
          if (event.target === currentModal) {
            this.closeModal();
          }
        });
      }
    }
    this.actualizarSesionCumpleanio();
  }  
  closeModal() {
    const modalId = 'exampleModal';
    const currentModal = document.getElementById(modalId);
    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    const balloonsContainer = document.querySelector('.balloons-container') as HTMLElement;
  
    if (currentModal && overlay && balloonsContainer) {
      currentModal.classList.remove('show');
      currentModal.setAttribute('aria-hidden', 'true');
      currentModal.style.display = 'none';
  
      if (overlay.style) {
        overlay.style.display = 'none';
      }
    }
  } 
  openModalAniversario() {
    const modalId = 'aniversario';
    const currentModal = document.getElementById(modalId);
    const overlay = document.querySelector('.modal-overlay-aniversario') as HTMLElement;
  
    if (currentModal && overlay) {
      if (!currentModal.classList.contains('show')) {
        currentModal.classList.add('show');
        currentModal.setAttribute('aria-hidden', 'false');
        currentModal.style.display = 'block';
  
        overlay.style.display = 'block';
  
        currentModal.addEventListener('click', (event) => {
          if (event.target === currentModal) {
            this.closeModalAniversario();
          }
        });
      }
    }
    this.actualizarSesionAniversario();
  }  
  closeModalAniversario() {
    const modalId = 'aniversario';
    const currentModal = document.getElementById(modalId);
    const overlay = document.querySelector('.modal-overlay-aniversario') as HTMLElement;
  
    if (currentModal && overlay) {
      currentModal.classList.remove('show');
      currentModal.setAttribute('aria-hidden', 'true');
      currentModal.style.display = 'none';
  
      if (overlay.style) {
        overlay.style.display = 'none';
      }
    }
  } 
}

function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}

