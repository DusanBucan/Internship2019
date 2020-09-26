import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterAnimes'
})
export class FilterAnimesPipe implements PipeTransform {
  transform(animes: any[], filter: string, value: string): any[] {
    if (filter === 'title') {
      if (value && value !== 'all') {
        return animes.filter(anime => {
          if (anime.title.toLowerCase().indexOf(value.toLowerCase()) === -1) {
            return false;
          }
          return true;
        });
      }
    }
    return animes;
  }
}
