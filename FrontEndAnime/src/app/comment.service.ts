import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { Notificaion } from './notification/notification.model';
import { SocketService } from './socket.service';
import { NotificationsService } from 'angular2-notifications';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  //API = '/api/comments';
  //API = 'http://localhost:5000/api/comments';
  API = 'https://anime-back-end.herokuapp.com/api/comments';

  otherSettings = {
    timeOut: 8000,
    animate: 'fromRight',
    showProgressBar: false
  };

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
    private notificationService: NotificationService,
    private socketService: SocketService,
    private notifPopUpSvc: NotificationsService
  ) {}

  addComment(
    userEmail: string,
    listName: string,
    animeTitlee: any,
    commentt: any
  ) {
    const userID = this.authService.getUserId();
    if (userID) {
      const payload = {
        playListOwner: userEmail,
        playlist: listName,
        animeTitle: animeTitlee,
        content: commentt,
        creator: userID
      };
      this.httpClient
        .post(this.API + '/addComment', payload, {
          headers: this.authService.getAuthHeaders()
        })
        .subscribe(
          (res: any) => {
            // dodaj onom cija je anima notifikaciju
            // user i user role su od usera za koga je notifikacija ---> kako cu to da dobijem?????

            const notification = new Notificaion(
              'comment',
              payload,
              payload.content,
              false,
              res.playListOwner, // za njega je ova notifikacija....
              null,
              null
            );

            // da mu stigne informativni feedback da je dodao komentar
            this.notifPopUpSvc.success('Comment add', '', this.otherSettings);

            // izvucic iz payload-a sta mi treba....
            // ne treba da sam sebi salje notifikaciju, tj. ako je on kmen

            if (this.authService.getEmail() !== userEmail) {
              this.notificationService
                .addCommentNotification(notification)
                .subscribe((resNotif: any) => {
                  // bice notifikacija sa svim poljima lepo podesenim...
                  resNotif.content.sender = this.authService.getEmail();
                  resNotif.content._id = res._id; // nzm da li vrati i ovo........
                  this.socketService.addComment(resNotif);
                  // opali na WsServeru tom korisniku da mu je neko komentarisao animu...
                });
            } else {
              // ovo je ako je sam sebi komentarisao
              notification.content.sender = this.authService.getEmail();
              notification.content._id = res._id;
              this.socketService.addComment(notification);
            }
          },
          err => {
            this.notifPopUpSvc.error(
              'Comment not successfuly added',
              err.error,
              this.otherSettings
            );
          }
        );
    }
  }

  //
  getAnimaComments(
    userEmail: string,
    playListName: string,
    animeTitle: string
  ) {
    return this.httpClient.get(
      this.API +
        '/animaComments/' +
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

  // sta se desi kad neko reporta komentar????
  // treba da se kreira notifikacija za admine da je neko reportovao komentar
  // treba notifikacija da ima u sadrzaju i ko je report-a komentar, i sadrzaj komentara
  // treba adminu WS da opali notif
  // treba adminu da se posalje mejl
  // treba da admin moze da klikne na notif i da vidi sta ce ili da obrise komentar ili da ga ostavi...

  reportComment(comment: any, user: any, playListOwnerEmail) {
    const payload = {
      reporter: user.id,
      reporterName: user.name,
      commmentId: comment._id,
      commentContent: comment.content,
      playListName: comment.playList,
      playListOwner: playListOwnerEmail,
      animeTitle: comment.anime
    };

    const notif = new Notificaion(
      'commentReport',
      payload,
      payload.reporterName + ' reported ' + payload.commentContent,
      false,
      null,
      null,
      null
    );

    this.notificationService.sendCommentReportToAdmins(notif);
  }

  // ako jedan admin obrise komentar ----> sta ces sa notifikacijama drugih admina za taj isti komentar??????
  // ma neka im stigne ako pokusaju da obrisu komentar pisace im da je neko vec obrisao taj komentar....
  // mozda kasnije
  removeComment(commentId: any) {
    return this.httpClient.delete(this.API + '/' + commentId, {
      headers: this.authService.getAuthHeaders()
    });
  }
}
