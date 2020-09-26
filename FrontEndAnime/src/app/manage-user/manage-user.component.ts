import { Component, OnInit, ViewChild, Inject } from '@angular/core';

// za MODALNI DIJALOG
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';

export interface DialogData {
  dueDate: string;
  name: string;
}

@Component({
  selector: 'ngAnime-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class DialogOverviewExampleDialog {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onCancelSuspend(): void {
    this.dialogRef.close({ action: 'cancel', date: null });
  }

  onSuspendUser(): void {
    this.dialogRef.close({ action: 'ok', date: this.data.dueDate });
  }
}

@Component({
  selector: 'ngAnime-overview-example-dialog-delete',
  templateUrl: 'dialog-overview-example-dialog-delete.html'
})
// tslint:disable-next-line: component-class-suffix
export class DialogOverviewExampleDialogDelete {
  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialogDelete>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onCancelDelete(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  onDelete(): void {
    this.dialogRef.close({ action: 'ok' });
  }
}

//KRAJ ZA MODALNI DIJALOG

//Angular materials
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { User } from 'src/app/user.model';
import { NgForm } from '@angular/forms';
import { NotificationsService } from 'angular2-notifications';

@Component({
  selector: 'ngAnime-manage-user',
  templateUrl: './manage-user.component.html',
  styleUrls: ['./manage-user.component.scss']
})
export class ManageUserComponent implements OnInit {
  allUsers: User[];
  dataSource: MatTableDataSource<any>; //
  displayedColumns = ['name', 'email', 'role', 'actions'];
  pageEvent = new PageEvent();

  dueDate: any;

  selectedUser: User;
  operation: string;
  searchValue: string;

  totalSize = 0;

  userRoles = [{ val: 2, name: 'user' }, { val: 4, name: 'admin' }];

  otherSettings = {
    timeOut: 8000,
    animate: 'fromRight',
    showProgressBar: false
  };

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private userService: UserService,
    private router: Router,
    private authService: AuthService,
    public dialog: MatDialog,
    private notifPopUpSvc: NotificationsService
  ) {
    this.searchValue = '';
  }

  ngOnInit() {
    this.searchValue = '';
    this.operation = 'Add';
    this.pageEvent.length = 0;
    this.pageEvent.pageIndex = 0;
    this.pageEvent.pageSize = 5;
    this.pageEvent.previousPageIndex = -1;
    this.populateDataSource(this.pageEvent);

    this.selectedUser = new User(null, null, null, null, null, null);
  }

  // podesim paginaciju i to sve na pocetnu stranicu i kao search param saljem * ili neki string, kad menja stranicu
  // opet mu posaljm taj parametar i elemnte koju stranicu treba da prikaze
  searchUser(searchValue: string) {
    //
    this.pageEvent.length = 0;
    this.pageEvent.pageIndex = 0;
    this.pageEvent.pageSize = 5;
    this.pageEvent.previousPageIndex = -1;
    this.searchValue = searchValue;

    this.paginator.pageIndex = 0;

    this.populateDataSource(this.pageEvent);
  }

  onUserDeleteSubmit() {
    if (this.selectedUser != null) {
      this.userService.deleteUser(this.selectedUser._id).subscribe(res => {
        this.pageEvent.length = 0;
        this.pageEvent.pageIndex = 0;
        this.pageEvent.pageSize = 5;
        this.pageEvent.previousPageIndex = -1;
        this.notifPopUpSvc.success("User successfuly deleted" , '', this.otherSettings);
        this.populateDataSource(this.pageEvent);
      }, err => {
        this.notifPopUpSvc.error("User not successfuly deleted" , err.error, this.otherSettings);
      });
    }
  }

  onDeleteUser(user: any) {
    this.selectedUser = Object.assign({}, user);

    this.dueDate = '';

    // tslint:disable-next-line: no-use-before-declare
    const dialogRef = this.dialog.open(DialogOverviewExampleDialogDelete, {
      width: '300px',
      data: { name: this.selectedUser.name, animal: 'aaa' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.action === 'ok') {
        this.onUserDeleteSubmit();
      } else {
        this.selectedUser = new User(null, null, null, null, null, null);
        this.dueDate = null;
      }
    });
  }
  closeUserDelete() {
    this.selectedUser = new User(null, null, null, null, null, null);
  }

  openAddUserModal() {
    this.operation = 'Add';
    this.selectedUser = new User(null, null, null, null, null, null);
  }

  onUserSaveSubmit(form: NgForm, closeButton: HTMLButtonElement) {
    const payload = {
      name: form.value.name,
      email: form.value.email,
      // password: form.value.password,
      // password2: form.value.password2,

      _id: this.operation === 'Edit' ? this.selectedUser._id : null,
      role: form.value.role
    };

    if (payload.role != null) {
      this.userService.saveUser(payload).subscribe(res => {
        closeButton.click();
      });
    }
    // reci da nije odabran role
    if (payload.role == null) {
      alert('choose user type');
    }
  }

  // ovo ce da vodi na stranicu da pogledas sve storije korisnika i njegove podatke
  userDetails(user: any) {
    this.router.navigate(['/settings', user.email]);
  }

  // IZBACI DA NE VIDI SEBE NA LISTI!!!!!!  -->mocice kad bude radilo da cuva usera u local storage
  populateDataSource(event: PageEvent) {
    this.userService.getAllUsers(event, this.searchValue).subscribe(res => {
      const array = res.users.map(user => {
        return {
          $key: user._id,
          password2: user.password,
          ...user
        };
      });
      this.dataSource = new MatTableDataSource(array);
      this.allUsers = res.users.map(user => {
        return {
          ...user,
          password2: user.password
        };
      });
      this.totalSize = res.length;

      this.dataSource.sort = this.sort;
    });
  }

  isAdmin() {
    return this.authService.hasRoleAdmin();
  }

  // block user for period of time

  onBlockClick(user: User): void {
    this.selectedUser = user;
    this.dueDate = '';

    // odblokira usera koji je blokiran
    if (this.isBlocked(user)) {
      this.userService.unblockUser(this.selectedUser._id).subscribe(res => {
        this.selectedUser.blockedDueDate = null;
      });
    } else {
      // tslint:disable-next-line: no-use-before-declare
      const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
        width: '300px',
        data: { name: this.selectedUser.name, animal: 'aaa' }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result.action === 'ok') {
          if (result.date) {
            this.dueDate = new Date(result.date);

            if ( this.dueDate < new Date()) {
              alert("The entered date must be in the future");
              return;
            }

            // blokira usera
            this.userService
              .suspendUser(this.selectedUser._id, this.dueDate)
              .subscribe(res => {
                this.notifPopUpSvc.success("User successfuly blocked" , '', this.otherSettings);
                this.selectedUser.blockedDueDate = this.dueDate;
              }, err => {
                this.notifPopUpSvc.error("User not successfuly blocked" , err.error, this.otherSettings);
                this.selectedUser = new User(null, null, null, null, null, null);
                this.dueDate = null;
              });
          }
        } else {
          this.selectedUser = new User(null, null, null, null, null, null);
          this.dueDate = null;
        }
      });
    }
  }

  isBlocked(user: any) {
    return (
      user.blockedDueDate !== null && new Date(user.blockedDueDate) > new Date()
    );
  }
}
