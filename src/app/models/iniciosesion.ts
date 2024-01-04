export class Historial_InicioSesion {

    sesioN_ID: number | undefined;
    codigO_COLABORADOR: number | undefined;
    fechA_INGRESO: Date | undefined;
    unidaD_NEGOCIO: string | undefined;
    centrO_COSTO : string | undefined;
    fechA_CREACION: Date | undefined;
    fechA_MODIFICACION: Date | undefined;
    usuariO_CREO : number | undefined;
    usuariO_CAMBIO : number | undefined;

    constructor(sesion_id:number, codigo_colaborador: number, fecha_ingreso: Date, unidad_negocio:string,  centro_costo:string, fecha_creacion: Date,fecha_modificacion:Date, usuario_creo: number, usuario_cambio:number){
        
        this.sesioN_ID = sesion_id;
        this.codigO_COLABORADOR = codigo_colaborador;
        this.fechA_INGRESO = fecha_ingreso;
        this.unidaD_NEGOCIO = unidad_negocio;
        this.centrO_COSTO = centro_costo;
        this.fechA_CREACION = fecha_creacion;
        this.fechA_MODIFICACION = fecha_modificacion;
        this.usuariO_CREO = usuario_creo;
        this.usuariO_CAMBIO = usuario_cambio;
    }
}