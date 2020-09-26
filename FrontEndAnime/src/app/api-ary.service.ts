import { Injectable } from '@angular/core';
import jikanjs from 'jikanjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiAryService {
  API = 'https://api.jikan.moe/v3/anime';

  // Mystery ---> je 7
  // Action----> 1
  // militarty ---> 38
  // Super Power --> 31
  // Drama ---> 8
  // Comedy ---> 4
  // Adventure ---> 2

  animeGenres = [1, 2, 7, 4, 31, 38, 8];
  animeSubtypes = [
    'airing',
    'upcoming',
    'tv',
    'movie',
    'ova',
    'special',
    'favorite'
  ];
  constructor(private httpClient: HttpClient) {}

  loadAnime(animeId: number) {
    return jikanjs.loadAnime(animeId, ['episodes']);
  }

  loadTopAnime() {
    return jikanjs.loadTop('anime', 1, ['tv']);
  }

  searchAnime(seachval: string, filter: string) {
    return jikanjs.search(filter, seachval);
  }

  loadAnimeCharactersAndActors(animeID: number) {
    return this.httpClient.get(this.API + '/' + animeID + '/characters_staff');
  }

  loadAnimeGenre(animeID: number) {
    return this.httpClient.get(this.API + '/' + animeID + '/');
  }

  randomAnimes() {
    let hash: number;
    hash = Math.random();
    let page = this.getRandomInt(4);
    page = page === 0 ? 1 : page;

    if (hash < 0.5) {
      const indx = this.getRandomInt(this.animeGenres.length);
      const genre = this.animeGenres[indx];

      return this.httpClient.get(
        'https://api.jikan.moe/v3/genre/anime/' + genre + '/' + page
      );
    } else {
      const indx = this.getRandomInt(this.animeGenres.length);
      const subtype = this.animeSubtypes[indx];

      console.log('top anime random');

      return this.httpClient.get(
        'https://api.jikan.moe/v3/top/anime/' + page + '/' + subtype
      );
    }
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}
