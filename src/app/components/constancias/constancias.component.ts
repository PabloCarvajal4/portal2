import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { Constancias } from 'src/app/models/contancias';
import { Fechas } from 'src/app/models/fecha';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { ConstanciasService } from 'src/app/services/constancias.service';
import { CredencialService } from 'src/app/services/credencial.service';
import { BoletaPagoService } from 'src/app/services/boleta-pago.service';
import { CorreoService } from 'src/app/services/correo.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { DatePipe } from '@angular/common'
import { NgToastService } from 'ng-angular-popup';
import * as html2pdf from 'html2pdf.js';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Correo } from 'src/app/models/correo';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import { Observable, catchError, concatMap, forkJoin, from, map, switchMap, tap, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { JwtHelperService } from '@auth0/angular-jwt';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-constancias',
  templateUrl: './constancias.component.html',
  styleUrls: ['./constancias.component.css']
})
export class ConstanciasComponent {
  destinatarios: string = '';
  asunto: string = '';
  cuerpo: string = 'Constancia Generada';
  archivoAdjunto: Blob | null = null;

  private pdfBlob: Blob | null = null;
  constanciaForm: FormGroup;
  correoForm: FormGroup;
  opcionSeleccionada: string='';
  opciones: string[] = [
    'Constancia Embajada Americana',
    'Constancia RAP',
    'Constancia de Laboró',
    'Constancia Embajada Mexicana',
    'Constancia IHSS',
    'Constancia sin Deducciones',
    'Constancia con Deducciones',
    'Constancia sin Salario'
  ];
  zonas: string[] = [
    'Zona Norte',
    'Zona Centro Sur',
    'Zona Atlántica'
  ];
  zonaSeleccionada: string='';
  pdfPath: any ; // Ruta del archivo PDF
  pdf: any;
  listConstancias: Constancias[] = [];
  listDeducciones:any;
  colaboradorSeleccionado: any;
  username: any;
  codigo_colaborador!: number;
  colaboradorId: any;
  user = {
    codigo_colaborador: '',
    contrasena:''
  }
   maxConsultaId!: number ;
  maxValor!: number;
  puesto:any;
  esAdmin: boolean = false;
  constancia_id:any;
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
  pais:any
  tipoConstancia:any;
  salario:any;
  fecha_egreso:any;
  ihss:any;

  firmaSello:any;
  tipo_accion:any;
  pdfFile: File | null = null;
  listfecha: Fechas[] = [];
  anio:any;
  mes:any;
  pdfBase:any;
  base64String: string;
  documentoSubido:any;
  nombreImagen:any;
  longitudDeseada = 6
  documento:'hola';
  MaxTipoConstancia:any;

  AtipoConstancia:any;
  AfechaCreacion:any;
  AfechaEmision:any;
  Azona:any;
  private selectedFile: File | null = null;

  credencialSeleccionado:any;
  contrasena:any;
  pdfPathPrueba:any;

  totalDeducciones:any;
  total:any;
  firmaZonaNorteURL:any;
  dirigidaA:any;

   constructor(private sanitizer: DomSanitizer, private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService, private fb: FormBuilder, private aRouter: ActivatedRoute, 
   private datePipe: DatePipe, private toast: NgToastService, private _credencialService: CredencialService,private _constanciaService: ConstanciasService, private _correoService: CorreoService, private http: HttpClient, private _boletapago: BoletaPagoService) {

      const fechaActual = new Date();
      fechaActual.setHours(0, 0, 0, 0); // Establecer la hora a medianoche
      this.constanciaForm = this.fb.group({
        //consulta_id: ['', Validators.required],
        //codigo_colaborador: ['', Validators.required],
        tipo_constancia: ['', Validators.required],
        fecha_emision: [fechaActual, Validators.required],
        zona: ['',Validators.required],
        tipo_accion : ['Impresa',Validators.required],
        fecha_creacion: [fechaActual, Validators.required],
        fecha_modificacion: [fechaActual, Validators.required],
        usuario_creo: [1, Validators.required],
        usuario_cambio : [1, Validators.required],
        destinatario : [''],
        asunto : [''],
        verificado : [null]
      })
      
      this.correoForm = this.fb.group({
        destinatarios: [[''], Validators.required],
        asunto: ['', Validators.required],
        cuerpo: ['Constancia Generada',Validators.required],
        archivo: ['', Validators.required],
      })

    }

    async captureAndConvertToPdf() {
      const iframe = document.querySelector('iframe');
      if (!iframe) {
        console.error('El iframe no se encontró.');
        return;
      }
  
      const iframeContent = iframe.contentDocument.body;
      
      // Configura las opciones para la conversión a PDF
      const pdfOptions = {
        margin: 10,
        filename: 'archivo_adjunto.pdf',
        image: { type: 'pdf', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
  
      const pdf = await html2pdf().from(iframeContent).set(pdfOptions).outputPdf();
  
      const blob = new Blob([pdf], { type: 'application/pdf' });
  
      this.archivoAdjunto = blob;
    }

    onPdfFileSelected(event: any) {
      this.archivoAdjunto = event.target.files[0] as File;
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
        this.obtenerDeducciones();
        
      } else {
        alert('Acceso no Autorizado...');
        window.history.back();
      }
    }

    DecodeToken(token: string): string {
      return jwt_decode(token);
      }
    
      async seleccionarOpcion() {
        await this.obtenerConstancias(this.pais);
      }

      async obtenerConstancias(pais: string) {
        try {
          const data = await this._constanciaService.getConstancias(pais).toPromise();
        } catch (error) {
          console.error(error);
        }
      }

      obtenerMaxConstanciaIdGeneral(): Observable<any> {
        return this._constanciaService.getMaxValorConstancia()
          .pipe(
            tap((resultado: number) => {
              this.maxValor = resultado;
            }),
            catchError(error => {
              console.error('Error al obtener el valor máximo:', error);
              return throwError(error);
            })
          );
      }

      obtenerConstanciaId(): Observable<any> {
        const constanciaSeleccionada = this.constanciaForm.get('tipo_constancia').value;

        return this._constanciaService.getMaxConstancia(constanciaSeleccionada)
          .pipe(
            tap((resultado: number) => {
              this.MaxTipoConstancia = resultado;
            }),
            catchError(error => {
              console.error('Error al obtener el valor máximo:', error);
              return throwError(error);
            })
          );
      }

    llamarObtenerConsultaId() {
  forkJoin([
    this.obtenerConstanciaId(),
    this.obtenerMaxConstanciaIdGeneral()
  ]).pipe(
    switchMap(([consultaIdResult, maxConstanciaIdResult]) => {

      return this.obtenerFechas(maxConstanciaIdResult);
    })
  ).subscribe(
    (fechasResult) => {
    },
    error => {
    }
  );
}
  verPDF(){
    this.pdfPathPrueba = this.embajadaAmericanaNorte()
  }

  mostrarPDF(): Promise<void> {
    return new Promise<void>((resolve) => {
      let pdfPath: string;

    switch (this.opcionSeleccionada) {
      case 'Constancia Embajada Americana':
        if (this.zonaSeleccionada == 'Zona Norte'){
        this.pdfPath = this.embajadaAmericanaNorte();
      }
      if (this.zonaSeleccionada == 'Zona Centro Sur'){
        this.pdfPath = this.embajadaAmericanaCentroSur();
      }
      if (this.zonaSeleccionada == 'Zona Atlántica'){
        this.pdfPath = this.embajadaAmericanaAtlantica();
      }
        break;
      case 'Constancia RAP':
        if (this.zonaSeleccionada == 'Zona Norte'){
          this.pdfPath = this.rapNorte();
        }
        if (this.zonaSeleccionada == 'Zona Centro Sur'){
          this.pdfPath = this.rapCentroSur();
        }
        if (this.zonaSeleccionada == 'Zona Atlántica'){
          this.pdfPath = this.rapAtlantica();
        }
        break;
      case 'Constancia de Laboró':
        if (this.zonaSeleccionada == 'Zona Norte'){
          this.pdfPath =  this.laboroNorte();
        }
        if (this.zonaSeleccionada == 'Zona Centro Sur'){
          this.pdfPath = this.laboroCentroSur();
        }
        if (this.zonaSeleccionada == 'Zona Atlántica'){
          this.pdfPath = this.laboroAtlantica();
        }
          break;
      case 'Constancia Embajada Mexicana':
        if (this.zonaSeleccionada == 'Zona Norte'){
          this.pdfPath =  this.embajadaMexicanaNorte();
        }
        if (this.zonaSeleccionada == 'Zona Centro Sur'){
          this.pdfPath = this.embajadaMexicanaCentroSur();
        }
        if (this.zonaSeleccionada == 'Zona Atlántica'){
          this.pdfPath = this.embajadaMexicanaAtlantica();
        }
        break;
      case 'Constancia IHSS':
        if (this.zonaSeleccionada == 'Zona Norte'){
          this.pdfPath =  this.ihssNorte();
        }
        if (this.zonaSeleccionada == 'Zona Centro Sur'){
          this.pdfPath = this.ihssCentroSur();
        }
        if (this.zonaSeleccionada == 'Zona Atlántica'){
          this.pdfPath = this.ihssAtlantica();
        }
        break;
      case 'Constancia sin Deducciones':
        if (this.zonaSeleccionada == 'Zona Norte'){
          this.pdfPath =  this.sinDeduccionesNorte();
        }
        if (this.zonaSeleccionada == 'Zona Centro Sur'){
          this.pdfPath = this.sinDeduccionesCentroSur();
        }
        if (this.zonaSeleccionada == 'Zona Atlántica'){
          this.pdfPath = this.sinDeduccionesAtlantica();
        }
        break;
        case 'Constancia con Deducciones':
        if (this.zonaSeleccionada == 'Zona Norte'){
          this.pdfPath =  this.conDeduccionesNorte();
        }
        if (this.zonaSeleccionada == 'Zona Centro Sur'){
          this.pdfPath = this.conDeduccionesCentroSur();
        }
        if (this.zonaSeleccionada == 'Zona Atlántica'){
          this.pdfPath = this.conDeduccionesAtlantica();
        }
        break;
      case 'Constancia sin Salario':
        if (this.zonaSeleccionada == 'Zona Norte'){
          this.pdfPath =  this.sinSalarioNorte();
        }
        if (this.zonaSeleccionada == 'Zona Centro Sur'){
          this.pdfPath = this.sinSalarioCentroSur();
        }
        if (this.zonaSeleccionada == 'Zona Atlántica'){
          this.pdfPath = this.sinSalarioAtlantica();
        }
        break;
    }
   this.pdfPath = pdfPath; // Establece el valor de pdfPath en this.pdfPath
    resolve(); // Resuelve la promesa
  });
  }
  

  async obtenerColaborador(codigo_colaborador: number) {
    const gerente = /gerente/gi;
    const ddhh = 'Desarrollo Humano';
    try {
      const data = await this._colaboradorService.obtenerColaborador(codigo_colaborador).toPromise();
      this.colaboradorSeleccionado = data;
      this.colaboradorId = data.nO_EMPLE;
      this.nombre = data.nombre;
      this.identidad = data.identidaD_FORMATO;
      this.puesto = data.descripcioN_POSICION_LARGA;
      this.unidad_negocio = 'data.unidaD_NEGOCIO';
      this.fecha_ingreso = data.fechA_INGRESO;
      this.num_patronal = data.ihss;
      this.compania = data.descripcioN_CIA;
      this.departamento = data.departamento;
      this.pais = data.pais;
      this.salario = data.saL_BAS;
      this.fecha_egreso = data.fechA_EGRESO;

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
  
  obtenerFechas(cod: number): Observable<any> {
    return this._constanciaService.getFecha(cod)
      .pipe(
        map(data => {
          this.listfecha = data;
          this.anio = data.year;
          this.mes = data.month;
        }),
        catchError(error => {
          console.error(error);
          return throwError(error);
        })
      );
  }

   formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
  
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
  
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
  
    return `${dia.toString().padStart(2, '0')}/${mes}/${anio}`;
  }

  formatoNumeroDeReferencia(valor: number, longitud: number): string {
    let referencia = valor.toString();
    while (referencia.length < longitud) {
      referencia = '0' + referencia;
    }
  
    return referencia;
  }

  convertirNumeroALetras(numero: number): string {
    const unidades = ['', 'UN ', 'DOS ', 'TRES ', 'CUATRO ', 'CINCO ', 'SEIS ', 'SIETE ', 'OCHO ', 'NUEVE '];
    const especiales = ['', 'ONCE ', 'DOCE ', 'TRECE ', 'CATORCE ', 'QUINCE ', 'DIECISEIS ', 'DIECISIETE ', 'DIECIOCHO ', 'DIECINUEVE '];
    const decenas = ['', 'DIEZ ', 'VEINTE ', 'TREINTA ', 'CUARENTA ', 'CINCUENTA ', 'SESENTA ', 'SETENTA ', 'OCHENTA ', 'NOVENTA '];
    const centenas = ['', 'CIENTO ', 'DOSCIENTOS ', 'TRESCIENTOS ', 'CUATROCIENTOS ', 'QUINIENTOS ', 'SEISCIENTOS ', 'SETECIENTOS ', 'OCHOCIENTOS ', 'NOVECIENTOS '];
  
    let letras = '';
  
    if (numero === 0) {
      letras = 'CERO';
    } else {
      if (numero >= 1000) {
        letras += this.convertirNumeroALetras(Math.floor(numero / 1000)) + 'MIL ';
        numero %= 1000;
      }
  
      if (numero >= 100) {
        if (numero === 100) {
          letras += 'CIEN ';
        } else {
          letras += centenas[Math.floor(numero / 100)];
        }
        numero %= 100;
      }
  
      if (numero >= 10 && numero <= 19) {
        letras += especiales[numero - 10];
      } else {
        if (numero >= 20) {
          letras += decenas[Math.floor(numero / 10)];
          numero %= 10;
  
          if (numero > 0) {
            letras += unidades[numero];
          }
        } else {
          if (numero > 0) {
            letras += unidades[numero];
          }
        }
      }
    }
  
    return letras.trim();
  }

    async embajadaAmericanaNorte() {
      const fechaActual = new Date();
  
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
  
      const dia = fechaActual.getDate();
      const mes = meses[fechaActual.getMonth()];
      const anio = fechaActual.getFullYear();
  
      const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;
  
      this.fecha_emision = fechaFormateada;

      const headerImageUrl = "assets/firmas/header.jpg"; 
      const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
      const footerImageUrl = "assets/firmas/footer.jpg";
      const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
      let rutaImagenFirma: string;
  
      if (this.compania == 'Servicios Profesionales Administrativos,') {
        rutaImagenFirma = 'assets/firmas/ZonaNorte/ServiciosAdministrativos.jpg';
      } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
        rutaImagenFirma = "assets/firmas/ZonaNorte/Alimentos.jpg";
      }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
        rutaImagenFirma = "assets/firmas/ZonaNorte/Inversiones.jpg";
      }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
        rutaImagenFirma = "assets/firmas/ZonaNorte/CentroTuristico.jpg";
      }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
        rutaImagenFirma = "assets/firmas/ZonaNorte/Almacenes.jpg";
      }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
        rutaImagenFirma = "assets/firmas/ZonaNorte/InmobiliariaAmericana.jpg";
      }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
        rutaImagenFirma = "assets/firmas/ZonaNorte/UrbanizadoraNacional.jpg";
      }if(this.compania == 'Administradora de Servicios'){
        rutaImagenFirma = "assets/firmas/ZonaNorte/AdminInmobiliaria.jpg";
    }
    
    const firmaZN = await this.getBase64ImageFromURL(rutaImagenFirma);
  
      const footerStyle = {
        fontSize: 10,
        color: "gray",
        alignment: "center"
      };
    
      let docDefinition = {
        pageSize: 'letter',
        header: {
          image: headerImageBase64,
          width: 550, 
          alignment: "center", 
          margin: [0, 10, 0, 0] 
        },
        content: [
          {
            text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
            fontSize: 10,
            alignment: "right",
            margin: [0, 0, 0, 0],
          },
          {
            text: "CONSTANCIA",
            fontSize: 16,
            alignment: "center", 
            margin: [0,50,0,0],
            bold: true
          },
          {
            text: [ 
              {
                text: "\nSres. \nEmbajada de los Estados Unidos de Norte América\n\n",
                fontSize: 12,
                alignment: "justify",
                margin: [0, 0, 0, 0],
                bold: true 
              },
              
              "Por este medio ",
              {
                text: "CORPORACION LADY LEE ",
                fontSize: 12,
                alignment: "justify",
                margin: [0, 0, 0, 0],
                bold: true 
              },
              "a través del suscrito hace constar que: ",
              {
                text: `${this.nombre} `,
                fontSize: 12,
                alignment: "justify",
                margin: [0, 0, 0, 0],
                bold: true 
              },
              "con número identidad ",
              {
                text: `${this.identidad}`,
                fontSize: 12,
                alignment: "justify",
                margin: [0, 0, 0, 0],
                bold: true 
              },
              ", labora para ",
              {
                text: `${this.compania} `,
                fontSize: 12,
                alignment: "justify",
                margin: [0, 0, 0, 0],
                bold: true 
              },
              "desempeñando el cargo de ",
              {
                text: `${this.puesto} `,
                fontSize: 12,
                alignment: "justify",
                margin: [0, 0, 0, 0],
                bold: true 
              },
              `desde el ${this.fecha_ingreso} hasta la fecha, devengando un salario mensual de `,
              {
                text: `HNL${this.salario}. `,
                fontSize: 12,
                alignment: "justify",
                margin: [0, 0, 0, 0],
                bold: true 
              },
              {
                text: "\n\n\n\n\n",
                fontSize: 12,
                alignment: "justify",
                margin: [0, 0, 0, 0],
                bold: true 
              },
              {
                text: `Emitida en la ciudad de San Pedro Sula, ${this.fecha_emision}.`,
                fontSize: 12,
                alignment: "justify",
                margin: [0, 0, 0, 0]
              },
              {
                text: `\n\n`,
                fontSize: 12,
                alignment: "justify",
                margin: [0, 0, 0, 0]
              },
            ],
            defaultStyle: {
              font: 'TimesNewRoman', 
            },
            fontSize: 12,
            alignment: "justify",
            margin: [0, 10, 0, 0],
            lineHeight: 1.5 
          },
          {
            image: firmaZN,
            width: 300, 
            height: 130,
            alignment: "center", 
            margin: [0, 0, -60, 0]
       },
       {
        text: "LIC. JAVIER MORÁN \n Jefe Administrativo de Desarrollo Humano \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6079/6026 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
        fontSize: 12,
        alignment: "center",
        margin: [0, 0, 0, 0],
        bold: true,
        lineHeight: 1.0
      }
        ],
        footer: function (currentPage, pageCount) {
          return {
            image: imageBase64,
            width: 550, 
            alignment: "center", 
            style: "footerStyle",
            margin: [0, -50, 0, 0] 
          };
        },
        styles: {
          footerStyle: footerStyle,
        },
        margin: [0, 60, 0, 0] 
      };
  
       await pdfMake.createPdf(docDefinition).getBlob((blob) => {
        this.convertirBlobABase64(blob).then((pdfBase64) => {
          this.pdfBase = pdfBase64;
          this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
          this.agregarConstancia();
        }).catch((error) => {
          console.error('Error al convertir el Blob a base64', error);
        });
      });
    }
  
  async embajadaAmericanaCentroSur() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
      const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
      const footerImageUrl = "assets/firmas/footer.jpg";
      const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/AdminInmobiliaria.jpg";
  }
  
  const firmaZCS = await this.getBase64ImageFromURL(rutaImagenFirma);

    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: "\nSres. \nEmbajada de los Estados Unidos de Norte América\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Por este medio ",
            {
              text: "CORPORACION LADY LEE ",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha, devengando un salario mensual de `,
            {
              text: `HNL${this.salario}. `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: "\n\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de Tegucigalpa, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZCS,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
        {
          text: "LIC. YENSI GARCÍA \n Jefe Regional de Desarrollo Humano Zona Centro Sur \n Corporación Lady Lee \n (504) 2512-6000 Ext. 1712 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
          fontSize: 12,
          alignment: "center",
          margin: [0, 0, 0, 0],
          bold: true,
          lineHeight: 1.0
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async embajadaAmericanaAtlantica() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/AdminInmobiliaria.jpg";
  }
  
  const firmaZA = await this.getBase64ImageFromURL(rutaImagenFirma);

    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: "\nSres. \nEmbajada de los Estados Unidos de Norte América\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Por este medio ",
            {
              text: "CORPORACION LADY LEE ",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha, devengando un salario mensual de `,
            {
              text: `HNL${this.salario}. `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: "\n\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de la Ceiba, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }      
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZA,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },     
        {
          text: "LIC. KARLA BUSTILLO \n Coordinador Regional de Desarrollo Humano Zona Atlántica \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6247 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
          fontSize: 12,
          alignment: "center",
          margin: [0, 0, 0, 0],
          bold: true,
          lineHeight: 1.0
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async rapNorte() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/AdminInmobiliaria.jpg";
  }
  
  const firmaZN = await this.getBase64ImageFromURL(rutaImagenFirma);

    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: "\nSRES. Régimen de Aportaciones Privadas (RAP)\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Por este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ",  laboró para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto}, `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta el ${this.fecha_egreso}. `,
            {
              text: "\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Además, autorizamos al RAP para que le realice el pago de la reserva laboral y sus intereses a la fecha. ",
            {
              text: "\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de San Pedro Sula, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZN,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
        {
          text: "LIC. JAVIER MORÁN \n Jefe Administrativo de Desarrollo Humano \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6079/6026 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
          fontSize: 12,
          alignment: "center",
          margin: [0, 0, 0, 0],
          bold: true,
          lineHeight: 1.0
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0]
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async rapCentroSur() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/AdminInmobiliaria.jpg";
  }
  
  const firmaZCS = await this.getBase64ImageFromURL(rutaImagenFirma);

    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: "\nSRES. Régimen de Aportaciones Privadas (RAP)\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Por este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ",  laboró para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto}, `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta el ${this.fecha_egreso}. `,
            {
              text: "\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Además, autorizamos al RAP para que le realice el pago de la reserva laboral y sus intereses a la fecha. ",
            {
              text: "\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de Tegucigalpa, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZCS,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
        {
          text: "LIC. YENSI GARCÍA \n Jefe Regional de Desarrollo Humano Zona Centro Sur \n Corporación Lady Lee \n (504) 2512-6000 Ext. 1712 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
          fontSize: 12,
          alignment: "center",
          margin: [0, 0, 0, 0],
          bold: true,
          lineHeight: 1.0
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async rapAtlantica() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/AdminInmobiliaria.jpg";
  }
  
  const firmaZA = await this.getBase64ImageFromURL(rutaImagenFirma);

    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: "\nSRES. Régimen de Aportaciones Privadas (RAP)\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Por este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ",  laboró para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto}, `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta el ${this.fecha_egreso}. `,
            {
              text: "\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Además, autorizamos al RAP para que le realice el pago de la reserva laboral y sus intereses a la fecha. ",
            {
              text: "\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de la Ceiba, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZA,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
        {
          text: "LIC. KARLA BUSTILLO \n Coordinador Regional de Desarrollo Humano Zona Atlántica \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6247 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
          fontSize: 12,
          alignment: "center",
          margin: [0, 0, 0, 0],
          bold: true,
          lineHeight: 1.0
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async laboroNorte() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/AdminInmobiliaria.jpg";
  }
  
  const firmaZN = await this.getBase64ImageFromURL(rutaImagenFirma);

    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            "\nPor este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ",  laboró para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto}, `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta el ${this.fecha_egreso}. `,
            {
              text: "\n\n\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de San Pedro Sula, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZN,
          width: 300,
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
        {
          text: "LIC. JAVIER MORÁN \n Jefe Administrativo de Desarrollo Humano \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6079/6026 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
          fontSize: 12,
          alignment: "center",
          margin: [0, 0, 0, 0],
          bold: true,
          lineHeight: 1.0
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async laboroCentroSur() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);

    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/AdminInmobiliaria.jpg";
  }
  
  const firmaZCS = await this.getBase64ImageFromURL(rutaImagenFirma);
  
    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            "\nPor este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ",  laboró para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto}, `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta el ${this.fecha_egreso}. `,
            {
              text: "\n\n\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de Tegucigalpa, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZCS,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
        {
          text: "LIC. YENSI GARCÍA \n Jefe Regional de Desarrollo Humano Zona Centro Sur \n Corporación Lady Lee \n (504) 2512-6000 Ext. 1712 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
          fontSize: 12,
          alignment: "center",
          margin: [0, 0, 0, 0],
          bold: true,
          lineHeight: 1.0
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0]
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async laboroAtlantica() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);

    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/AdminInmobiliaria.jpg";
  }
  
  const firmaZA = await this.getBase64ImageFromURL(rutaImagenFirma);
  
    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            "\nPor este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ",  laboró para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto}, `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta el ${this.fecha_egreso}. `,
            {
              text: "\n\n\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de la Ceiba, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZA,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
        {
          text: "LIC. KARLA BUSTILLO \n Coordinador Regional de Desarrollo Humano Zona Atlántica \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6247 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
          fontSize: 12,
          alignment: "center",
          margin: [0, 0, 0, 0],
          bold: true,
          lineHeight: 1.0
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async embajadaMexicanaNorte() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);

    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/AdminInmobiliaria.jpg";
  }
  
  const firmaZN = await this.getBase64ImageFromURL(rutaImagenFirma);
  
    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: "\nSres. \nEmbajada de Mexico\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Por este medio ",
            {
              text: "CORPORACION LADY LEE ",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha, devengando un salario mensual de `,
            {
              text: `HNL${this.salario}. `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: "\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de San Pedro Sula, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZN,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
        {
          text: "LIC. JAVIER MORÁN \n Jefe Administrativo de Desarrollo Humano \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6079/6026 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
          fontSize: 12,
          alignment: "center",
          margin: [0, 0, 0, 0],
          bold: true,
          lineHeight: 1.0
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async embajadaMexicanaCentroSur() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);

    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/AdminInmobiliaria.jpg";
  }
  
  const firmaZCS = await this.getBase64ImageFromURL(rutaImagenFirma);
  
    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: "\nSres. \nEmbajada de México\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Por este medio ",
            {
              text: "CORPORACION LADY LEE ",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha, devengando un salario mensual de `,
            {
              text: `HNL${this.salario}. `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: "\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de Tegucigalpa, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZCS,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
            {
              text: "LIC. YENSI GARCÍA \n Jefe Regional de Desarrollo Humano Zona Centro Sur \n Corporación Lady Lee \n (504) 2512-6000 Ext. 1712 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
              fontSize: 12,
              alignment: "center",
              margin: [0, 0, 0, 0],
              bold: true,
              lineHeight: 1.0
            }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async embajadaMexicanaAtlantica() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);

    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/AdminInmobiliaria.jpg";
  }
  
  const firmaZA = await this.getBase64ImageFromURL(rutaImagenFirma);
  
    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: "\nSres. \nEmbajada de México\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Por este medio ",
            {
              text: "CORPORACION LADY LEE ",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha, devengando un salario mensual de `,
            {
              text: `HNL${this.salario}. `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: "\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de la Ceiba, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZA,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
        {
          text: "LIC. KARLA BUSTILLO \n Coordinador Regional de Desarrollo Humano Zona Atlántica \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6247 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
          fontSize: 12,
          alignment: "center",
          margin: [0, 0, 0, 0],
          bold: true,
          lineHeight: 1.0
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async ihssNorte() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);

    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/AdminInmobiliaria.jpg";
  }
  
  const firmaZN = await this.getBase64ImageFromURL(rutaImagenFirma);
  
    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center",
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: "\nAtención I.H.S.S\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Por este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha, Inscrito en Guion Patronal de I.H.S.S. `,
            {
              text: `${this.num_patronal}`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: "\n\n\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de San Pedro Sula, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZN,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
            {
              text: "LIC. JAVIER MORÁN \n Jefe Administrativo de Desarrollo Humano \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6079/6026 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
              fontSize: 12,
              alignment: "center",
              margin: [0, 0, 0, 0],
              bold: true,
              lineHeight: 1.0
            }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async ihssCentroSur() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);

    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/AdminInmobiliaria.jpg";
  }
  
  const firmaZCS = await this.getBase64ImageFromURL(rutaImagenFirma);
  
    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0]
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: "\nAtención I.H.S.S\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Por este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha, Inscrito en Guion Patronal de I.H.S.S. `,
            {
              text: `${this.num_patronal}`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: "\n\n\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de Tegucigalpa, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZCS,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
        {
          text: "LIC. YENSI GARCÍA \n Jefe Regional de Desarrollo Humano Zona Centro Sur \n Corporación Lady Lee \n (504) 2512-6000 Ext. 1712 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
          fontSize: 12,
          alignment: "center",
          margin: [0, 0, 0, 0],
          bold: true,
          lineHeight: 1.0
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center",
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async ihssAtlantica() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/AdminInmobiliaria.jpg";
  }
  
  const firmaZA = await this.getBase64ImageFromURL(rutaImagenFirma);

    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: "\nAtención I.H.S.S\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "Por este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha, Inscrito en Guion Patronal de I.H.S.S. `,
            {
              text: `${this.num_patronal}`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: "\n\n\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de la Ceiba, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZA,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
        {
          text: "LIC. KARLA BUSTILLO \n Coordinador Regional de Desarrollo Humano Zona Atlántica \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6247 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
          fontSize: 12,
          alignment: "center",
          margin: [0, 0, 0, 0],
          bold: true,
          lineHeight: 1.0
        }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async sinDeduccionesNorte() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/AdminInmobiliaria.jpg";
  }
  
  const firmaZN = await this.getBase64ImageFromURL(rutaImagenFirma);

    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    const textoDirigidaA = this.dirigidaA ? this.dirigidaA.trim() : '';

    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [
            {
              text: textoDirigidaA && `\nSres. \n${textoDirigidaA}\n`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "\nPor este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha, devengando un salario mensual de `,
            {
              text: `HNL${this.salario}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: "\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de San Pedro Sula, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZN,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
            {
              text: "LIC. JAVIER MORÁN \n Jefe Administrativo de Desarrollo Humano \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6079/6026 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
              fontSize: 12,
              alignment: "center",
              margin: [0, 0, 0, 0],
              bold: true,
              lineHeight: 1.0
            }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0]
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async sinDeduccionesCentroSur() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/AdminInmobiliaria.jpg";
  }
  
  const firmaZCS = await this.getBase64ImageFromURL(rutaImagenFirma);

    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    const textoDirigidaA = this.dirigidaA ? this.dirigidaA.trim() : '';

    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: textoDirigidaA && `\nSres. \n${textoDirigidaA}\n`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "\nPor este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha, devengando un salario mensual de `,
            {
              text: `HNL${this.salario}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: "\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de Tegucigalpa, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZCS,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
            {
              text: "LIC. YENSI GARCÍA \n Jefe Regional de Desarrollo Humano Zona Centro Sur \n Corporación Lady Lee \n (504) 2512-6000 Ext. 1712 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
              fontSize: 12,
              alignment: "center",
              margin: [0, 0, 0, 0],
              bold: true,
              lineHeight: 1.0
            }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async sinDeduccionesAtlantica() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/AdminInmobiliaria.jpg";
  }
  
  const firmaZA = await this.getBase64ImageFromURL(rutaImagenFirma);

    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    const textoDirigidaA = this.dirigidaA ? this.dirigidaA.trim() : '';

    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            {
              text: textoDirigidaA && `\nSres. \n${textoDirigidaA}\n`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "\nPor este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha, devengando un salario mensual de `,
            {
              text: `HNL${this.salario}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: "\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de la Ceiba, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZA,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
            {
              text: "LIC. KARLA BUSTILLO \n Coordinador Regional de Desarrollo Humano Zona Atlántica \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6247 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
              fontSize: 12,
              alignment: "center",
              margin: [0, 0, 0, 0],
              bold: true,
              lineHeight: 1.0
            }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  obtenerDeducciones() {
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear();
  
    this._boletapago.obtenerDeducciones(this.colaboradorId, mesActual - 1, anioActual).subscribe(
      data => {
        this.listDeducciones = data;
        const sumaMontos = this.listDeducciones.reduce((total, deduccion) => total + deduccion.monto, 0);
        this.totalDeducciones = sumaMontos;

        const totalConDeducciones = this.salario - this.totalDeducciones;
        this.total = totalConDeducciones.toFixed(2);
      },
      error => {
        console.log(error);
      }
    );
  }
  
  async conDeduccionesNorte() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);

    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = 'assets/firmas/ZonaNorte/ServiciosAdministrativos.jpg';
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/AdminInmobiliaria.jpg";
  }
  
  const firmaZN = await this.getBase64ImageFromURL(rutaImagenFirma);

  const footerStyle = {
    fontSize: 10,
    color: "gray",
    alignment: "center"
  };

  const registrosDeducciones = this.listDeducciones.map(registro => ([
    { text: `${registro.descripcion}`, fontSize: 10, alignment: 'left'},
    { text: `${registro.monto}`, fontSize: 10, alignment: 'right'},
  ]));
  const TotalDeducciones = [
    { text: 'Total', fontSize: 10, bold:true, alignment: 'left' }, 
    { text: this.totalDeducciones.toFixed(2), fontSize: 10, bold:true, alignment: 'right' },
  ];

  const textoDirigidaA = this.dirigidaA ? this.dirigidaA.trim() : '';

  let docDefinition = {
    pageSize: 'letter',
    header: {
      image: headerImageBase64,
      width: 550, 
      alignment: "center", 
      margin: [0, 10, 0, 0] 
    },
    content: [
      {
        text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
        fontSize: 10,
        alignment: "right",
        margin: [0, 0, 0, 0],
      },
      {
        text: "CONSTANCIA",
        fontSize: 16,
        alignment: "center", 
        margin: [0,30,0,0],
        bold: true
      },
      {
        text: [ 
          {
            text: textoDirigidaA && `\nSres. \n${textoDirigidaA}\n`,
            fontSize: 12,
            alignment: "justify",
            margin: [0, 0, 0, 0],
            bold: true 
          },
          "\nPor este medio ",
          {
            text: `${this.compania} `,
            fontSize: 12,
            alignment: "justify",
            margin: [0, 0, 0, 0],
            bold: true 
          },
          "a través del suscrito hace constar que: ",
          {
            text: `${this.nombre} `,
            fontSize: 12,
            alignment: "justify",
            margin: [0, 0, 0, 0],
            bold: true 
          },
          "con número identidad ",
          {
            text: `${this.identidad} `,
            fontSize: 12,
            alignment: "justify",
            margin: [0, 0, 0, 0],
            bold: true 
          },
          ", labora para esta compañía desempeñando el cargo de ",
          {
            text: `${this.puesto} `,
            fontSize: 12,
            alignment: "justify",
            margin: [0, 0, 0, 0],
            bold: true 
          },
          `desde el ${this.fecha_ingreso} hasta la fecha, devengando un salario mensual de `,
          {
            text: `HNL${this.salario},`,
            fontSize: 12,
            alignment: "justify",
            margin: [0, 0, 0, 0],
            bold: true 
          },
          {
            text: ` con las siguientes deducciones:`,
            fontSize: 12,
            alignment: "justify",
            margin: [0, 0, 0, 0],
          },
          {
            text: "\n",
            fontSize: 12,
            alignment: "justify",
            margin: [0, 0, 0, 0],
            bold: true 
          },
        ],  
        defaultStyle: {
          font: 'TimesNewRoman', // Fuente predeterminada para todo el documento
        },
        fontSize: 12,
        alignment: "justify",
        margin: [0, 10, 0, 0],
        lineHeight: 1.5       
      },
      {
        columns: [
          {
            width: 'auto',
            table: {
              headerRows: 1,
              widths: [120, 'auto'],
              body: [...registrosDeducciones, TotalDeducciones],
            },
            fontSize: 12,
            margin: [180, 0, 0, 0], 
          },
        ],
      },
      {
      text: [
        {
          text: `\n\nEmitida en la ciudad de San Pedro Sula, ${this.fecha_emision}.`,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0]
        },
        {
          text: "\n\n",
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
      ],
      },
      {
        columns:[
          {
            image: firmaZN,
            width: 300, 
            height: 130,
            alignment: "center", 
            margin: [0, 0, -190, 0]
       },
        ]
      },
      {
      text:[
          {
            text: "LIC. JAVIER MORÁN \n Jefe Administrativo de Desarrollo Humano \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6079/6026 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
            fontSize: 12,
            alignment: "center",
            margin: [0, 0, 0, 0],
            bold: true,
            lineHeight: 1.0
          }
        ]
      } 
    ],
    footer: function (currentPage, pageCount) {
      return {
        image: imageBase64,
        width: 550, 
        alignment: "center", 
        style: "footerStyle",
        margin: [0, -50, 0, 0] 
      };
    },
    styles: {
      footerStyle: footerStyle,
    },
    margin: [0, 60, 0, 0] 
  };

  pdfMake.createPdf(docDefinition).getBlob((blob) => {
    this.convertirBlobABase64(blob).then((pdfBase64) => {
      this.pdfBase = pdfBase64;
      this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
      this.agregarConstancia();
    }).catch((error) => {
      console.error('Error al convertir el Blob a base64', error);
    });
  });
}

async conDeduccionesCentroSur() {
  const fechaActual = new Date();

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dia = fechaActual.getDate();
  const mes = meses[fechaActual.getMonth()];
  const anio = fechaActual.getFullYear();

  const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

  this.fecha_emision = fechaFormateada;

  const headerImageUrl = "assets/firmas/header.jpg"; 
  const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
  const footerImageUrl = "assets/firmas/footer.jpg";
  const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);

  let rutaImagenFirma: string;

  if (this.compania == 'Servicios Profesionales Administrativos,') {
    rutaImagenFirma = 'assets/firmas/ZonaCentroSur/ServiciosAdministrativos.jpg';
  } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
    rutaImagenFirma = "assets/firmas/ZonaCentroSur/Alimentos.jpg";
  }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
    rutaImagenFirma = "assets/firmas/ZonaCentroSur/Inversiones.jpg";
  }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
    rutaImagenFirma = "assets/firmas/ZonaCentroSur/CentroTuristico.jpg";
  }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
    rutaImagenFirma = "assets/firmas/ZonaCentroSur/Almacenes.jpg";
  }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
    rutaImagenFirma = "assets/firmas/ZonaCentroSur/InmobiliariaAmericana.jpg";
  }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
    rutaImagenFirma = "assets/firmas/ZonaCentroSur/UrbanizadoraNacional.jpg";
  }if(this.compania == 'Administradora de Servicios'){
    rutaImagenFirma = "assets/firmas/ZonaCentroSur/AdminInmobiliaria.jpg";
}

const firmaZCS = await this.getBase64ImageFromURL(rutaImagenFirma);

const footerStyle = {
  fontSize: 10,
  color: "gray",
  alignment: "center"
};

const registrosDeducciones = this.listDeducciones.map(registro => ([
  { text: `${registro.descripcion}`, fontSize: 10, alignment: 'left'},
  { text: `${registro.monto}`, fontSize: 10, alignment: 'right'},
]));
const TotalDeducciones = [
  { text: 'Total', fontSize: 10, bold:true, alignment: 'left' }, 
  { text: this.totalDeducciones.toFixed(2), fontSize: 10, bold:true, alignment: 'right' },
];

const textoDirigidaA = this.dirigidaA ? this.dirigidaA.trim() : '';

let docDefinition = {
  pageSize: 'letter',
  header: {
    image: headerImageBase64,
    width: 550, 
    alignment: "center", 
    margin: [0, 10, 0, 0] 
  },
  content: [
    {
      text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
      fontSize: 10,
      alignment: "right",
      margin: [0, 0, 0, 0],
    },
    {
      text: "CONSTANCIA",
      fontSize: 16,
      alignment: "center", 
      margin: [0,30,0,0],
      bold: true
    },
    {
      text: [ 
        {
          text: textoDirigidaA && `\nSres. \n${textoDirigidaA}\n`,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
        "\nPor este medio ",
        {
          text: `${this.compania} `,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
        "a través del suscrito hace constar que: ",
        {
          text: `${this.nombre} `,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
        "con número identidad ",
        {
          text: `${this.identidad} `,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
        ", labora para esta compañía desempeñando el cargo de ",
        {
          text: `${this.puesto} `,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
        `desde el ${this.fecha_ingreso} hasta la fecha, devengando un salario mensual de `,
        {
          text: `HNL${this.salario},`,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
        {
          text: ` con las siguientes deducciones:`,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
        },
        {
          text: "\n\n",
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
      ],  
      defaultStyle: {
        font: 'TimesNewRoman', // Fuente predeterminada para todo el documento
      },
      fontSize: 12,
      alignment: "justify",
      margin: [0, 10, 0, 0],
      lineHeight: 1.5       
    },
    {
      columns: [
        {
          width: 'auto',
          table: {
            headerRows: 1,
            widths: [120, 'auto'],
            body: [...registrosDeducciones, TotalDeducciones],
          },
          fontSize: 12,
          margin: [180, 0, 0, 0], 
        },
      ],
    },
    {
    text: [
      {
        text: `\nEmitida en la ciudad de San Pedro Sula, ${this.fecha_emision}.`,
        fontSize: 12,
        alignment: "justify",
        margin: [0, 0, 0, 0]
      },
      {
        text: "\n\n",
        fontSize: 12,
        alignment: "justify",
        margin: [0, 0, 0, 0],
        bold: true 
      },
    ],
    },
    {
      columns:[
        {
          image: firmaZCS,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -190, 0]
     },
      ]
    },
    {
    text:[
      {
        text: "LIC. YENSI GARCÍA \n Jefe Regional de Desarrollo Humano Zona Centro Sur \n Corporación Lady Lee \n (504) 2512-6000 Ext. 1712 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
        fontSize: 12,
        alignment: "center",
        margin: [0, 0, 0, 0],
        bold: true,
        lineHeight: 1.0
      }
      ]
    } 
  ],
  footer: function (currentPage, pageCount) {
    return {
      image: imageBase64,
      width: 550, 
      alignment: "center", 
      style: "footerStyle",
      margin: [0, -50, 0, 0] 
    };
  },
  styles: {
    footerStyle: footerStyle,
  },
  margin: [0, 60, 0, 0] 
};

pdfMake.createPdf(docDefinition).getBlob((blob) => {
  this.convertirBlobABase64(blob).then((pdfBase64) => {
    this.pdfBase = pdfBase64;
    this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    this.agregarConstancia();
  }).catch((error) => {
    console.error('Error al convertir el Blob a base64', error);
  });
});
}

async conDeduccionesAtlantica() {
  const fechaActual = new Date();

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dia = fechaActual.getDate();
  const mes = meses[fechaActual.getMonth()];
  const anio = fechaActual.getFullYear();

  const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

  this.fecha_emision = fechaFormateada;

  const headerImageUrl = "assets/firmas/header.jpg"; 
  const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
  const footerImageUrl = "assets/firmas/footer.jpg";
  const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);

  let rutaImagenFirma: string;

  if (this.compania == 'Servicios Profesionales Administrativos,') {
    rutaImagenFirma = 'assets/firmas/ZonaAtlantica/ServiciosAdministrativos.jpg';
  } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
    rutaImagenFirma = "assets/firmas/ZonaAtlantica/Alimentos.jpg";
  }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
    rutaImagenFirma = "assets/firmas/ZonaAtlantica/Inversiones.jpg";
  }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
    rutaImagenFirma = "assets/firmas/ZonaAtlantica/CentroTuristico.jpg";
  }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
    rutaImagenFirma = "assets/firmas/ZonaAtlantica/Almacenes.jpg";
  }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
    rutaImagenFirma = "assets/firmas/ZonaAtlantica/InmobiliariaAmericana.jpg";
  }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
    rutaImagenFirma = "assets/firmas/ZonaAtlantica/UrbanizadoraNacional.jpg";
  }if(this.compania == 'Administradora de Servicios'){
    rutaImagenFirma = "assets/firmas/ZonaAtlantica/AdminInmobiliaria.jpg";
}

const firmaZA = await this.getBase64ImageFromURL(rutaImagenFirma);

const footerStyle = {
  fontSize: 10,
  color: "gray",
  alignment: "center"
};

const registrosDeducciones = this.listDeducciones.map(registro => ([
  { text: `${registro.descripcion}`, fontSize: 10, alignment: 'left'},
  { text: `${registro.monto}`, fontSize: 10, alignment: 'right'},
]));
const TotalDeducciones = [
  { text: 'Total', fontSize: 10, bold:true, alignment: 'left' }, 
  { text: this.totalDeducciones.toFixed(2), fontSize: 10, bold:true, alignment: 'right' },
];

const textoDirigidaA = this.dirigidaA ? this.dirigidaA.trim() : '';

let docDefinition = {
  pageSize: 'letter',
  header: {
    image: headerImageBase64,
    width: 550, 
    alignment: "center", 
    margin: [0, 10, 0, 0] 
  },
  content: [
    {
      text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
      fontSize: 10,
      alignment: "right",
      margin: [0, 0, 0, 0],
    },
    {
      text: "CONSTANCIA",
      fontSize: 16,
      alignment: "center", 
      margin: [0,30,0,0],
      bold: true
    },
    {
      text: [ 
        {
          text: textoDirigidaA && `\nSres. \n${textoDirigidaA}\n`,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
        "\nPor este medio ",
        {
          text: `${this.compania} `,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
        "a través del suscrito hace constar que: ",
        {
          text: `${this.nombre} `,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
        "con número identidad ",
        {
          text: `${this.identidad} `,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
        ", labora para esta compañía desempeñando el cargo de ",
        {
          text: `${this.puesto} `,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
        `desde el ${this.fecha_ingreso} hasta la fecha, devengando un salario mensual de `,
        {
          text: `HNL${this.salario},`,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
        {
          text: ` con las siguientes deducciones:`,
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
        },
        {
          text: "\n\n",
          fontSize: 12,
          alignment: "justify",
          margin: [0, 0, 0, 0],
          bold: true 
        },
      ],  
      defaultStyle: {
        font: 'TimesNewRoman', // Fuente predeterminada para todo el documento
      },
      fontSize: 12,
      alignment: "justify",
      margin: [0, 10, 0, 0],
      lineHeight: 1.5       
    },
    {
      columns: [
        {
          width: 'auto',
          table: {
            headerRows: 1,
            widths: [120, 'auto'],
            body: [...registrosDeducciones, TotalDeducciones],
          },
          fontSize: 12,
          margin: [180, 0, 0, 0], 
        },
      ],
    },
    {
    text: [
      {
        text: `\nEmitida en la ciudad de San Pedro Sula, ${this.fecha_emision}.`,
        fontSize: 12,
        alignment: "justify",
        margin: [0, 0, 0, 0]
      },
      {
        text: "\n\n",
        fontSize: 12,
        alignment: "justify",
        margin: [0, 0, 0, 0],
        bold: true 
      },
    ],
    },
    {
      columns:[
        {
          image: firmaZA,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -190, 0]
     },
      ]
    },
    {
    text:[
      {
        text: "LIC. KARLA BUSTILLO \n Coordinador Regional de Desarrollo Humano Zona Atlántica \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6247 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
        fontSize: 12,
        alignment: "center",
        margin: [0, 0, 0, 0],
        bold: true,
        lineHeight: 1.0
      }
      ]
    } 
  ],
  footer: function (currentPage, pageCount) {
    return {
      image: imageBase64,
      width: 550, 
      alignment: "center", 
      style: "footerStyle",
      margin: [0, -50, 0, 0] 
    };
  },
  styles: {
    footerStyle: footerStyle,
  },
  margin: [0, 60, 0, 0] 
};

pdfMake.createPdf(docDefinition).getBlob((blob) => {
  this.convertirBlobABase64(blob).then((pdfBase64) => {
    this.pdfBase = pdfBase64;
    this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    this.agregarConstancia();
  }).catch((error) => {
    console.error('Error al convertir el Blob a base64', error);
  });
});
}

  async sinSalarioNorte() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaNorte/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaNorte/AdminInmobiliaria.jpg";
  }
  
  const firmaZN = await this.getBase64ImageFromURL(rutaImagenFirma);

    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            "\nPor este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad}`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha. `,
            {
              text: "\n\n\n\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de San Pedro Sula, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZN,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
            {
              text: "LIC. JAVIER MORÁN \n Jefe Administrativo de Desarrollo Humano \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6079/6026 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
              fontSize: 12,
              alignment: "center",
              margin: [0, 0, 0, 0],
              bold: true,
              lineHeight: 1.0
            }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async sinSalarioCentroSur() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);
  
    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaCentroSur/AdminInmobiliaria.jpg";
  }
  
  const firmaZCS = await this.getBase64ImageFromURL(rutaImagenFirma);

    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            "\nPor este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad}`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha. `,
            {
              text: "\n\n\n\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de Tegucigalpa, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZCS,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
            {
              text: "LIC. YENSI GARCÍA \n Jefe Regional de Desarrollo Humano Zona Centro Sur \n Corporación Lady Lee \n (504) 2512-6000 Ext. 1712 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
              fontSize: 12,
              alignment: "center",
              margin: [0, 0, 0, 0],
              bold: true,
              lineHeight: 1.0
            }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  async sinSalarioAtlantica() {
    const fechaActual = new Date();

    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dia = fechaActual.getDate();
    const mes = meses[fechaActual.getMonth()];
    const anio = fechaActual.getFullYear();

    const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;

    this.fecha_emision = fechaFormateada;

    const headerImageUrl = "assets/firmas/header.jpg"; 
    const headerImageBase64 = await this.getBase64ImageFromURL(headerImageUrl);
    
    const footerImageUrl = "assets/firmas/footer.jpg";
    const imageBase64 = await this.getBase64ImageFromURL(footerImageUrl);

    let rutaImagenFirma: string;

    if (this.compania == 'Servicios Profesionales Administrativos,') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/ServiciosAdministrativos.jpg";
    } if(this.compania == 'Alimentos Internacionales, S. A. de C.V.') {
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Alimentos.jpg";
    }if(this.compania == 'Inversiones Comerciales y Desarrollos'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Inversiones.jpg";
    }if(this.compania == 'Centro Turístico Megaplaza, S. A.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/CentroTuristico.jpg";
    }if(this.compania == 'Almacenes Lady Lee, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/Almacenes.jpg";
    }if(this.compania == 'Inmobiliaria Americana, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/InmobiliariaAmericana.jpg";
    }if(this.compania == 'Urbanizadora Nacional, S. A. de C.V.'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/UrbanizadoraNacional.jpg";
    }if(this.compania == 'Administradora de Servicios'){
      rutaImagenFirma = "assets/firmas/ZonaAtlantica/AdminInmobiliaria.jpg";
  }
  
  const firmaZA = await this.getBase64ImageFromURL(rutaImagenFirma);
  
    const footerStyle = {
      fontSize: 10,
      color: "gray",
      alignment: "center"
    };
  
    let docDefinition = {
      pageSize: 'letter',
      header: {
        image: headerImageBase64,
        width: 550, 
        alignment: "center", 
        margin: [0, 10, 0, 0] 
      },
      content: [
        {
          text: `\n\n\n\n\n${this.anio}-${this.mes}-${this.formatoNumeroDeReferencia(this.MaxTipoConstancia +1 , this.longitudDeseada)}`,
          fontSize: 10,
          alignment: "right",
          margin: [0, 0, 0, 0],
        },
        {
          text: "CONSTANCIA",
          fontSize: 16,
          alignment: "center", 
          margin: [0,50,0,0],
          bold: true
        },
        {
          text: [ 
            "\nPor este medio ",
            {
              text: `${this.compania} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "a través del suscrito hace constar que: ",
            {
              text: `${this.nombre} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            "con número identidad ",
            {
              text: `${this.identidad}`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            ", labora para esta compañía desempeñando el cargo de ",
            {
              text: `${this.puesto} `,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            `desde el ${this.fecha_ingreso} hasta la fecha. `,
            {
              text: "\n\n\n\n\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            },
            {
              text: `Emitida en la ciudad de la Ceiba, ${this.fecha_emision}.`,
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0]
            },
            {
              text: "\n\n\n",
              fontSize: 12,
              alignment: "justify",
              margin: [0, 0, 0, 0],
              bold: true 
            }
          ],
          fontSize: 12,
          alignment: "justify",
          margin: [0, 10, 0, 0],
          lineHeight: 1.5 
        },
        {
          image: firmaZA,
          width: 300, 
          height: 130,
          alignment: "center", 
          margin: [0, 0, -60, 0]
     },
            {
              text: "LIC. KARLA BUSTILLO \n Coordinador Regional de Desarrollo Humano Zona Atlántica \n Corporación Lady Lee \n (504) 2512-6000 Ext. 6247 \n Para confirmación de constancia favor escribir a sac.ddhh@ladylee.com",
              fontSize: 12,
              alignment: "center",
              margin: [0, 0, 0, 0],
              bold: true,
              lineHeight: 1.0
            }
      ],
      footer: function (currentPage, pageCount) {
        return {
          image: imageBase64,
          width: 550, 
          alignment: "center", 
          style: "footerStyle",
          margin: [0, -50, 0, 0] 
        };
      },
      styles: {
        footerStyle: footerStyle
      },
      margin: [0, 60, 0, 0] 
    };
  
    pdfMake.createPdf(docDefinition).getBlob((blob) => {
      this.convertirBlobABase64(blob).then((pdfBase64) => {
        this.pdfBase = pdfBase64;
        this.pdfPath = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
        this.agregarConstancia();
      }).catch((error) => {
        console.error('Error al convertir el Blob a base64', error);
      });
    });
  }

  getBase64ImageFromURL(url) {
    return new Promise((resolve, reject) => {
      var img = new Image();
      img.setAttribute("crossOrigin", "anonymous");

      img.onload = () => {
        var canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/png");

        resolve(dataURL);
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = url;
    });
  }

  agregarConstancia() {

    const pdfBase = this.pdfBase;
    const base64 = pdfBase.split(',')[1];

    const CONSTANCIAS: Constancias = {
      constanciA_ID: this.maxValor + 1,
      tipO_CONSTANCIA: this.constanciaForm.get('tipo_constancia')?.value,
      fechA_EMISION: this.constanciaForm.get('fecha_emision')?.value,
      codigO_COLABORADOR: parseInt(this.colaboradorId),
      zona: this.constanciaForm.get('zona')?.value,
      tipO_ACCION: this.constanciaForm.get('tipo_accion')?.value,
      fechA_CREACION: this.constanciaForm.get('fecha_creacion')?.value,
      fechA_MODIFICACION: this.constanciaForm.get('fecha_modificacion')?.value,
      usuariO_CREO: this.constanciaForm.get('usuario_creo')?.value,
      usuariO_CAMBIO: this.constanciaForm.get('usuario_cambio')?.value,
      referencia: this.MaxTipoConstancia + 1,
      //destinatario: this.constanciaForm.get('destinatario')?.value,
      //asunto: this.constanciaForm.get('asunto')?.value,
      //verificado: this.constanciaForm.get('verificado')?.value,
      base64FileContent: base64,
    }
    this.AtipoConstancia = this.constanciaForm.get('tipo_constancia')?.value,
    this.AfechaCreacion = this.constanciaForm.get('fecha_creacion')?.value,
    this.AfechaEmision = this.constanciaForm.get('fecha_emision')?.value,
    this.Azona = this.constanciaForm.get('zona')?.value;

    const max = this.maxValor + 1;

    this._constanciaService.guardarConstanciaArchivo(CONSTANCIAS).subscribe(data => {
      this.obtenerFechas(max);
    }, error => {
      this.constanciaForm.reset();
    })
  }
  
  actualizarConstancia(tipoAccion: string) {
    const pdfBase = this.pdfBase;
    const base64 = pdfBase.split(',')[1];
    this.tipo_accion = tipoAccion;

    const CONSTANCIAS: Constancias = {
      constanciA_ID: this.maxValor + 1,
      tipO_CONSTANCIA: this.AtipoConstancia,
      fechA_EMISION: this.AfechaEmision,
      codigO_COLABORADOR: parseInt(this.colaboradorId),
      zona: this.Azona,
      tipO_ACCION: this.tipo_accion,
      fechA_CREACION: this.AfechaCreacion,
      fechA_MODIFICACION: new Date(),
      usuariO_CREO: parseInt(this.colaboradorId),
      usuariO_CAMBIO: parseInt(this.colaboradorId),
      referencia: this.MaxTipoConstancia + 1,
      destinatario:this.destinatarios,
      asunto: this.asunto,
      verificado: this.constanciaForm.get('verificado')?.value,
    }

    this._constanciaService.ActualizarConstancia(this.maxValor+1,CONSTANCIAS).subscribe(data => {
      this.toast.success({detail:"Constancia Enviada",summary:'Envío Exitoso', duration:5000});

    }, error => {
      this.constanciaForm.reset();
    })

    const formData = new FormData();
    formData.append('Destinatarios', this.destinatarios);
    formData.append('Asunto', this.asunto);

    this._correoService.enviarCorreoConAdjunto(this.destinatarios, this.asunto, base64, 'Constancia_Generada.pdf')
          .subscribe(response => {
            this.toast.success({detail:"Constancia Enviada",summary:'Correo Enviado Correctamente', duration:5000});
            this.destinatarios = '';
            this.asunto = '';
          }, error => {
            console.error('Error al enviar el correo', error);

          });
  }

  onFileSelected(event: any) {
    this.archivoAdjunto = event.target.files[0];
  }

  reload(){
    setTimeout(() => {
        location.reload();
      }, 1000);
  }

  async convertirBlobABase64(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}

