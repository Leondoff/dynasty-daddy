import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accentNumber'
})
export class AccentNumberPipe implements PipeTransform {
  transform(value: string, customClass: string = 'warning__alert'): string {
    return value.replace(/(?<![a-zA-Z\d.%])\d+(?:\.\d+)?%?(?![a-zA-Z\d.%])/g, `<span class="${customClass}">$&</span>`);
  }
}
