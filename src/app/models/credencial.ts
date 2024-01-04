export class Credencial {

    codigO_COLABORADOR: number | undefined;
    contrasena: string | undefined;
    fechA_CREACION: Date | undefined;
    fechA_MODIFICACION: Date | undefined;
    usuariO_CREO : number | undefined;
    usuariO_CAMBIO : number | undefined;
    estadoS_ID : number | undefined;

    constructor(codigo_colaborador: number, contrasena: string, fecha_modificacion:Date, fecha_creacion: Date, usuario_creo: number, usuario_cambio:number, estados_id: number){
        this.codigO_COLABORADOR = codigo_colaborador;
        this.contrasena = contrasena;
        this.fechA_CREACION = fecha_creacion;
        this.fechA_MODIFICACION = fecha_modificacion;
        this.usuariO_CREO = usuario_creo;
        this.usuariO_CAMBIO = usuario_cambio;
        this.estadoS_ID = estados_id;
    }
}