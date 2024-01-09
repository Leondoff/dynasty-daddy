import {Pipe, PipeTransform} from '@angular/core';

/*
  This pipe truncates a string.
  Use it like so {{ String expression | truncate:10 }}
  This truncates the string to 10 letters and adds '...' to end.
*/
@Pipe({name: 'truncate'})
export class TruncatePipe implements PipeTransform {

  transform(value: string, ...args: number[] | [number, 'start' | 'mid' | 'end']): string {
    let limit: number;
    let position: 'start' | 'mid' | 'end';

    if (args.length === 1) {
      limit = args[0];
      position = 'end';
    } else {
      [limit, position] = args as [number, 'start' | 'mid' | 'end'];
    }

    if (value?.length <= limit) {
      return value;
    }

    if (position === 'end') {
      return value?.slice(0, limit) + '...';
    } else if (position === 'mid') {
      const midPoint = Math.floor(limit / 2);
      const prefix = value?.slice(0, midPoint);
      const suffix = value?.slice(value.length - midPoint);
      return prefix + '...' + suffix;
    } else {
      return '...' + value?.slice(value.length - limit);
    }
  }
}
