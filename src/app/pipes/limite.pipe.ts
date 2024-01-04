import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'limite'
})
export class LimitePipe implements PipeTransform {
  transform(items: any[], limit: number, filterDescription: string): any[] {
    const filteredItems = items.filter(item => item.descripcion === filterDescription);
    return filteredItems.slice(0, limit);
  }
}
