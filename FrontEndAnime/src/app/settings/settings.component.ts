import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { HttpErrorResponse } from '@angular/common/http';
import { NotificationsService } from 'angular2-notifications';
import { Observable } from 'rxjs';

@Component({
  selector: 'ngAnime-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private notifPopUpSvc: NotificationsService,
    private router: Router
  ) {}

  userEmail = '';
  isMe = false;
  user = { name: '', email: '', image: { url: '', id: '' }, id: '' };
  spinnerMessage = '';
  error = '';
  lists = [];

  otherSettings = {
    timeOut: 8000,
    animate: 'fromRight',
    showProgressBar: false
  };

  // ovo ako je lista prazna pa da bude ova slika
  defaultPlayListImage =
    'https://res.cloudinary.com/detyu5wgu/image/upload/v1568292200/demo/defaultPlyalistImage.jpg';

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          this.userEmail = params.get('user_email');
          return ['a'];
        })
      )
      .subscribe(res1 => {
        this.authService.getCurrentUser().subscribe(user => {
          this.user = user;

          const email = this.user.email;
          // popuni moji podacima
          if (email === this.userEmail) {
            this.isMe = true; // da li moze da edituje ili samo da gleda profil

            this.userService
              .getUserImage(this.user.id)
              .subscribe((image: any) => {
                this.user.image = image.image;
              });

            this.userService
              .getUserPlayLists(user)
              .subscribe((myPlayLists: any) => {
                this.lists = myPlayLists.myAnimeLists;

                this.lists.map(x => {
                  if (x.coverImages.length > 0) {
                    x.image = x.coverImages[0];
                  } else {
                    x.image = this.defaultPlayListImage;
                  }
                  return x;
                });
              });
          } else {
            this.userService
              .getUserByEmail(this.userEmail)
              .subscribe((res: any) => {
                this.user = res as any;
                console.log('dosao');
                console.log(this.user);
                this.user.id = res._id;

                this.userService
                  .getUserPlayLists(this.user)
                  .subscribe((myPlayLists: any) => {
                    this.lists = [];

                    let a = myPlayLists.myAnimeLists;

                    a = a.map(x => {
                      if (x.coverImages.length > 0) {
                        x.image = x.coverImages[0];
                      } else {
                        x.image = this.defaultPlayListImage;
                      }
                      return x;
                    });

                    a.forEach(x => {
                      if (x.privacy === 'true') {
                        this.lists.push(x);
                      }
                    });
                  });
              });
          }
        });
      });
  }

  onImageSelected(event: any) {
    const selectedFile = event.target.files[0];
    this.spinnerMessage = 'Uploading image...';
    this.spinner.show();
    this.userService.changeProfileImage(selectedFile).subscribe(
      res => {
        this.spinner.hide();

        if (this.user.image) {
          this.user.image.url = (res as any).url;
          this.user.image.id = (res as any).id;
        } else {
          const a = Object.assign({}, this.user);
          a.image = res as any;
          this.user = a;
          this.notifPopUpSvc.success(
            'Image successfuly added',
            '',
            this.otherSettings
          );
        }
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.error = httpErrorResponse.error;
        this.spinner.hide();
        this.notifPopUpSvc.error(
          'Image not successfuly added',
          this.error,
          this.otherSettings
        );
      }
    );
  }

  updateProfile() {
    this.spinnerMessage = 'Updating profile...';
    this.spinner.show();
    this.userService.saveUser(this.user).subscribe(
      rez => {
        this.spinner.hide();
        this.notifPopUpSvc.success(
          'Profile successfuly updated',
          '',
          this.otherSettings
        );
      },
      (httpErrorResponse: HttpErrorResponse) => {
        this.error = httpErrorResponse.error;
        this.spinner.hide();
        this.notifPopUpSvc.error(
          'Profile not successfuly updated',
          this.error,
          this.otherSettings
        );
      }
    );
  }

  onListSelect(listName: string) {
    const indx = this.lists.findIndex(x => x.name === listName);
    if (indx !== -1) {
      if (this.lists[indx].coverImages.length < 1) {
        alert('list empty');
      } else {
        this.router.navigate(['/userList', this.user.email, listName]);
      }
    }
  }
}
