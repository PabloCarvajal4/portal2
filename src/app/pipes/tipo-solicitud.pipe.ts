import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tipoSolicitud'
})
export class TipoSolicitudPipe implements PipeTransform {

  transform(value: any, arg: any): any {
    if (arg === null || arg.length < 1) return value;
    const resultPosts = [];
    const searchNumber = Number(arg);
  
    for (const post of value) {
      if (post.solicituD_ID === searchNumber) {
        resultPosts.push(post);
      }
    }
  
    return resultPosts;
  }

}
