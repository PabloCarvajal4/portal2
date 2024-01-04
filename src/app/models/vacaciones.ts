export class Vacaciones {

    consultA_ID: number | undefined;
    codigO_COLABORADOR: number ;
    fechA_INICIAL: Date | undefined;
    fechA_INICIO: Date | undefined;
    fechA_FINAL: Date | undefined;
    concepto: string | undefined;
    cantidad : string | undefined;
    liquidcont : string | undefined;
    dias: number | undefined;
    diaS_GOZADOS: number | undefined;
    diaS_PENDIENTES : number | undefined;
    compania: string | undefined;
    descripcioN_CIA: string | undefined;
    departamento: string | undefined;
    fechA_CREACION: Date | undefined;
    fechA_MODIFICACION: Date | undefined;
    usuariO_CREO : number | undefined;
    usuariO_CAMBIO : number | undefined;

    constructor(consulta_id:number, codigo_colaborador: number, fecha_inicial: Date, fecha_final:Date, dias:string, dia:number, dia_gozados: number, dias_gozados:string, dias_pendientes:number, compania: string, fecha_creacion: Date,fecha_modificacion:Date, usuario_creo: number, usuario_cambio:number, estados_id: number, fecha_inicio:Date, descripcion_cia: string, departamento:string){

        this.consultA_ID = consulta_id
        this.codigO_COLABORADOR = codigo_colaborador;
        this.fechA_INICIAL = fecha_inicial;
        this.fechA_FINAL = fecha_final;
        this.cantidad = dias;
        this.liquidcont = dias_gozados;
        this.dias = dia;
        this.diaS_GOZADOS = dia_gozados;
        this.diaS_PENDIENTES;
        this.compania = compania;
        this.fechA_CREACION = fecha_creacion;
        this.fechA_MODIFICACION = fecha_modificacion;
        this.usuariO_CREO = usuario_creo;
        this.usuariO_CAMBIO = usuario_cambio;
        this.fechA_INICIO =fecha_inicio;
        this.descripcioN_CIA = descripcion_cia;
        this.departamento = departamento;
    }
}