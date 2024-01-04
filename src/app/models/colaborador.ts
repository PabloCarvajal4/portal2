export class Colaborador {
    codigO_COLABORADOR: number | undefined;
    numerO_IDENTIDAD: string | undefined;
    nombre: string | undefined;
    unidaD_ORGANIZATIVA: string | undefined;
    unidaD_NEGOCIO: string | undefined;
    centrO_COSTO: string | undefined;
    estado : number | undefined;
    fechA_INGRESO : Date | undefined;
    cargo: string | undefined;
    puesto: string | undefined;
    numerO_PATRONAL: string | undefined;
    pais: string | undefined;
    ciudad: string | undefined;
    fechA_CREACION: Date | undefined;
    fechA_MODIFICACION: Date | undefined;
    usuariO_CREO : number | undefined;
    usuariO_CAMBIO : number | undefined;
    departamento : string | undefined;
    correo : string | undefined;
    fotografia?: string | undefined;

    constructor(codigo_colaborador: number, numero_identidad: string, nombre: string, unidad_organizativa:string, unidad_negocio: string, centro_costo: string, estado: number, fecha_ingreso: Date, cargo:string, puesto:string, numero_patronal: string, pais: string, ciudad: string, fecha_creacion: Date, fecha_modificacion:Date, usuario_creo: number, usuario_cambio:number, departamento:string, correo: string, fotografia: string){
        
        this.codigO_COLABORADOR = codigo_colaborador;
        this.numerO_IDENTIDAD = numero_identidad;
        this.nombre = nombre;
        this.unidaD_ORGANIZATIVA = unidad_organizativa;
        this.unidaD_NEGOCIO = unidad_negocio;
        this.centrO_COSTO = centro_costo;
        this.estado = estado;
        this.fechA_INGRESO = fecha_ingreso;
        this.cargo = cargo;
        this.puesto = puesto;
        this.numerO_PATRONAL = numero_patronal;
        this.pais = pais;
        this.ciudad = ciudad;
        this.fechA_CREACION = fecha_creacion;
        this.fechA_MODIFICACION = fecha_modificacion;
        this.usuariO_CREO = usuario_creo;
        this.usuariO_CAMBIO = usuario_cambio;
        this.departamento = departamento;
        this.correo = correo;
        this.fotografia = fotografia;
    }
}