import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'
import { Router } from '@angular/router'
import { Colaborador } from 'src/app/models/colaborador';
import { Boleta_Pago } from 'src/app/models/boleta_pago';
import { ColaboradorService } from 'src/app/services/colaborador.service';
import { BoletaPagoService } from 'src/app/services/boleta-pago.service';
import { CredencialService } from 'src/app/services/credencial.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute} from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-comprobante-pago',
  templateUrl: './comprobante-pago.component.html',
  styleUrls: ['./comprobante-pago.component.css']
})
export class ComprobantePagoComponent implements OnInit {
  boletaForm: FormGroup;
  colaboradorSeleccionado: any;
  boletaSeleccionado: any;
  username: any;
  puesto:any;
  esAdmin: boolean = false;
  pdfPath: any ;
  user = {
    codigo_colaborador: '',
    contrasena:''
  }
  id!:any;
  listBoletaPago: Boleta_Pago[] = [];
  list: Boleta_Pago[] = []
  fechaInicio: string = ''; 
  fechaFin: string = '';
  fechaMinima: string; // Fecha mínima habilitada
  fechaMaxima: string;
  fechaSeleccionada: string;
  maxConsultaId!: number ;
  maxValor!: number;
  identidad: any;
  unidad_negocio: any;
  cargo: any;
  fecha_ingreso: any;
  fecha_emision: any;
  hora_emision:any;

  fecha_inicial:any;
  fecha_final:any;
  cod:any;
  nombre:any;
  centroC:any;
  unidadO:any;
  fechaI:any;
  detalleDeduccion:any;
  totalDeduccion:any;
  totalIngreso:any;
  totalNeto:any;
  departamento: any;
  depto:any;
  compania:any;
  documentoSubido:any;
  nombreImagen:any;
  credencialSeleccionado:any;
  contrasena:any;
  showLoading = false;

  tipo_accion:any;
  constructor(private authService: AuthService, private router: Router,private _colaboradorService: ColaboradorService,
    private fb: FormBuilder, private route: ActivatedRoute,
    private aRouter: ActivatedRoute,
    private _boletapago: BoletaPagoService, private _credencialService: CredencialService,private sanitizer: DomSanitizer,private datePipe: DatePipe){

    this.fechaMinima = '2023-09-01';
    this.fechaMaxima = '2023-09-15';
    this.fechaSeleccionada = '';
    this.boletaForm = this.fb.group({
      //comprobante_id: ['', Validators.required],
      estatus: ['', Validators.required],
      codigo_sap: ['', Validators.required],
      nombre_completo: ['', Validators.required],
      sociedad_codigo: ['',Validators.required],
      sociedad_nombre : ['',Validators.required],
      periodo: ['', Validators.required],
      fecha_inicial: ['', Validators.required],
      fecha_final: ['', Validators.required],
      fecha_pago : ['', Validators.required],
      cargo: ['',Validators.required],
      codigo : ['',Validators.required],
      detalle: ['', Validators.required],
      importe: ['', Validators.required],
      codigo_deduccion: ['', Validators.required],
      detalle_deduccion : ['', Validators.required],
      importe_deduccion : ['',Validators.required],
      total_ingreso: ['', Validators.required],
      total_deduccion: ['', Validators.required],
      neto_pagar: ['', Validators.required],
      nivel_endeuda : ['', Validators.required],
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
        this.obtenerPagoPorColaborador(colaboradorId);

      }else{
        alert('Acceso no Autorizado...')
        window.history.back();
      }  
}

DecodeToken(token: string): string {
  return jwt_decode(token);
  }
  
  fecha(fecha: Date): string {
    return this.datePipe.transform(fecha, 'd.MM.yyyy');
  }

async obtenerColaborador(codigo_colaborador: number) {
  const gerente = /gerente/gi;
  const ddhh = 'Desarrollo Humano';
  try {
    const data = await this._colaboradorService.obtenerColaborador(codigo_colaborador).toPromise();
    this.colaboradorSeleccionado = data;
    this.cod = data.nO_EMPLE,
    this.nombre = data.nombre,
    this.puesto = data.descripcioN_POSICION_LARGA;
    this.centroC = data.descriP_CENTRO_COSTO;
    this.departamento = data.departamento;
    this.fechaI = data.fechA_INGRESO;
    this.compania = data.descripcioN_CIA;
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
    this.contrasena = data.contrasena;
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

async obtenerPagoPorColaborador(codigo_colaborador: string) {
  try {
    const data = await this._boletapago.obtenerBoleta(codigo_colaborador).toPromise();
    this.listBoletaPago = data;
  } catch (error) {
    console.error(error);
  }
}

filtrarDatos(codigo_colaborador: number, fechaInicio: string, fechaFin: string) {
  this._boletapago.filtrarBoletas(codigo_colaborador, this.datePipe.transform(fechaInicio, 'dd/MM/yyyy'),this.datePipe.transform(fechaFin, 'dd/MM/yyyy'))
    .subscribe(data => {
      this.listBoletaPago = data;
    }, error => {
      console.error(error);
    });
}

async obtenerBoletaId(comprobanteId: string, periodo: string, periodo_fin: string) {
    try {
      const data = await this._boletapago.obtenerBoletaId(comprobanteId, periodo, periodo_fin).toPromise();
      this.boletaSeleccionado = data;
      if (data && data.length >= 0) {
        this.boletaSeleccionado = data;

        this.fecha_inicial = data[0].periodo;
        this.fecha_final = data[data.length - 1].periodo_fin;

      } else {
        console.log('La respuesta no contiene datos.');
      }
    } catch (error) {
      console.log(error);
    }
  
}

async mostrarPDF(cod: string, periodo:string, periodo_fin:string) {
  await this.obtenerBoletaId(cod, periodo, periodo_fin);
  this.showLoading = true;
  this.pdfPath = await this.comprobantePago();
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

formatearNumeroConComas(numero: string): string {
  const numeroFormateado = this.formatearNumero(parseFloat(numero));
  const partes = numeroFormateado.split('.');
  partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return partes.join('.');
}

private formatearNumero(numero: number): string {
  return numero.toFixed(2);
}

onModalShow() {
  this.showLoading = true;
}

onModalHide() {
  this.showLoading = false;
}

onPdfLoad() {
  this.showLoading = false;
}

formatearFechaNuevo(cadenaFecha: string): string {
  const anio = cadenaFecha.substring(0, 4);
  const mes = cadenaFecha.substring(4, 6);
  const dia = cadenaFecha.length > 6 ? cadenaFecha.substring(6, 8) : '01';

  return `${dia}.${mes}.${anio}`;
}

async comprobantePago() {
  const fechaActual = new Date();

  const ladyleeLogo = "assets/Design/ladylee.jpg";
  const logo = await this.getBase64ImageFromURL(ladyleeLogo);

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dia = fechaActual.getDate();
  const mes = meses[fechaActual.getMonth()];
  const anio = fechaActual.getFullYear();
  const horas = fechaActual.getHours();
  const minutos = fechaActual.getMinutes();
  const segundos = fechaActual.getSeconds();

  const amOpm = horas >= 12 ? 'PM' : 'AM';
  const horas12 = horas % 12 || 12;

  // Crear una cadena de fecha en el formato deseado
  const fechaFormateada = `${dia.toString().padStart(2, '0')} ${mes} ${anio}`;
  const horaFormateada = `${horas12.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')} ${amOpm}`;

  this.fecha_emision = fechaFormateada;
  this.hora_emision = horaFormateada;

  // Define el estilo para el footer
  const footerStyle = {
    fontSize: 10,
    color: "gray",
    alignment: "center"
  };

  const tipoIngresos = 'I'; 
  const registrosIngresos = this.boletaSeleccionado
    .filter(registro => registro.tipo === tipoIngresos);
  
  const registrosTablaIngresos = registrosIngresos.map(registro => ([
    { text: `${registro.descripcion}`, fontSize: 10, border: [0, 0, 0, 0]},
    { text: '', border: [0, 0, 0, 0]},
    { text: `${this.formatearNumeroConComas(registro.monto)}`, fontSize: 10, border: [0, 0, 0, 0]},
  ]));
  
  const sumaMontosIngresos = registrosIngresos.reduce((total, registro) => total + registro.monto, 0);
  
  const tipoDeducciones = 'D'; 
  const registrosDeducciones = this.boletaSeleccionado
    .filter(registro => registro.tipo === tipoDeducciones);
  
    const registrosTablaDeducciones = registrosDeducciones && registrosDeducciones.length > 0
  ? registrosDeducciones.map(registro => ([
      { text: `${registro.descripcion}`, fontSize: 10, border: [0, 0, 0, 0] },
      { text: '', border: [0, 0, 0, 0] },
      { text: `${this.formatearNumeroConComas(registro.monto)}`, fontSize: 10, border: [0, 0, 0, 0] },
    ]))
  : [
      [
        { text: '', fontSize: 10, border: [0, 0, 0, 0] },
        { text: '', border: [0, 0, 0, 0] },
        { text: '', fontSize: 10, border: [0, 0, 0, 0] },
      ]
    ];

  
  const sumaMontosDeducciones = registrosDeducciones.reduce((total, registro) => total + registro.monto, 0);

  const totalNetoEmpleado = (sumaMontosIngresos - sumaMontosDeducciones).toFixed(2);

  let docDefinition = {
    pageSize: 'letter',
    header: {
      columns: [
        {
          image: logo, 
          width: 70, 
          margin: [20, 0, 0, 0],
        },
        {
          text: `Fecha: ${this.fecha_emision} \n Hora: ${this.hora_emision}`,
          alignment: 'right',
          fontSize: 10,
          margin: [0, 10, 10, 0],
        },
      ],
    },
    content: [
      {
        text: `${this.compania} \n\n PLANILLA SALARIAL QUINCENAL`,
        fontsize: 18,
        alignment: "center", 
        margin: [0, 10, 0, 0], // Márgenes: arriba, derecha, abajo, izquierda
        bold: true
      },
      {
        text: `Periodo: ${this.fecha_inicial} / ${this.fecha_final}`,
        fontsize: 18,
        alignment: "center", 
        margin: [0, 10, 0, 0], 
      },
      {
        text: [ 
          {
            text: `Empleado: `,
            fontSize: 10,
            alignment: "left", 
            margin: [0,10,0,0],
            color: "#000D5F",
            bold: true
          },
          {
            text: `\t\t\t\t  ${this.cod + ' - ' + this.nombre}`,
            fontSize: 10,
            bold: true
          },
          {
            text: `                                              `,
            fontSize: 10,
            bold: true
          },
          {
            text: `Ingreso: ${this.fechaI}`,
            fontSize: 10,
            bold: true,
            decoration: 'underline'
          },
          {
            text: `\nCargo Actual: `,
            fontSize: 10,
            alignment: "left", 
            margin: [0,10,0,0],
            color: "#000D5F",
            bold: true
          },
          {
            text: `\t\t\t ${this.puesto}`,
            fontSize: 10,
            bold: true
          },
          {
            text: `\nCentro Costo: `,
            fontSize: 10,
            alignment: "left", 
            margin: [0,10,0,0],
            color: "#000D5F",
            bold: true
          },
          {
            text: `\t\t\t ${this.centroC}`,
            fontSize: 10,
            bold: true
          },
          {
            text:'\n'
          },
          {
            text: `\nIngresos                                                                                                 Deducciones\n`,
            fontSize: 10,
            alignment: "left", 
            margin: [0,10,0,0],
          },
          {
            text: `                                                     `,
            fontSize: 10,
            bold: true
          },
          {
            text: `\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tCantidad \t\tMonto`,
            fontSize: 10,
            margin: [0,10,0,0],
            decoration: 'underline',
          },
          {
            text: `\t\t\t`,
            fontSize: 10,
          },
          {
            text: `\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tCantidad \t\tMonto`,
            fontSize: 10,
            margin: [0,10,0,0],
            decoration: 'underline',
          },
        ],  
        defaultStyle: {
          font: 'TimesNewRoman', // Fuente predeterminada para todo el documento
        },
        fontSize: 10,
        alignment: "justify",
        margin: [0, 10, 0, 0],
        lineHeight: 1.5       
      },
      {
        columns: [
          {
            table: {
              widths: [135, 45, 45], 
              body:registrosTablaIngresos
            },
          },
          { width: 10, text: '' },
          {
            table: {
              widths: [135, 45, 45], 
              body: registrosTablaDeducciones
            },
          },
        ],
      },
      {
        columns: [
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 5,
                x2: 200,
                y2: 5,
                lineWidth: 1,
              },
            ],
            width: 200,
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 5,
                x2: 200,
                y2: 5,
                lineWidth: 1,
              },
            ],
            width: 200,
          },
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 5,
                x2: 110,
                y2: 5,
                lineWidth: 1,
              },
            ],
            width: 110,
          },
        ],
      },
      {
        columns: [
          {
            text: ' ',
            fontSize: 10,   
            margin: [5, 10, 0, 0]    
          },
          {
            text: this.formatearNumeroConComas(sumaMontosIngresos),
            fontSize: 10,
            margin: [25, 10, 0, 0]         
          },
          {
            text: this.formatearNumeroConComas(sumaMontosDeducciones),
            fontSize: 10,
            margin: [120, 10, 0, 0]
          }
        ],
      },
      {
        columns: [
          {
            text: 'Neto a Pagar',
            fontSize: 10,   
            margin: [5, 0, 0, 0]    
          },
          {
            text: this.formatearNumeroConComas(totalNetoEmpleado),
            fontSize: 10,
            margin: [25, 0, 0, 0]        
          },
          {
            text: '',
            fontSize: 10,
            margin: [120, 0, 0, 0]
          }
        ],
      },
      {
        text: '\n'
      },
      {
        columns: [
          {
            text: 'Total Empleado',
            fontSize: 10,   
            margin: [5, 10, 0, 0]    
          },
          {
            text: this.formatearNumeroConComas(sumaMontosIngresos),
            fontSize: 10,
            margin: [25, 10, 0, 0]         
          },
          {
            text: this.formatearNumeroConComas(sumaMontosDeducciones),
            fontSize: 10,
            margin: [120, 10, 0, 0]
          }
        ],
      },
      {
        columns: [
          {
            text: 'Total Neto Empleado',
            fontSize: 10,   
            margin: [5, 0, 0, 0]    
          },
          {
            text: this.formatearNumeroConComas(totalNetoEmpleado),
            fontSize: 10,
            margin: [25, 0, 0, 0]        
          },
          {
            text: '',
            fontSize: 10,
            margin: [120, 0, 0, 0]
          }
        ],
      },
    ],
    styles: {
      footerStyle: footerStyle,
    },
    margin: [0, 60, 0, 0] 
  };

  pdfMake.createPdf(docDefinition).getBlob((blob) => {
    const fileURL = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    this.pdfPath = fileURL;
  });
  this.showLoading = false;
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

}
function jwt_decode(token: string): string {
  throw new Error('Function not implemented.');
}

