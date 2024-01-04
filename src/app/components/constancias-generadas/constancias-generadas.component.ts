import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { Constancias } from 'src/app/models/contancias';
import { ConstanciasGeneradas } from 'src/app/models/constancias-generadas';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { ConstanciasService } from 'src/app/services/constancias.service';
import { CredencialService } from 'src/app/services/credencial.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { DatePipe } from '@angular/common'
import { NgToastService } from 'ng-angular-popup';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ok } from 'assert';

@Component({
  selector: 'app-constancias-generadas',
  templateUrl: './constancias-generadas.component.html',
  styleUrls: ['./constancias-generadas.component.css']
})
export class ConstanciasGeneradasComponent {
  listConstancias: ConstanciasGeneradas[] = [];
  colaboradorSeleccionado: any;
  username: any;
  codigo_colaborador!: number;
  colaboradorId: number | undefined;
  user = {
    codigo_colaborador: '',
    contrasena:''
  }
   maxConsultaId!: number ;
  maxValor!: number;
  puesto:any;
  esAdmin: boolean = false;
  nombre:any;
  identidad: any;
  unidad_negocio: any;
  cargo: any;
  fecha_ingreso: any;
  fecha_emision: any;
  num_patronal:any;
  compania:any;
  departamento:any;
  depto:any;
  pais:any;
  verificado: boolean = false;
  documentoSubido:any;
  nombreImagen:any;
  nombreArchivoConstancia:any;
  filter ='';
  filterTipoConstancia ='';
  constancia_id:any;

  model = {
    constancia_id: 1,
    tipo_constancia: '',
    fecha_emision: new Date('2023-10-10'),
    codigo_colaborador: 10,
    zona: '',
    tipo_accion: '',
    referencia:1,
    destinatario: '',
    asunto: '',
    verificado: '',
    FECHA_CREACION: new Date('2023-10-10'),
    FECHA_MODIFICACION:new Date('2023-10-10'),
    USUARIO_CREO: 1,
    USUARIO_CAMBIO: 1
  };

  verificacion:boolean = false;
  checked:boolean;
  contrasenaModal:any;
  credencialSeleccionado:any;
  contrasena:any;

   constructor(private sanitizer: DomSanitizer, private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService, private fb: FormBuilder, private aRouter: ActivatedRoute, 
    private datePipe: DatePipe, private toast: NgToastService, private _credencialService: CredencialService,private _constanciaService: ConstanciasService, private http: HttpClient) {

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
        try {
          await this.obtenerColaborador(colaboradorId);
          this.colaboradorId = colaboradorId;
          this.obtenerConstanciasGeneradasNuevas();
        } catch (error) {
          console.error(error);
        }
      } else {
        alert('Acceso no Autorizado...');
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
        this.nombre = data.nombre;
        this.identidad = data.identidaD_FORMATO;
        this.puesto = data.descripcioN_POSICION_LARGA;
        this.unidad_negocio = data.unidaD_NEGOCIO;
        this.fecha_ingreso = data.fechA_INGRESO;
        this.num_patronal = data.numerO_PATRONAL;
        this.compania = data.descripcioN_CIA;
        this.departamento = data.departamento;
        this.pais = data.pais;
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
  
    obtenerImagen() {
      this._colaboradorService.obtenerImagen(this.nombreImagen).subscribe(
        (imagen: Blob) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            this.documentoSubido = this.sanitizer.bypassSecurityTrustResourceUrl(reader.result as string);
          };
          reader.readAsDataURL(imagen);
        },
        error => {
          console.error('Error al obtener la imagen', error);
        }
      );
    }
    obtenerConstanciasGeneradasNuevas() {
      this._constanciaService.getConstanciasNuevas().subscribe(
        data => {
          this.listConstancias = data;
          this.listConstancias.forEach(constancia => constancia.verificado == constancia.verificado || false);
        },
        error => {
          console.log(error);
        }
      );
    }
    
    obtenerConstanciasGeneradasVerificadas(){
      this._constanciaService.getConstanciasVerificadas().subscribe(data => {
        this.listConstancias = data;
        this.model.verificado = data.verificado;

      }, error => {
        console.log(error);
      })
    }

    async obtenerConstanciaId(event: Event, comprobanteId: number) {
      event.preventDefault();
    
      try {
        const data = await this._constanciaService.getConstanciaId(comprobanteId).toPromise();
    
        const constanciaIndex = this.listConstancias.findIndex(constancia => constancia.constanciA_ID === this.constancia_id);
        if (constanciaIndex !== -1) {
          this.listConstancias[constanciaIndex] = { ...data, mostrarCheckbox: true };
        }
    
        this.model.constancia_id = data.constanciA_ID;
        this.model.tipo_constancia = data.tipO_CONSTANCIA;
        this.model.fecha_emision = data.fechA_EMISION;
        this.model.codigo_colaborador = data.codigO_COLABORADOR;
        this.model.zona = data.zona;
        this.model.tipo_accion = data.tipO_ACCION;
        this.model.referencia = data.referencia;
        this.model.FECHA_CREACION = data.fechA_CREACION;
        this.model.FECHA_MODIFICACION = data.fechA_MODIFICACION;
        this.model.USUARIO_CREO = data.usuariO_CREO;
        this.model.USUARIO_CAMBIO = data.usuariO_CAMBIO;
        this.model.destinatario = data.destinatario;
        this.model.asunto = data.asunto;

        this.verificarConstancia(this.model.constancia_id);
      } catch (error) {
        console.log(error);
      }
    }
    

    verificarConstancia(constanciaId: number) {
      const CONSTANCIAS: Constancias = {
        constanciA_ID: this.model.constancia_id,
        tipO_CONSTANCIA: this.model.tipo_constancia,
        fechA_EMISION: this.model.fecha_emision,
        codigO_COLABORADOR: this.model.codigo_colaborador,
        zona: this.model.zona,
        tipO_ACCION: this.model.tipo_accion,
        fechA_CREACION: this.model.FECHA_CREACION,
        fechA_MODIFICACION: this.model.FECHA_MODIFICACION,
        usuariO_CREO: this.model.USUARIO_CREO,
        usuariO_CAMBIO: this.model.USUARIO_CAMBIO,
        referencia: this.model.referencia,
        destinatario:this.model.destinatario,
        asunto: this.model.asunto,
        verificado: 'Si',
      }
  
      this._constanciaService.ActualizarConstancia(constanciaId,CONSTANCIAS).subscribe(data => {
        //setTimeout(() => {
        //  location.reload();
        //}, 2000);
      }, error => {

      })
    }

    async obtenerConstanciaPorColaborador(constanciaId: number) {
      try {
        const data = await this._constanciaService.getConstanciaId(constanciaId).toPromise();
        this.listConstancias = data;
        this.nombreArchivoConstancia = data.documento
        this.obtenerArchivoConstancia()
      } catch (error) {
        console.error(error);
      }
    }
    
    obtenerArchivoConstancia() {
      this._constanciaService.obtenerImagen(this.nombreArchivoConstancia).subscribe(
        (pdf: Blob) => {
          const blobUrl = URL.createObjectURL(pdf);
          const safeUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
          this.documentoSubido = safeUrl;
        },
        error => {
          console.error('Error al obtener el archivo PDF', error);
        }
      );
    }

    reload(){
      setTimeout(() => {
          location.reload();
        }, 1000);
    }
    
    validatePassword() {
      const userGerente = 'Gerente Corporativo de Desarrollo Humano'
      const isPasswordValid = this.contrasenaModal === 'ladylee';
  
      if (this.puesto == userGerente) {
        this.contrasenaModal === 'l@dyleeHN';
        this.openSecondModal();
      }
      else if(isPasswordValid){
        this.openSecondModal();
      }else {
      this.toast.error({ detail: "Error", summary: 'Contraseña Incorrecta', duration: 3000 });
      }
    }
  
    openSecondModal() {
      const currentModal = document.getElementById('staticBackdrop');
      if (currentModal) {
        currentModal.classList.remove('show');
        currentModal.setAttribute('aria-hidden', 'true');
        currentModal.style.display = 'none';
      }

      const secondModal = document.getElementById('constancia');
      if (secondModal) {
        secondModal.classList.add('show');
        secondModal.setAttribute('aria-hidden', 'false');
        secondModal.style.display = 'block';
      }
    }
    
  }

function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}

