export class Solicitudes {

    consultA_ID: number | undefined;
    codigO_COLABORADOR: number | undefined;
    solicituD_ID: number | undefined;
    tipO_SOLICITUD: string | undefined;
    descripcion : string | undefined;
    fechA_EMISION : Date | undefined;
    fechA_INICIO : Date | undefined;
    fechA_FINAL: Date | undefined;
    estado : string | undefined;
    observacion : string | undefined;
    aprobacioN_ID: number | undefined;
    fechA_APROBACION: Date | undefined;
    fechA_CREACION: Date | undefined;
    fechA_MODIFICACION: Date | undefined;
    usuariO_CREO : number | undefined;
    usuariO_CAMBIO : number | undefined;
    nombre : string | undefined;
    departamento : string | undefined;

    constructor(consulta_id:number, codigo_colaborador: number, solicitud_id: number, tipo_solicitud:string,  descripcion:string, fecha_emision:Date, fecha_inicio:Date, fecha_final: Date, estado:string, observacion:string, aprobacion_id: number,fecha_aprobacion: Date, fecha_creacion: Date,fecha_modificacion:Date, usuario_creo: number, usuario_cambio:number, nombre: string, departamento:string){
        
        this.consultA_ID = consulta_id;
        this.codigO_COLABORADOR = codigo_colaborador;
        this.solicituD_ID = solicitud_id;
        this.tipO_SOLICITUD = tipo_solicitud;
        this.descripcion = descripcion;
        this.fechA_EMISION = fecha_emision;
        this.fechA_INICIO = fecha_inicio;
        this.fechA_FINAL = fecha_final;
        this.estado = estado;
        this.observacion = observacion;
        this.aprobacioN_ID = aprobacion_id;
        this.fechA_APROBACION = fecha_aprobacion;
        this.fechA_CREACION = fecha_creacion;
        this.fechA_MODIFICACION = fecha_modificacion;
        this.usuariO_CREO = usuario_creo;
        this.usuariO_CREO = usuario_cambio;
        this.nombre = nombre;
        this.departamento = departamento;
    }
}