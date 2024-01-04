export class Boleta_Pago {
    no_emple: string | undefined;
    periodo: string | undefined;
    periodo_fin: string | undefined;
    departamento: string | undefined;
    descripcion_Posicion_larga: string | undefined;

    comprobantE_ID: number | undefined;
    estatus: string | undefined;
    codigO_SAP: number | undefined;
    nombrE_COMPLETO: string | undefined;
    sociedaD_CODIGO: number | undefined;
    sociedaD_NOMBRE: string | undefined;
    fechA_INICIAL : Date | undefined;
    fechA_FINAL: Date | undefined;
    fechA_PAGO: Date | undefined;
    cargo: string | undefined;
    codigo: number | undefined;
    detalle: string | undefined;
    importe: string | undefined;
    codigO_DEDUCCION : number | undefined;
    detallE_DEDUCCION : string | undefined;
    importE_DEDUCCION : string | undefined;
    totaL_INGRESO: number | undefined;
    totaL_DEDUCCION: number | undefined;
    netO_PAGAR: number | undefined;
    niveL_ENDEUDA: number | undefined;

    constructor(comprobante_id: number, estatus:string, codigo_sap:number, nombre_completo: string,sociedad_codigo: number, sociedad_nombre:string, periodo: string, fecha_inicial:Date, fecha_final:Date, fecha_pago:Date, cargo: string, codigo:number, detalle:string, importe:string, codigo_deduccion:number, detalle_deduccion:string, importe_deduccion:string, total_ingreso:number, total_deduccion:number, neto_pagar:number, nivel_endeuda:number, no_emple:string, periodo_fin: string, departamento:string, descripcion_Posicion_larga:string){
        
        this.comprobantE_ID = comprobante_id;
        this.estatus = estatus;
        this.codigO_SAP = codigo_sap;
        this.nombrE_COMPLETO = nombre_completo;
        this.sociedaD_CODIGO = sociedad_codigo;
        this.sociedaD_NOMBRE = sociedad_nombre;
        this.periodo = periodo;
        this.fechA_INICIAL = fecha_inicial;
        this.fechA_FINAL = fecha_final;
        this.fechA_PAGO = fecha_pago;
        this.cargo = cargo;
        this.codigo = codigo;
        this.detalle = detalle;
        this.importe = importe;
        this.codigO_DEDUCCION = codigo_deduccion;
        this.detallE_DEDUCCION = detalle_deduccion;
        this.importE_DEDUCCION = importe_deduccion;
        this.totaL_INGRESO = total_ingreso;
        this.totaL_DEDUCCION = total_deduccion;
        this.netO_PAGAR = neto_pagar;
        this.niveL_ENDEUDA = nivel_endeuda;
        this.no_emple = no_emple;
        this.periodo_fin = periodo_fin;
        this.departamento = departamento;
        this.descripcion_Posicion_larga = descripcion_Posicion_larga
    }
}