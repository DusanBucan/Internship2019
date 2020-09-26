import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { SocketService } from '../socket.service';
import { Notificaion } from '../notification/notification.model';
import { HttpClient } from '@angular/common/http';
import { not } from '@angular/compiler/src/output/output_ast';
import { NotificationService } from '../notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'ngAnime-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  myMail = '';

  constructor(
    private socketService: SocketService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {
    this.socketService.onNewNotification().subscribe(res => {
      this.notificationService.addNotification(res);
      // obavesti notification servis da treba da deluje ---> ovo je schedule notifikacija
    });

    // notifikacije za report ---> samo za admina
    this.socketService.onCommentReported().subscribe(res => {
      // ovo mi je najlakse.....

      res.message = res.title; // teska budzevina.....
      this.notificationService.showNotification(res);
      this.notificationService.getUserNotifications();
    });

    // kad mu stigne poruka od drugo usera
    this.socketService.onNewMessage().subscribe(res => {
      // problem je sad sto je id === null i kako ces onda da ovo oznacis kao seen i ostal
      // DA LI CE SE PORUKE PAMTITI???????//

      const notif = new Notificaion(
        'message',
        res,
        res.message,
        false,
        null,
        null,
        null
      );
      // malo lose al jbg ---> isptalo je prekomlikovano da ova metoda i onom koji je  poslao poruku oznaci tvoje poruke kao procitane.....
      this.notificationService
        .addNewMessageNotification(notif)
        .subscribe(() => {
          this.notificationService.showNotification(notif);
          this.notificationService.getUserNotifications();
        });

      // posaljes bazi da sacuva ovo i kad sacuva onda to sto vrati ces da prikazes.....
    });

    // da mu stigne obavestenje da mu je neko komentarisao animu u nekoj od njegovih playlista

    this.socketService.onAnimeCommented().subscribe(res => {
      // od rezultatat da napravin notifikaciju i da pu je pushnem...

      // fora je da mu ne stigne notifikacija ako je sam sebi komentarisao..
      if (res.from !== this.authService.getEmail()) {
        const notif = res.message as Notificaion;
        this.notificationService.addNotification(notif);
      }
    });

    // da ti stigne notifikacija kad ti neko like/dislike neku animu
    this.socketService.onMyAnimeRated().subscribe(res => {
      const notif = res.message as Notificaion;
      this.notificationService.addNotification(notif);
    });
  }

  //

  ngOnInit() {
    this.notificationService.getUserNotifications();
  }

  procesNotification(notication: any) {
    this.notificationService.procesNotification(notication);
  }

  goToProfil() {
    this.authService.getCurrentUser().subscribe(res => {
      this.myMail = res.email;
      this.router.navigate(['/settings', this.myMail]);
    });
  }

  goToDemo() {
    this.router.navigate(['/demo']);
  }
}
