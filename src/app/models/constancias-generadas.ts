export class ConstanciasGeneradas {

    constanciA_ID: string | undefined;
    tipO_CONSTANCIA: string | undefined;
    codigO_COLABORADOR: number | undefined;
    numerO_IDENTIDAD: string | undefined;
    cargo: string | undefined;
    tipO_ACCION: string | undefined;
    referencia: number | string;
    destinatario: string | undefined;
    verificado:string | undefined;

    constructor(tipo_constancia: string, codigo_colaborador: number, numero_identidad:string, cargo:string, tipo_accion:string, referencia: number, destinatario:string, verificado:string){

        this.tipO_CONSTANCIA = tipo_constancia;
        this.codigO_COLABORADOR = codigo_colaborador;
        this.numerO_IDENTIDAD = numero_identidad;
        this.cargo = cargo;
        this.tipO_ACCION = tipo_accion;
        this.referencia = referencia;
        this.destinatario = destinatario;
        this.verificado = verificado;
    }
}