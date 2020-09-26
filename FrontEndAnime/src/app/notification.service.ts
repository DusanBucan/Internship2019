import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Notificaion } from './notification/notification.model';
import { SocketService } from './socket.service';
import { timer } from 'rxjs';
import { element } from 'protractor';
import { Router } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';
import { not } from '@angular/compiler/src/output/output_ast';
import { MAT_SORT_HEADER_INTL_PROVIDER_FACTORY } from '@angular/material';

import { NotificationsService } from 'angular2-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notificationCounter = 0;
  public userNotifations: any[]; // sve notifikacije usera koje nije procitao

  types = ['alert', 'error', 'info', 'warn', 'success'];

  otherSettings = {
    timeOut: 8000,
    animate: 'fromRight',
    showProgressBar: false
  };

  //API = '/api/notification';
  //API = 'http://localhost:5000/api/notification';
  API = 'https://anime-back-end.herokuapp.com/api/notification';

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router,
    private notifPopUpSvc: NotificationsService
  ) {
    this.userNotifations = [];
    this.notificationCounter = 0;
    // tajmer koji proverava schedulde notifikacije da li treba da budu prikazane kao notifikacije ili jos uvek nee
    this.checkScheduleNotification();
  }

  // podesavanja tipa notifikacije --> za like, comment su info,
  // za schedule su alert
  // za commentReport su warn
  showNotification(res: any) {
    this.setNotifMessage(res);
    let type: any;
    let title = '';

    if (res.type === 'vote') {
      type = 'info';
      title = 'New vote';
    } else if (res.type === 'schedule') {
      title = 'Watch anime';
      type = 'alert';
    } else if (res.type === 'commentReport') {
      type = 'warn';
      title = 'Comment report';
    } else if (res.type === 'message') {
      type = 'info';
      title = 'New message';
    } else if (res.type === 'comment') {
      type = 'info';
      title = 'New comment';
    }

    this.notifPopUpSvc.create(title, res.message, type, this.otherSettings);
  }

  addNotification(res: any) {
    this.setNotifMessage(res);
    this.userNotifations.push(res as Notificaion);

    this.showNotification(res);
    this.calculateNumberOfNotification();
  }

  addVoteNotification(notif: Notificaion) {
    const userId = notif.user;

    return this.httpClient.post(
      this.API + '/addNotificationSingleUser',
      {
        notification: notif,
        user: userId
      },
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  //
  addCommentNotification(notif: Notificaion) {
    const userId = notif.user;

    return this.httpClient.post(
      this.API + '/addNotificationSingleUser',
      {
        notification: notif,
        user: userId
      },
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  addNewMessageNotification(notif: Notificaion) {
    const userId = this.authService.getUserId();

    return this.httpClient.post(
      this.API + '/addNotificationSingleUser',
      {
        notification: notif,
        user: userId
      },
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  addNewScheduleNotification(anime: any, date: Date, user: any) {
    const notif = new Notificaion(
      'schedule',
      anime,
      anime.title,
      false,
      null,
      null,
      null
    );
    notif.scheduldeDate = date;

    return this.httpClient.post(
      this.API + '/addNotificationSingleUser',
      {
        notification: notif,
        user: user.id
      },
      {
        headers: this.authService.getAuthHeaders()
      }
    );
  }

  // poslaces notifikacije svim adminima ---> tj sacuvace se notifikacija u bazi kod svakog od njih i poslce im se mejlovi
  sendCommentReportToAdmins(notif: Notificaion) {
    return (
      this.httpClient
        .post(
          this.API + '/addNotificationToAdmins',
          {
            notification: notif
          },
          {
            headers: this.authService.getAuthHeaders()
          }
        )
        // kad obavesti trenutno aktivne admine
        .subscribe(res => {
          // this.notifPopUpSvc.success("Comment reported", '', this.otherSettings);

          this.socketService.reportComment(notif);
        })
    );
  }

  // sve notifikacije koje imas ---> mozda im jos nije ni vreme
  getUserNotifications() {
    this.authService.getCurrentUser().subscribe(user => {
      this.userNotifations = [];
      this.notificationCounter = 0;

      if (user !== null) {
        return this.httpClient
          .get(this.API + '/userNotifications/' + user.id, {
            headers: this.authService.getAuthHeaders()
          })
          .subscribe((res: any) => {
            res.forEach(element => {
              const inNotifList = this.findNotification(element._id);
              if (inNotifList === -1) {
                // za notifikacije tipa schedulde ce da radi onaj tajmer
                if (element.type !== 'schedule') {
                  const notif = new Notificaion(
                    element.type,
                    element.content,
                    element.title,
                    element.seen,
                    element.user,
                    element.userRole,
                    element._id
                  );

                  notif.message = element.message;

                  this.setNotifMessage(notif);
                  this.userNotifations.push(notif);
                  this.notificationCounter = this.userNotifations.length;
                }
              }
            });
          });
      }
    });
  }

  // pulluje back end ---> fora je sto backEnd odlucuje da li je vreme proslo ili ne ...
  // ovde mogu dodati dodatnu proveru...
  checkScheduleNotification() {
    const source = timer(10000, 40000).subscribe(val => {
      // na svakih pola h proveri da li je neka od notifikacija type= schedyle treba da se prikaze...

      this.authService.getCurrentUser().subscribe(user => {
        if (user !== null) {
          return this.httpClient
            .get(this.API + '/userNotificationsSchedule/' + user.id, {
              headers: this.authService.getAuthHeaders()
            })
            .subscribe((res: any) => {
              res.forEach(notif => {
                const indx = this.findNotification(notif._id);

                // da sredimo onaj problem sa 2h
                const notifDate = new Date(notif.scheduldeDate);

                if (notifDate < new Date() && indx === -1) {
                  this.setNotifMessage(notif);
                  this.addNotification(notif);
                }
              });
            });
        }
      });
    });
  }

  // treba da joj promeni property seen =  true
  // po potrebi da prevede na drugu stranicu
  procesNotification(notification: Notificaion) {
    const indx = this.findNotification(notification._id);

    if (indx !== -1 && !this.userNotifations[indx].seen) {
      this.userNotifations[indx].seen = true;

      // ===> nemam ID notifikacije kako da je pronadjem,  a da budem siguran da nema takve
      this.httpClient
        .post(
          this.API + '/notificationSeen',
          {
            userID: this.authService.getUserId(),
            notif: notification
          },
          {
            headers: this.authService.getAuthHeaders()
          }
        )
        .subscribe(res => {
          this.navigateToPage(notification);
          this.calculateNumberOfNotification();
        });
    } else if (indx !== -1 && this.userNotifations[indx].seen) {
    }
  }

  navigateToPage(notification: any) {
    if (notification.type === 'message') {
      this.router.navigate(['/chat', notification.content.from]);
    } else if (
      notification.type === 'comment' ||
      notification.type === 'vote'
    ) {
      this.router.navigate([
        '/animeDetails',
        notification.content.playListOwner,
        notification.content.playlist,
        notification.content.animeTitle
      ]);
    }
    // da mu oboji komentar koji je reportovan???
    // neka ga za sad trazi rucno....
    else if (notification.type === 'commentReport') {
      this.router.navigate([
        '/animeDetails',
        notification.content.playListOwner,
        notification.content.playListName,
        notification.content.animeTitle
      ]);
    } else {
      console.log('nije jos sredjeno');
    }
  }

  // mora bolje da trazi koja je notifikacija ---> po nekom boljem parametru
  findNotification(notifId: number) {
    return this.userNotifations.findIndex(notification => {
      return notification._id === notifId;
    });
  }

  // calculate number of unseen notifications
  calculateNumberOfNotification() {
    this.notificationCounter = this.userNotifations.filter(
      x => x.seen === false
    ).length;
  }

  setNotifMessage(notif: Notificaion) {
    // if (notif.type === 'vote') {
    //   notif.message =
    //     notif.content.creator +
    //     ' ' +
    //     notif.title +
    //     ' anime: ' +
    //     notif.content.animeTitle +
    //     ' in list: ' +
    //     notif.content.playlist;
    //   // da sredi poruku notifikacije za schedule
    // } else if (notif.type === 'schedule') {
    //   notif.message = 'Reminder: ' + notif.title;
    // } else if (notif.type === 'message') {
    //   notif.message = notif.content.from + ' sends ' + notif.content.message;
    // } else if (notif.type === 'comment') {
    //   notif.message = 'New comment from ' + notif.content.creator;
    // } else if (notif.type === 'commentReport') {
    //   notif.message = 'Comment report by';
    // } else {
    //   notif.message = notif.title;
    // }
  }
}
