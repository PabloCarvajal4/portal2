import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { Credencial } from 'src/app/models/credencial';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { CredencialService } from 'src/app/services/credencial.service';
import { Historial_InicioSesion } from 'src/app/models/iniciosesion';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NgToastService } from 'ng-angular-popup';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DatePipe } from '@angular/common';
import * as moment from 'moment-timezone';
import { Console } from 'console';

@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.css']
})
export class HomeAdminComponent implements OnInit{
  colaboradorForm: FormGroup;
  correoForm: FormGroup;
  id: string | null;
  listProductos: Credencial[] = [];
  listColaboradoresArea: Colaborador[] = [];
  listCumpleaneros: Colaborador[] = [];
  listCumpleaneros2:any;
  listCumpleanio: Colaborador[] = [];
  AniosAniversario:any;
  colaboradorSeleccionado: any;
  colaboradoresSeleccionados: any;
  username: any;
  puesto:any;
  esAdmin: boolean = false;
  user = {
    codigo_colaborador: '',
    contrasena:''
  }
  colaboradorId: number | undefined;
  maxConsultaId!: number ;
  maxValor!: number;
  fechaI!:any;
  unidadN!:any;
  centroC!:any;
  fechaA!:any;
  departamento!:any;
  correo!:any;
  archivoAdjunto: Blob | null = null;
  destinatarios: string = '';
  asunto: string = '';
  cuerpo: string = '';
  documentoSubido:any;
  nombreImagen:any;
  diaDelMes:any;
  pais:any;
  fechaIngreso:any;
  fechaIngresoValidar:any;
  fechaNacimiento:any;
  tamanoArreglo:any;
  tamanoArregloAniversario:any;
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

  constructor(private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService,private toast: NgToastService,
    private fb: FormBuilder, private datePipe: DatePipe,
    private aRouter: ActivatedRoute, private _credencialService: CredencialService, private http: HttpClient) 
    { 
      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0);
      this.fechaA = fechaActual;

      this.colaboradorForm = this.fb.group({
        numero_identidad: ['', Validators.required],
        nombre: ['', Validators.required],
        unidad_organizativa: ['', Validators.required],
        unidad_negocio: ['', Validators.required],
        centro_costo: ['', Validators.required],
        estado: ['', Validators.required],
        fecha_ingreso: ['', Validators.required],
        cargo: ['', Validators.required],
        numero_patronal: ['', Validators.required],
        pais: ['', Validators.required],
        ciudad: ['', Validators.required],
        fecha_creacion: ['', Validators.required],
        fecha_modificacion: ['', Validators.required],
        usuario_creo: ['', Validators.required],
        usuario_cambio: ['', Validators.required],
        departamento: ['', Validators.required],
      })
      this.id = this.aRouter.snapshot.paramMap.get('codigo_colaborador');

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
  
        this.correoForm = this.fb.group({
          destinatarios: ['', Validators.required],
          asunto: ['', Validators.required],
          cuerpo: ['', Validators.required],
          archivoAdjunto: [''],
        });
      }else{
        alert('Acceso no Autorizado...')
        window.history.back();
      }
    }

  DecodeToken(token: string): string {
    return jwt_decode(token);
    }
     
    transformarFecha(fecha: string): string {
      const fechaOriginal = new Date(fecha);
      const fechaFormateada = this.datePipe.transform(fechaOriginal, 'yyyy-MM-dd');
      return fechaFormateada;
    }

    obtenerDiaYMes(fecha:string) {
      const partes = fecha.split('-');
  
      this.dia = parseInt(partes[0].replace('.', ''), 10);
  
      this.mes = partes[1];
    }

  obtenerColaborador(codigo_colaborador: number) {
    const gerente = /gerente/gi
    return this._colaboradorService.obtenerColaborador(codigo_colaborador).pipe(
      switchMap(data => {
        this.colaboradorSeleccionado = data;
        this.puesto = data.descripcioN_POSICION_LARGA;
        this.colaboradorId = data.nO_EMPLE;
        this.unidadN = data.unidaD_NEGOCIO;
        this.centroC = data.descriP_CENTRO_COSTO;
        this.pais = data.pais;
        this.fechaIngreso = data.fechA_INGRESO;
        this.fechaNacimiento = data.fechA_NACIMIENTO;
        const fechaNacimientoCompleta = data.fechA_NACIMIENTO;
          
        this.fechaIngresoValidarCumpleanio = this.obtenerDiaYMes(fechaNacimientoCompleta);
        this.fechaFormateadaCumpleanio = (this.dia+'-'+this.mes)

        const fechaIngresoCompleta = data.fechA_INGRESO;
          
          this.fechaIngresoValidar = this.obtenerDiaYMes(fechaIngresoCompleta);
          this.fechaFormateada = (this.dia+'-'+this.mes)
          this.obtenerCredencial(codigo_colaborador);

        if (this.puesto.match(gerente)) {
          this.esAdmin = true;
        }else{
          this.esAdmin = false
        }
        this.departamento = data.departamento;
        this.obtenerColaboradoresArea(this.departamento);
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
      this.diaDelMes = diaDelMes;
      
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

  obtenerColaboradoresArea(area: string){
    this._colaboradorService.obtenerColaboradoresArea(area).subscribe(data => {
      this.listColaboradoresArea = data.map(colaborador => colaborador.email);
      const correos = data.map(colaborador => colaborador.email);
      this.correoForm.get('destinatarios').patchValue(correos);
    }, error => {
      console.log(error);
    });
  }
  
  enviarCorreoGeneral(){
    if (this.correoForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('Destinatarios', this.correoForm.get('destinatarios').value);
    formData.append('Asunto', this.correoForm.get('asunto').value);
    formData.append('Cuerpo', this.correoForm.get('cuerpo').value);
    formData.append('ArchivoAdjunto', this.correoForm.get('archivoAdjunto').value);

    this.http.post('http://10.10.0.30:8082/api/email/enviar-general', formData).subscribe(
      () => {
        console.log('Correo enviado correctamente');
        this.correoForm.reset();
      },
      (mensaje) => {
        this.toast.success({ detail: "Correo Enviado", summary: 'Envío Exitoso', duration: 3000 });
        this.correoForm.get('asunto').setValue(''); 
        this.correoForm.get('cuerpo').setValue(''); 
        this.correoForm.get('archivoAdjunto').setValue(null);
      }
    );
  }

  handleFileInput(event: any) {
    if (event.target.files.length > 0) {
      this.correoForm.get('archivoAdjunto').setValue(event.target.files[0]);
    }
  }

  enviarCorreoEspecifico(){
    const formData = new FormData();
    formData.append('Destinatarios', this.destinatarios);
    formData.append('Asunto', this.asunto);
    formData.append('Cuerpo', this.cuerpo);
    if (this.archivoAdjunto) {
      formData.append('ArchivoAdjunto', this.archivoAdjunto);
    }

    this.http.post('http://10.10.0.30:8082/api/email/enviar', formData).subscribe(
      (response) => {
        console.log('Correo enviado correctamente:', response);
      },
      (mensaje) => {
        this.toast.success({ detail: "Correo Enviado", summary: 'Envío Exitoso', duration: 3000 });
        this.asunto = ''; 
        this.cuerpo = '';
        this.archivoAdjunto = null;
      }
    );
  }

  onFileSelected(event: any) {
    this.archivoAdjunto = event.target.files[0];
  }

  cerrarSesion() {
    localStorage.removeItem('token');
  }

  openModal() {
    const modalId = 'cumpleanio';
    const currentModal = document.getElementById(modalId);
    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    const balloonsContainer = document.querySelector('.balloons-container') as HTMLElement;
  
    if (currentModal && overlay && balloonsContainer) {
      if (!currentModal.classList.contains('show')) {
        currentModal.classList.add('show');
        currentModal.setAttribute('aria-hidden', 'false');
        currentModal.style.display = 'block';
  
        overlay.style.display = 'block';
  
        balloonsContainer.innerHTML = ''; 
        for (let i = 0; i < 3; i++) { 
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
    const modalId = 'cumpleanio';
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
    this.actualizarSesionAniversario()
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

