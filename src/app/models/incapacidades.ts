export class Incapacidades {

    incapacidadeS_ID: number | undefined;
    codigO_COLABORADOR: number | undefined;
    infotipo: number | undefined;
    tipO_INCAPACIDAD: string | undefined;
    fechA_INICIO : Date | undefined;
    fechA_FINAL : Date | undefined;
    diagnostico : string | undefined;
    fechA_NOTIFICACION: Date | undefined;
    archivo: File | undefined;
    fechA_CREACION: Date | undefined;
    fechA_MODIFICACION: Date | undefined;
    usuariO_CREO : number | undefined;
    usuariO_CAMBIO : number | undefined;
    //ruta: string | undefined;

    constructor(incapacidades_id:number, codigo_colaborador: number, infotipo: number, tipo_incapacidad:string,  fecha_inicio:Date, fecha_final:Date, diagnostico:string, fecha_notificacion: Date, archivo:File, fecha_creacion: Date,fecha_modificacion:Date, usuario_creo: number, usuario_cambio:number){
        
        this.incapacidadeS_ID = incapacidades_id;
        this.codigO_COLABORADOR = codigo_colaborador;
        this.infotipo = infotipo;
        this.tipO_INCAPACIDAD = tipo_incapacidad;
        this.fechA_INICIO = fecha_inicio;
        this.fechA_FINAL = fecha_final;
        this.diagnostico = diagnostico;
        this.fechA_NOTIFICACION = fecha_notificacion;
        this.archivo = archivo;
        this.fechA_CREACION = fecha_creacion;
        this.fechA_MODIFICACION = fecha_modificacion;
        this.usuariO_CREO = usuario_creo;
        this.usuariO_CAMBIO = usuario_cambio;
        //this.ruta = ruta;
    }
}