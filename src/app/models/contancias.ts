export class Constancias {

    constanciA_ID: number | undefined;
    tipO_CONSTANCIA: string | undefined;
    fechA_EMISION: Date | undefined;
    codigO_COLABORADOR: number | undefined;
    zona: string | undefined;
    tipO_ACCION: string | string;
    fechA_CREACION: Date | undefined;
    fechA_MODIFICACION: Date | undefined;
    usuariO_CREO : number | undefined;
    usuariO_CAMBIO : number | undefined;
    referencia : number | undefined;
    destinatario?: string | undefined;
    asunto?: string | undefined;
    verificado?: string | undefined;
    documento?: string | undefined;
    base64FileContent?: string | undefined;

    constructor(constancia_id: number, tipo_constancia: string, fecha_emision:Date, codigo_colaborador:number, zona:string, tipo_accion: string, fecha_modificacion:Date, fecha_creacion: Date, usuario_creo: number, usuario_cambio:number, referencia: number, destinatario: string, asunto: string, verificado: string, documento:string, base64FileContent:string){

        this.constanciA_ID = constancia_id;
        this.tipO_ACCION = tipo_constancia;
        this.fechA_EMISION = fecha_emision;
        this.codigO_COLABORADOR = codigo_colaborador;
        this.zona = zona;
        this.tipO_ACCION = tipo_accion;
        this.fechA_CREACION = fecha_creacion;
        this.fechA_MODIFICACION = fecha_modificacion;
        this.usuariO_CREO = usuario_creo;
        this.usuariO_CAMBIO = usuario_cambio;
        this.referencia = referencia;
        this.destinatario = destinatario;
        this.asunto = asunto;
        this.verificado = verificado;
        this.documento = documento;
        this.base64FileContent = base64FileContent
    }
}