import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { Credencial } from 'src/app/models/credencial';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { CredencialService } from 'src/app/services/credencial.service';
import { CorreoService } from 'src/app/services/correo.service';
import { Historial_InicioSesion } from 'src/app/models/iniciosesion';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { NgToastService } from 'ng-angular-popup';
import { JwtHelperService } from '@auth0/angular-jwt';
import { features } from 'process';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import html2canvas from 'html2canvas';
import { DatePipe } from '@angular/common';
import { jsPDF } from 'jspdf';
import * as moment from 'moment-timezone';
import { SafeUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-home-ddhh',
  templateUrl: './home-ddhh.component.html',
  styleUrls: ['./home-ddhh.component.css']
})
export class HomeDdhhComponent implements OnInit{
  @ViewChild('tableContainer', { static: false }) tableContainer: ElementRef;
  
  colaboradorForm: FormGroup;
  correoForm: FormGroup;
  correoGeneralForm: FormGroup;
  id: string | null;
  listColaboradoresArea: Colaborador[] = [];
  listColaboradoresGeneral: Colaborador[] = [];
  listCumpleaneros: Colaborador[] = [];
  listCumpleaneros2:any;
  listCumpleanio: Colaborador[] = [];
  credencialSeleccionado:any;
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
  depto:any;
  pais:string;
  documentoSubido:any;
  nombreImagen:any;
  fechaNacimiento:any;
  fechaIngreso:any;
  fechaIngresoValidar:any;
  fechaCumpleaneros: Date | undefined;
  diaDelMes:any;
  tamanoArreglo:any;
  tamanoArregloAniversario:any;
  correosGeneral:any;
  archivoBase:any;
  activado = false;
  horaYMinutos: string = "06:00";
  fechaFormateada:any;
  fechaIngresoValidarCumpleanio:any;
  fechaFormateadaCumpleanio:any;
  dia: number;
  mes: string;
  
  SanPedroSula:any;
  spsTemperatura:any;
  Madrid:any;
  madridTemperatura:any;
  Alajuela:any;
  alajuelaTemperatura:any;

  constructor(private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService,private toast: NgToastService, private fb: FormBuilder, private aRouter: ActivatedRoute,  private http: HttpClient, private _correoService: CorreoService, private _credencialService: CredencialService, private sanitizer: DomSanitizer, private datePipe: DatePipe) 
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
          this.obtenerCredencial(colaboradorId);
          this.obtenerCumpleaneros();

          this.obtenerCumpleaniero().then(() => {
            const diasDespuesCumpleanio = 9000;
            const fechaHoy = new Date();
            const fechaCumpleanio = new Date(this.fechaFormateadaCumpleanio);
          
            const diferenciaDias = Math.floor((fechaHoy.getTime() - fechaCumpleanio.getTime()) / (1000 * 60 * 60 * 24));
          
            if (diferenciaDias >= 0 && diferenciaDias <= diasDespuesCumpleanio && this.tamanoArreglo == 0) {
              this.openModalCumpleanio();
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

      } else {
        alert('Acceso no Autorizado...')
        window.history.back();
      }
      this.correoForm = this.fb.group({
        destinatarios: ['', Validators.required],
        asunto: ['', Validators.required],
        cuerpo: ['', Validators.required],
        archivoAdjunto: [''],
      });

      this.correoGeneralForm = this.fb.group({
        destinatarios: ['', Validators.required],
        asunto: ['', Validators.required],
        cuerpo: ['', Validators.required],
        archivoAdjunto: [''],
      });

    }

    toggleEstado() {
      this.activado = !this.activado;
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
    const gerente = /gerente/gi
    const ddhh = 'Desarrollo Humano';

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

        if (this.puesto.match(gerente)) {
          this.esAdmin = true;
        }else{
          this.esAdmin = false
        }
        this.departamento = data.departamento;

        if(this.departamento == 'Desarrollo Humano'){
          this.depto = true;
        }else{
          this.depto = false;
        }

        this.obtenerColaboradoresArea(this.departamento);
        this.obtenerColaboradoresGeneral();
        return of(null); 
      })
    );
  }
  
  obtenerCredencial(codigo_colaborador: number){
    this._credencialService.getCredencial(codigo_colaborador).subscribe(data => {
      this.credencialSeleccionado = data;
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

  obtenerColaboradoresArea(area: string){
    this._colaboradorService.obtenerColaboradoresArea(area).subscribe(data => {
      this.listColaboradoresArea = data.map(colaborador => colaborador.email);
      const correos = data.map(colaborador => colaborador.email);
      this.correoForm.get('destinatarios').patchValue(correos);
    }, error => {
      console.log(error);
    });
  }
  
  obtenerColaboradoresGeneral() {
    this._colaboradorService.getColaboradores().subscribe(data => {
      this.listColaboradoresGeneral = data.map(colaborador => colaborador.email);
      const correosGeneral = data.map(colaborador => colaborador.email);

      const correosComoCadena = correosGeneral.join(', ');
      this.correoGeneralForm.get('destinatarios').patchValue(correosComoCadena);
      this.correosGeneral = correosComoCadena;
  
    }, error => {
      console.log(error);
    });
  }
  

   formatearFecha(fecha: Date): string {
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dia = fecha.getDate().toString().padStart(2, '0');
    
    return `${mes}-${dia}`;
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

  enviarCorreoGeneral(){
    const formData = new FormData();
    formData.append('Destinatarios', this.correoGeneralForm.get('destinatarios').value);
    formData.append('Asunto', this.correoGeneralForm.get('asunto').value);
    formData.append('Cuerpo', this.correoGeneralForm.get('cuerpo').value);
    formData.append('ArchivoAdjunto', this.correoGeneralForm.get('archivoAdjunto').value);

    this.http.post('http://10.10.0.30:8082/api/email/enviar-general', formData).subscribe(
      () => {
        this.toast.success({detail:"Mensaje Enviado",summary:'Correo Enviado Correctamente', duration:5000});
        this.correoGeneralForm.reset();
      },
      (mensaje) => {
        this.toast.success({ detail: "Correo Enviado", summary: 'Envío Exitoso', duration: 3000 });
        this.correoGeneralForm.get('asunto').setValue(''); 
        this.correoGeneralForm.get('cuerpo').setValue(''); 
        this.correoGeneralForm.get('archivoAdjunto').setValue(null);
      }
    );
  }

  enviarCorreoDDHH(){
    const formData = new FormData();
    formData.append('Destinatarios', this.correoForm.get('destinatarios').value);
    formData.append('Asunto', this.correoForm.get('asunto').value);
    formData.append('Cuerpo', this.correoForm.get('cuerpo').value);
    formData.append('ArchivoAdjunto', this.correoForm.get('archivoAdjunto').value);

    this.http.post('http://10.10.0.30:8082/api/email/enviar-general', formData).subscribe(
      () => {
        this.toast.success({detail:"Mensaje Enviado",summary:'Correo Enviado Correctamente', duration:5000});
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

  convertirImagen(opcion: number, format: 'jpeg' | 'png' = 'png') {
    const content = this.tableContainer.nativeElement;
  
    this.convertirImagenBase64(format).then(base64String => {
      this.archivoBase = base64String;
  
      if (opcion == 1){
        this.enviarCorreoAutomatico()
        //this.enviarCumpleaniosCorreoAutomatico();
      }else{
      this.enviarCumpleaniosCorreo();
    }
    }).catch(error => {
      console.error('Error al convertir la imagen:', error);
    });
  }

  enviarCumpleaniosCorreo() {
    const pdfBase = this.archivoBase;
    const base64 = pdfBase.split(',')[1];

    console.log(this.correosGeneral);
    this._correoService.enviarCorreoConAdjuntoImagen(this.correosGeneral, '¡Cumpleañeros del Día!', base64, 'Cumpleañeros_del_Dia.png')
      .subscribe(response => {
        this.toast.success({ detail: "¡Enviado al Correo!", summary: 'Correo Enviado Correctamente', duration: 5000 });
      }, error => {
        console.error('Error al enviar el correo', error);
      });
  }

  enviarCorreoAutomatico() {
    const pdfBase = this.archivoBase;
    const base64 = pdfBase.split(',')[1];

    const [hora, minutos] = this.horaYMinutos.split(':');
    const correoRequest = {
      destinatario : this.correosGeneral,
      asunto: '¡Cumpleañeros del Día!',
      pdfData: base64, 
      hora: +hora,
      minutos: +minutos
    };

    this._correoService.enviarCorreoAutomatico(correoRequest).subscribe(
      (response) => {
        console.log('Correo enviado correctamente', response);
      },
      (error) => {
        console.error('Error al enviar el correo', error);
      }
    );
  }

  handleFileInput(event: any) {
    if (event.target.files.length > 0) {
      this.correoForm.get('archivoAdjunto').setValue(event.target.files[0]);
      this.correoGeneralForm.get('archivoAdjunto').setValue(event.target.files[0]);
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

  openModalCumpleanio() {
    const modalId = 'exampleModal';
    const currentModal = document.getElementById(modalId);
    const overlay = document.querySelector('.modal-overlay') as HTMLElement;
    const balloonsContainer = document.querySelector('.balloons-container') as HTMLElement; // Agregado
  
    if (currentModal && overlay && balloonsContainer) {
      if (!currentModal.classList.contains('show')) {
        currentModal.classList.add('show');
        currentModal.setAttribute('aria-hidden', 'false');
        currentModal.style.display = 'block';
  
        overlay.style.display = 'block';
  
        for (let i = 0; i < 35; i++) {
          const balloon = document.createElement('div');
          balloon.className = 'balloon';
          balloonsContainer.appendChild(balloon);
        }
  
        currentModal.addEventListener('click', (event) => {
          if (event.target === currentModal) {
            this.closeModalCumpleanio();
          }
        });
      }
    }
    this.actualizarSesionCumpleanio();
  }  
  closeModalCumpleanio() {
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

  convertirImagenBase64(format: 'jpeg' | 'png' = 'png'): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const content = this.tableContainer.nativeElement;
  
      html2canvas(content, { useCORS: true }).then(canvas => {
        try {
          const imgData = canvas.toDataURL(`image/${format}`);
          resolve(imgData);
        } catch (error) {
          reject(error);
        }
      });
    });
  }
}

function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}

