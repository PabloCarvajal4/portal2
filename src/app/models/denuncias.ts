export class Denuncias {

    denunciA_ID: number | undefined;
    codigO_COLABORADOR: number | undefined;
    tipO_DENUNCIA: string | undefined;
    concepto: string | undefined;
    centrO_COSTO : string | undefined;
    ubicacion : string | undefined;
    fechA_OCURRIDO : Date | undefined;
    evidencia?: File | undefined;
    fechA_CREACION: Date | undefined;
    fechA_MODIFICACION: Date | undefined;
    usuariO_CREO : number | undefined;
    usuariO_CAMBIO : number | undefined;

    constructor(denuncia_id:number, codigo_colaborador: number, tipo_denuncia: string, concepto:string,  centro_costo:string, ubicacion:string, fecha_ocurrido:Date, evidencia:File, fecha_creacion: Date,fecha_modificacion:Date, usuario_creo: number, usuario_cambio:number){
        
        this.denunciA_ID = denuncia_id;
        this.codigO_COLABORADOR = codigo_colaborador;
        this.tipO_DENUNCIA = tipo_denuncia;
        this.concepto = concepto;
        this.centrO_COSTO = centro_costo;
        this.ubicacion = ubicacion;
        this.fechA_OCURRIDO = fecha_ocurrido;
        this.evidencia = evidencia;
        this.fechA_CREACION = fecha_creacion;
        this.fechA_MODIFICACION = fecha_modificacion;
        this.usuariO_CREO = usuario_creo;
        this.usuariO_CAMBIO = usuario_cambio;
    }
}