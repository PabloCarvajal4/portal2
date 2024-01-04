export class Sugerencia {

    mensajE_ID: number | undefined;
    mensaje: string | undefined;
    fechA_CREACION: Date | undefined;
    fechA_MODIFICACION: Date | undefined;
    usuariO_CREO : number | undefined;
    usuariO_CAMBIO : number | undefined;
    categoria: string | undefined;

    constructor(mensaje_id: number, mensaje: string, fecha_modificacion:Date, fecha_creacion: Date, usuario_creo: number, usuario_cambio:number, categoria: string){
        this.mensajE_ID = mensaje_id;
        this.mensaje = mensaje;
        this.fechA_CREACION = fecha_creacion;
        this.fechA_MODIFICACION = fecha_modificacion;
        this.usuariO_CREO = usuario_creo;
        this.usuariO_CAMBIO = usuario_cambio;
        this.categoria = categoria;
    }
}