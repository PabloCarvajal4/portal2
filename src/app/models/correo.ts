export class Correo {

    destinatarios: string | undefined;
    asunto: string | undefined;
    cuerpo: string | undefined;
    archivo?: File | undefined;

    constructor(destinatarios: string, asunto: string, cuerpo:string, archivo: File){

        this.destinatarios = destinatarios;
        this.asunto = asunto;
        this.cuerpo = cuerpo;
        this.archivo = archivo;
}
}