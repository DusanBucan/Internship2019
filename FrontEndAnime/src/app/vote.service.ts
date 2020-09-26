import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';
import { HttpClient } from '@angular/common/http';
import { SocketService } from './socket.service';
import { Notificaion } from './notification/notification.model';

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  //API = '/api/votes';
  API = 'https://anime-back-end.herokuapp.com/api/votes';
  //API = 'http://localhost:5000/api/votes';

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
    private notificationService: NotificationService,
    private socketService: SocketService
  ) {}

  public rateAnime(
    vote: boolean,
    userEmail: string,
    listName: string,
    animeTitlee: any
  ) {
    const userID = this.authService.getUserId();
    if (userID) {
      const payload = {
        playListOwner: userEmail,
        playlist: listName,
        animeTitle: animeTitlee,
        content: vote,
        creator: userID
      };
      this.httpClient
        .post(this.API + '/addVote', payload, {
          headers: this.authService.getAuthHeaders()
        })
        .subscribe((res: any) => {
          // dodaj onom cija je anima notifikaciju
          // user i user role su od usera za koga je notifikacija ---> kako cu to da dobijem?????

          const notification = new Notificaion(
            'vote',
            payload,
            this.authService.getUsername() + ' ' + payload.content
              ? 'likes'
              : 'dislikes' + ' ' + animeTitlee + ' in playlist:  ' + listName,
            false,
            res.playListOwner, // za njega je ova notifikacija....
            null,
            null
          );
          // izvucic iz payload-a sta mi treba....
          this.notificationService
            .addVoteNotification(notification)
            .subscribe((resNotif: any) => {
              // bice notifikacija sa svim poljima lepo podesenim...
              resNotif.content.sender = this.authService.getEmail();
              resNotif.content._id = res._id; // nzm da li vrati i ovo........
              this.socketService.userRateAnime(resNotif);
              // opali na WsServeru tom korisniku da mu je neko komentarisao animu...
            });
        });
    }
  }

  public userRated(userEmail: string, listName: string, animeTitlee: any) {
    const userID = this.authService.getUserId();
    if (userID) {
      const payload = {
        playListOwner: userEmail,
        playlist: listName,
        animeTitle: animeTitlee,
        user: userID
      };
      return this.httpClient.post(this.API + '/howIRated', payload, {
        headers: this.authService.getAuthHeaders()
      });
    }
  }

  getAnimeVotes(userEmail: string, playListName: string, animeTitle: string) {
    return this.httpClient.get(
      this.API +
        '/animaVotes/' +
        userEmail +
        '/' +
        playListName +
        '/' +
        animeTitle,
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }
}
