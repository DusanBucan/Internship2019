import { Injectable } from '@angular/core';
import { AuthService } from '../auth.service';
import { ApiAryService } from '../api-ary.service';
import { HttpClient } from '@angular/common/http';
import { SocketService } from '../socket.service';
import { NotificationService } from '../notification.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class AnimeService {
  //API = 'http://localhost:5000/api/anime/';
  API = 'https://anime-back-end.herokuapp.com/api/anime';
  //API = '/api/anime/';

  constructor(
    private authService: AuthService,
    private apiAryService: ApiAryService,
    private httpClient: HttpClient,
    private notificationService: NotificationService
  ) {}

  // treba da proveri da li anima postoji u bazi na back---> ako je ima onda samo useru doda u odgovarajucu listu
  // ako nema onda treba da se sacuva i anima u nasu bazu ===> mi cemo slati celu animiu sa svim podacima pa ako ne treba
  // neka se ne sacuva, lakse je tako

  // fora je ovo ce se jos menjati zbog glasova i komentara

  findTrailerAndANimeUrl(malId: number) {
    const addres = 'https://api.jikan.moe/v3/anime/' + malId;
    return this.httpClient.get(addres);
  }

  addToUserList(toList: string, anime: any, date: Date) {
    const user = this.authService.getUser();

    if (user) {
      // salje na backEnd id anime ===> pa ako je vec ima na back samo se doda u njegovu kolekiciju ako je NEMA onda se dovlace svi podaci koji su potrebi za nju
      return this.httpClient.post(
        this.API,
        {
          animeToAdd: anime,
          list: toList,
          user_id: user.id,
          sheduldeDate: date // ovo se koristi samo ako dodaje u shedulde listu
        },
        {
          headers: this.authService.getAuthHeaders()
        }
      );
    }
    return null;
  }

  searchLocalAnimes(parameter: any) {
    return this.httpClient.post(
      this.API + '/searchLocal',
      {
        param: parameter
      },
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  findAnimeByID(animeID: any) {
    return this.httpClient.get(this.API + '/findOne/' + animeID, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
