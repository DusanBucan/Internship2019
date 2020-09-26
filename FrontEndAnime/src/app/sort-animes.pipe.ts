import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortAnimes'
})
export class SortAnimesPipe implements PipeTransform {
  transform(animes: any[], sortBy: string, type: string): any[] {
    if (type === 'asc') {
      if (sortBy === 'title') {
        animes.sort((a, b) => {
          if (a.title < b.title) {
            return -1;
          }
          if (a.title > b.title) {
            return 1;
          } else {
            return 0;
          }
        });
      } else if (sortBy === 'rating') {
        animes.sort((a, b) => {
          if (a.malScore < b.malScore) {
            return -1;
          }
          if (a.malScore > b.malScore) {
            return 1;
          } else {
            return 0;
          }
        });
      } else if (sortBy === 'commentsNumber') {
        animes.sort((a, b) => {
          if (a.commentNumber < b.commentNumber) {
            return -1;
          }
          if (a.commentNumber > b.commentNumber) {
            return 1;
          } else {
            return 0;
          }
        });
      }
    }
    if (type === 'desc') {
      if (sortBy === 'title') {
        animes.sort((a, b) => {
          if (a.title < b.title) {
            return 1;
          }
          if (a.title > b.title) {
            return -1;
          } else {
            return 0;
          }
        });
      } else if (sortBy === 'rating') {
        animes.sort((a, b) => {
          if (a.malScore < b.malScore) {
            return 1;
          }
          if (a.malScore > b.malScore) {
            return -1;
          } else {
            return 0;
          }
        });
      } else if (sortBy === 'commentsNumber') {
        animes.sort((a, b) => {
          if (a.commentNumber < b.commentNumber) {
            return 1;
          }
          if (a.commentNumber > b.commentNumber) {
            return -1;
          } else {
            return 0;
          }
        });
      }
    }
    return animes;
  }
}
