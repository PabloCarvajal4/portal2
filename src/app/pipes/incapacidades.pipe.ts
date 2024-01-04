import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'incapacidades'
})
export class IncapacidadesPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    if (arg === '' || arg.length < 2) return value;
    const resultPosts = [];
    const searchNumber = Number(arg); // Convertir el argumento a número
  
    for (const post of value) {
      // Verificar si el código_colaborador coincide con el número de búsqueda
      if (post.codigO_COLABORADOR === searchNumber) {
        resultPosts.push(post);
      }
    }
  
    return resultPosts;
  }
  

}
