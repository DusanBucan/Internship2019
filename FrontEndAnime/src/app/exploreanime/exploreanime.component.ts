import { Component, OnInit, Inject } from '@angular/core';
import { ApiAryService } from '../api-ary.service';
import { AnimeService } from '../anime/anime.service';
//

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { element } from 'protractor';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NotificationService } from '../notification.service';
import { NotificationsService } from 'angular2-notifications';

export interface DialogData {
  dueDate: string;
  name: string;
}

@Component({
  selector: 'ngAnime-overview-example-dialogg',
  templateUrl: 'exporeanime.component.setSheduleTime.html'
})
// tslint:disable-next-line: component-class-suffix
export class DialogOverviewExampleDialogSetTimeShedulde {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialogSetTimeShedulde>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onCancelShedulde(): void {
    this.dialogRef.close({ action: 'cancel', date: null });
  }

  onSheduldeAnime(): void {
    this.dialogRef.close({ action: 'ok', date: this.data.dueDate });
  }
}
// KRAJ KOMPONENTE ZA setovanje vremena za shedule list

@Component({
  selector: 'ngAnime-exploreanime',
  templateUrl: './exploreanime.component.html',
  styleUrls: ['./exploreanime.component.scss']
})
export class ExploreanimeComponent implements OnInit {
  animes = [];
  topAnimes = [];
  filterParam: null;

  spinnerText = '';

  otherSettings = {
    timeOut: 8000,
    animate: 'fromRight',
    showProgressBar: false
  };

  userList = [
    { value: 'watched', viewValue: 'Watched List' },
    { value: 'schedule', viewValue: 'Schedule list' }
  ];
  constructor(
    private apiAryService: ApiAryService,
    private animeService: AnimeService,
    public dialog: MatDialog,
    private authService: AuthService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private notificationService: NotificationService,
    private notifPopUpSvc: NotificationsService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.userService.getUserPlayLists(user).subscribe((myPlayLists: any) => {
        this.userList = myPlayLists.myAnimeLists;
      });

      // podesi Top rated anime
      this.apiAryService.loadTopAnime().then(result => {
        console.log(result);
        this.topAnimes = result.top as [];
        this.animes = [];
      });
    });
  }

  SearchAnimeOnline(event: HTMLInputElement, filter: any) {
    if (filter._value === 'null') {
      alert('choose filter');
    } else {
      this.topAnimes = [];
      this.filterParam = filter._value;

      if (filter._value === 'random') {
        console.log('dosaooo');

        this.animes = [];
        this.spinnerText = 'Search random...';
        this.spinner.show();

        this.apiAryService.randomAnimes().subscribe((result: any) => {
          if (result.anime) {
            const indx = this.apiAryService.getRandomInt(result.anime.length);
            const randomAnime = result.anime[indx];
            this.animes.push(randomAnime);
            this.spinner.hide();
          } else {
            const indx = this.apiAryService.getRandomInt(result.top.length);
            let randomAnime = result.top[indx];
            this.apiAryService
              .loadAnimeGenre(randomAnime.mal_id)
              .subscribe((res: any) => {
                this.spinner.hide();
                randomAnime = res;
                this.animes.push(randomAnime);
              });
          }
        });
      } else {
        // mora da se prosledi neki parametar kad pretrazujes
        if (event.value !== '' && event.value !== null) {
          this.animes = [];

          this.spinnerText = 'Search ' + event.value;

          this.spinner.show();
          this.apiAryService
            .searchAnime(event.value, filter._value)
            .then(results => {
              this.animes = results.results;

              console.log(results.results);

              this.spinner.hide();
            });
        } else {
          alert('set search parameter');
        }
      }
    }
  }

  setAnimeTime(anime: any) {
    let dueDate = new Date();

    // tslint:disable-next-line: no-use-before-declare
    const dialogRef = this.dialog.open(
      DialogOverviewExampleDialogSetTimeShedulde,
      {
        width: '300px',
        data: { name: anime.title, animal: 'aaa' }
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result.action === 'ok') {
        if (result.date) {
          dueDate = new Date(result.date);

          console.log(result.date);
          console.log(dueDate);

          // da li je datum posle trenutnog
          if (dueDate < new Date()) {
            alert('The entered date must be in the future');
            return;
          }

          this.spinner.show(); /// prikaze spinne

          this.animeService
            .addToUserList('schedule', anime, dueDate)
            .subscribe(res => {
              // doda notifikaciju za schedule animu koja je dodata u listu
              this.notificationService
                .addNewScheduleNotification(
                  anime,
                  dueDate,
                  this.authService.getUser()
                )
                .subscribe(
                  results => {
                    this.spinner.hide();
                    const msg = 'Successfuly added to list: schedule';
                    this.notifPopUpSvc.success(msg, '', this.otherSettings);
                  },
                  err => {
                    this.spinner.hide();
                    this.notifPopUpSvc.error(
                      'Not added to list: schedule',
                      err.error,
                      this.otherSettings
                    );
                  }
                );
            });
        }
      } else {
        dueDate = null;
      }
    });
  }

  addToList(event: any, anime: any) {
    console.log(event.value);
    this.spinnerText = 'Adding anime';

    // da ne moze da doda u none
    if (!event.value) {
      return;
    }

    if (event.value === 'schedule') {
      this.setAnimeTime(anime);
    } else {
      this.spinner.show(); /// prikaze spinne
      this.animeService.addToUserList(event.value, anime, null).subscribe(
        res => {
          this.spinner.hide();
          const msg = 'Successfuly added to list: ' + event.value;
          this.notifPopUpSvc.success(msg, '', this.otherSettings);
          console.log('sakri spinner');
        },
        err => {
          // pogledaj da li je error ono sto ce biti bas u gresci
          this.spinner.hide();
          this.notifPopUpSvc.error(
            'Not successfuly added to list: ' + event.value,
            err.error,
            this.otherSettings
          );
        }
      );
    }
  }
}
