import {Pipe, PipeTransform} from '@angular/core';

/*
  This pipe truncates a string.
  Use it like so {{ String expression | truncate:10 }}
  This truncates the string to 10 letters and adds '...' to end.
*/
@Pipe({name: 'truncate'})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit: number): string {
    return value.length < limit
      ? value
      : value.slice(0, limit) + '...';
  }
}
