import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Incapacidades } from 'src/app/models/incapacidades';
import { IncapacidadesService } from 'src/app/services/incapacidades.service';

@Component({
  selector: 'app-prueba',
  templateUrl: './prueba.component.html',
  styleUrls: ['./prueba.component.css'],
})
export class PruebaComponent {
   model = {
    INCAPACIDADES_ID: 18,
    CODIGO_COLABORADOR: 1010,
    INFOTIPO: 2001,
    TIPO_INCAPACIDAD: '',
    FECHA_INICIO: new Date(''),
    FECHA_FINAL: new Date(''),
    DIAGNOSTICO: '',
    FECHA_NOTIFICACION: new Date(''),
    FILE: null,
    ARCHIVO: 'hola',
    FECHA_CREACION: new Date(''),
    FECHA_MODIFICACION: new Date(''),
    USUARIO_CREO: 1,
    USUARIO_CAMBIO: 1
  };

  private selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  onSubmit() {
    // Configurar los datos que se enviarán al servidor
    const formData = new FormData();
    formData.append('INCAPACIDADES_ID', this.model.INCAPACIDADES_ID.toString());
    formData.append('CODIGO_COLABORADOR', this.model.CODIGO_COLABORADOR.toString());
    formData.append('INFOTIPO', this.model.INFOTIPO.toString());
    formData.append('TIPO_INCAPACIDAD', this.model.TIPO_INCAPACIDAD);
    formData.append('FECHA_INICIO', this.model.FECHA_INICIO.toString());
    formData.append('FECHA_FINAL', this.model.FECHA_FINAL.toString());
    formData.append('DIAGNOSTICO', this.model.DIAGNOSTICO);
    formData.append('FECHA_NOTIFICACION', this.model.FECHA_NOTIFICACION.toString());
    formData.append('ARCHIVO', this.model.ARCHIVO)
    formData.append('FECHA_CREACION', this.model.FECHA_CREACION.toString());
    formData.append('FECHA_MODIFICACION', this.model.FECHA_MODIFICACION.toString());
    formData.append('USUARIO_CREO', this.model.USUARIO_CREO.toString());
    formData.append('USUARIO_CAMBIO', this.model.USUARIO_CAMBIO.toString());
    // Agrega aquí los demás campos del formulario

    // Agregar el archivo si está presente
    if (this.selectedFile) {
      formData.append('FILE', this.selectedFile, this.selectedFile.name);
    }
    console.log(formData)
    // Realizar la solicitud POST al controlador de ASP.NET Core
    this.http.post('https://localhost:7097/api/Incapacidades/ruta-archivo', formData).subscribe(
      response => {
        console.log('Respuesta del servidor:', response);
        // Realizar acciones adicionales después de recibir una respuesta exitosa
      },
      error => {
        console.error('Error en la solicitud:', error);
        // Realizar acciones adicionales en caso de error
      }
    );
  }

  onFileSelected(event: any) {
    // Manejar la selección de archivos
    const files: FileList = event.target.files;
    if (files.length > 0) {
      this.selectedFile = files[0];
    }
  }
}