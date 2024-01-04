import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'constancias'
})
export class ConstanciasPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    if (arg === null || arg.length < 1) return value;
    const resultPosts = [];
    const searchNumber = Number(arg); // Convertir el argumento a número
  
    for (const post of value) {
      // Verificar si el código_colaborador coincide con el número de búsqueda
      if (post.referencia === searchNumber) {
        resultPosts.push(post);
      }
    }
  
    return resultPosts;
  }

}
