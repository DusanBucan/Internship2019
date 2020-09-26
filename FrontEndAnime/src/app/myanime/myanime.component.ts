import { Component, OnInit, Output, ViewChild, Inject } from '@angular/core';

import { SortAnimesPipe } from '../sort-animes.pipe';
import { FilterAnimesPipe } from '../filter-animes.pipe';

// za MODALNI DIJALOG
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

export interface DialogData {
  accessibility: boolean;
  name: string;
}

@Component({
  selector: 'dialog-overview-example-dialog-add',
  templateUrl: 'dialog-overview-example-dialog-add.html'
})
export class DialogOverviewExampleDialogAdd {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialogAdd>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  onListSaveSubmit(): void {
    this.dialogRef.close({
      action: 'ok',
      name: this.data.name,
      accessibility: this.data.accessibility
    });
  }
}

@Component({
  selector: 'ngAnime-overview-example-dialog-list-delete',
  templateUrl: 'dialog-overview-example-dialog-list-delete.html'
})
// tslint:disable-next-line: component-class-suffix
export class DialogOverviewExampleDialogListDelete {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialogListDelete>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onCancelDelete(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  onDelete(): void {
    this.dialogRef.close({ action: 'ok' });
  }
}

import { UserService } from '../user.service';
import { AuthService } from '../auth.service';
import { List } from '../list.model';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Anime } from '../anime/anime.model';
import { Router } from '@angular/router';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'app-route',
  templateUrl: './myanime.component.html',
  styleUrls: ['./myanime.component.scss']
})
export class MyanimeComponent implements OnInit {
  animes = [];

  showFilter = false;

  filterParam: null;

  sortBy = 'title';
  type = 'asc';
  filter = '';
  value = '';

  success = false;

  show = false;
  selectedList: List = new List(null, null, null, null);
  @ViewChild('f', { static: false }) saveStoryForm: NgForm;

  lists = [];
  selectedListName: string = '';
  error = null;

  otherSettings = {
    timeOut: 8000,
    animate: 'fromRight',
    showProgressBar: false
  };

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog,
    private notifPopUpSvc: NotificationsService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.userService.getUserPlayLists(user).subscribe((myPlayLists: any) => {
        this.lists = myPlayLists.myAnimeLists;
        console.log(this.lists);
      });
    });
  }

  onListSelect(listName: string) {
    if (listName != null) {
      this.selectedListName = listName;
      const id = this.authService.getUserId();

      if (id) {
        this.userService.getListDetails(id, listName).subscribe((res: any) => {
          this.animes = res;

          console.log(this.animes);

          this.filter = '';
          this.value = '';
          this.type = '';
          this.sortBy = '';
        });
      }
    }
  }

  onAddList() {
    this.selectedList = new List(
      null,
      null,
      null,
      new Date(this.getCurrentDate())
    );

    const dialogRef = this.dialog.open(DialogOverviewExampleDialogAdd, {
      data: { name: '', accessibility: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.action === 'ok') {
        const userid = this.authService.getUserId();

        this.userService
          .saveList(userid, result.accessibility, result.name)
          .subscribe(
            (list: any) => {
              this.error = null;
              this.lists = list.myAnimeLists;
              this.notifPopUpSvc.success(
                'List successfuly added',
                '',
                this.otherSettings
              );
            },
            (httpErrorResponse: HttpErrorResponse) => {
              this.error = httpErrorResponse.error;
              console.log(this.error.name);
              this.notifPopUpSvc.error(
                'List not successfuly added',
                this.error.name,
                this.otherSettings
              );
            }
          );
      } else {
        this.selectedList = new List(
          null,
          null,
          null,
          new Date(this.getCurrentDate())
        );
      }
    });
  }

  onListDeleteSubmit() {
    const userid = this.authService.getUserId();
    if (this.selectedList != null) {
      this.userService.deleteList(userid, this.selectedListName).subscribe(
        (res: any) => {
          this.lists = res.myAnimeLists as [];
          this.selectedListName = '';
          this.animes = [];
          this.filter = '';
          this.value = '';
          this.type = '';
          this.sortBy = '';
          this.notifPopUpSvc.success(
            'List successfuly removed',
            '',
            this.otherSettings
          );
        },
        (httpErrorResponse: HttpErrorResponse) => {
          this.error = httpErrorResponse.error;
          this.notifPopUpSvc.error(
            'List not successfuly removed',
            '',
            this.otherSettings
          );
        }
      );
    }
  }

  onListDelete(listName: string) {
    this.selectedListName = listName;

    const dialogRef = this.dialog.open(DialogOverviewExampleDialogListDelete, {
      width: '300px',
      data: { name: this.selectedListName, type: 'list' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.action === 'ok') {
        this.onListDeleteSubmit();
      } else {
        this.selectedList = new List(null, null, null, null);
      }
    });
  }

  onAnimaDeleteFromList(anime: any) {
    const dialogRef = this.dialog.open(DialogOverviewExampleDialogListDelete, {
      width: '300px',
      data: { name: anime.title, type: 'anime' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.action === 'ok') {
        const userid = this.authService.getUserId();
        this.userService
          .deleteAnimeFromList(userid, this.selectedListName, anime.title)
          .subscribe(
            res => {
              this.notifPopUpSvc.success(
                'Anime successfuly removed from list',
                '',
                this.otherSettings
              );
              const indx = this.animes.findIndex(x => x.title === anime.title);
              this.animes.splice(indx, 1);
            },
            (httpErrorResponse: HttpErrorResponse) => {
              this.error = httpErrorResponse.error;
              this.notifPopUpSvc.error(
                'Anime not successfuly removed from list',
                '',
                this.otherSettings
              );
            }
          );
      } else {
      }
    });
  }

  closeListDelete() {
    this.selectedList = new List(null, null, null, null);
  }

  getCurrentDate() {
    return new Date().toISOString().slice(0, 10);
  }

  showAnimeDetails(anime: Anime) {
    const userEmail = this.authService.getEmail();
    const listName = this.selectedListName;
    const animeTitle = anime.title;

    this.router.navigate(['/animeDetails', userEmail, listName, animeTitle]);
  }

  setFilter(filter: any, value: any) {
    if (!filter) {
      this.value = 'all';
    } else {
      this.value = value;
    }
    this.filter = filter;
  }

  setSort(sort: any) {
    this.sortBy = sort;
  }

  setType(type: any) {
    this.type = type;
  }
}
