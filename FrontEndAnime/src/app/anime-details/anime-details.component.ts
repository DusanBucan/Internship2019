import { Component, OnInit, Inject } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { Anime } from '../anime/anime.model';
import { AnimeService } from '../anime/anime.service';

import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import { element } from 'protractor';
import { CommentService } from '../comment.service';
import { SocketService } from '../socket.service';
import { VoteService } from '../vote.service';
import { SocialService } from 'ngx-social-button';
import { Meta } from '@angular/platform-browser';
import { NotificationsService } from 'angular2-notifications';
import { EmbedVideoService } from 'ngx-embed-video';
export interface DialogData {
  comment: string;
  name: string;
}

@Component({
  selector: 'ngAnime-dialog-add-comment',
  templateUrl: 'anime-details-comment-dialog.html'
})
// tslint:disable-next-line: component-class-suffix
export class DialogAddComment {
  constructor(
    public dialogRef: MatDialogRef<DialogAddComment>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onCancelComment(): void {
    this.dialogRef.close({ action: 'cancel', comment: null });
  }

  onCommentAnime(): void {
    this.dialogRef.close({ action: 'ok', comment: this.data.comment });
  }
}

@Component({
  selector: 'ngAnime-anime-details',
  templateUrl: './anime-details.component.html',
  styleUrls: ['./anime-details.component.scss']
})
export class AnimeDetailsComponent implements OnInit {
  private anime: Anime;
  private comments = [];

  private animeTitle;
  private userEmail;
  private listName;

  private numberOfLikes = 0;
  private numberOfDislike = 0;
  private votes = [];

  private user = null;
  private isAdmin = false;

  // dugmici za ocenjivanje
  likeButtonPresed = false;
  dislikeButtonPresed = false;

  shareObj: any;

  otherSettings = {
    timeOut: 8000,
    animate: 'fromRight',
    showProgressBar: false
  };

  // za yt video

  urlForShare = '';
  urlTrailer = '';

  yt_iframe_html: any;

  // kraj za yt video

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private animeService: AnimeService,
    private commentService: CommentService,
    private authService: AuthService,
    private socketService: SocketService,
    private voteService: VoteService,
    private socialAuthService: SocialService,
    private meta: Meta,
    private notifPopUpSvc: NotificationsService,
    private embedService: EmbedVideoService
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          this.userEmail = params.get('user_email');
          this.listName = params.get('lista_name');
          this.animeTitle = params.get('id');

          return this.animeService.findAnimeByID(params.get('id'));
        })
      )
      .subscribe(anime => {
        this.anime = anime as Anime;

        this.animeService
          .findTrailerAndANimeUrl(this.anime.malId)
          .subscribe((aaaa: any) => {
            this.urlTrailer = aaaa.trailer_url;
            this.urlForShare = aaaa.url;

            console.log(this.urlForShare);

            // podesavanje za video
            if (this.urlTrailer) {
              const a = this.urlTrailer.split('/')[4].split('?')[0];

              this.urlTrailer = 'https://www.youtube.com/watch?v=' + a;

              this.yt_iframe_html = this.embedService.embed(this.urlTrailer, {
                attr: { width: 700, height: 500 }
              });
            }

            // podesavanje za share
            this.shareObj = {
              href: this.urlForShare,
              hashtag: '#' + this.animeTitle
            };
          });

        this.authService.getCurrentUser().subscribe(res => {
          this.user = res as any;
          this.isAdmin = this.user.role === 4;
          this.commentService
            .getAnimaComments(this.userEmail, this.listName, this.animeTitle)
            .subscribe(comments => {
              this.comments = comments as [];

              // da dobavi broj like/dislike  inicialno kad udjes na ovu strnicu
              this.voteService
                .getAnimeVotes(this.userEmail, this.listName, this.animeTitle)
                .subscribe((votes: any) => {
                  this.votes = votes as [];

                  this.numberOfDislike = 0;
                  this.numberOfLikes = 0;

                  votes.map(x => {
                    if (x.content) {
                      this.numberOfLikes++;
                    } else {
                      this.numberOfDislike++;
                    }
                  });
                  // da oznaci dugme kako si komentarisao.. da li si stisnuo like/dislike
                  this.voteService
                    .userRated(this.userEmail, this.listName, this.animeTitle)
                    .subscribe(vote => {
                      if (vote) {
                        /* ovo vrati kako si ti glasao ----> treba da se podesi css dugmicima da izlgedaju stisnuto na osnuvu 
                          likeButtonPresed = false;
                          dislikeButtonPresed = false;
                  */

                        this.setButtons(vote);
                      }
                    });
                });

              // da se obrise komentar u real time
              this.socketService
                .onAnimeCommentRemoved()
                .subscribe(commentId => {
                  const indx = this.comments.findIndex(
                    x => x._id === commentId
                  );

                  if (indx !== -1) {
                    this.comments.splice(indx, 1);
                  }
                });

              // kad neko komentarise da se komenar pojavi u real time
              this.socketService.onNewAnimeComment().subscribe(newComment => {
                // da ako si na nekoj drugoj animi ne dobijes komentar ako nije za tu animu u toj play listi
                if (
                  this.userEmail === newComment.playListOwner &&
                  this.listName === newComment.playlist &&
                  this.animeTitle === newComment.animeTitle
                ) {
                  const Creator = {
                    name: newComment.sender
                  };
                  const c = {
                    _id: newComment._id,
                    creator: Creator,
                    content: newComment.content,
                    date: new Date()
                  };

                  const indx3 = this.comments.findIndex(x => x._id === c._id);
                  if (indx3 === -1) {
                    this.comments.push(c);
                  }
                }
              });

              /// kad neko komentarise a mi smo na strani anime da se prikaze taj vote ---> tj da se poveca broj like dislike za tu animu
              // treba da se MENJA AKO JE NEKI LIKE PA DISLIKE.... i ovo da s proverava....
              this.socketService.onAnimeRated().subscribe(newVote => {
                if (
                  this.userEmail === newVote.playListOwner &&
                  this.listName === newVote.playlist &&
                  this.animeTitle === newVote.animeTitle
                ) {
                  this.numberOfDislike = 0;
                  this.numberOfLikes = 0;
                  //const curAnime = Object.assign({}, this.anime);

                  const indxVote = this.votes.findIndex(
                    x => x._id === newVote._id
                  );
                  if (indxVote !== -1) {
                    this.votes[indxVote] = newVote;
                  } else {
                    this.votes.push(newVote);
                  }

                  this.numberOfDislike = 0;
                  this.numberOfLikes = 0;
                  // sracuna ponovo brojeve like/dislike

                  this.numberOfDislike = 0;
                  this.numberOfLikes = 0;

                  this.votes.map(x => {
                    if (x.content) {
                      this.numberOfLikes++;
                    } else {
                      this.numberOfDislike++;
                    }
                  });
                  //this.anime = curAnime;
                }
              });
            });
        });
      });
  }

  opetCommentDialog() {
    let comment = '';

    const dialogRef = this.dialog.open(DialogAddComment, {
      width: '300px',
      data: { name: this.anime.title, animal: 'aaa' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.action === 'ok') {
        if (result.comment) {
          comment = result.comment;
          this.commentService.addComment(
            this.userEmail,
            this.listName,
            this.anime.title,
            comment
          );
        }
      } else {
        comment = null;
      }
    });
  }

  reportComment(comment: any) {
    this.commentService.reportComment(comment, this.user, this.userEmail);
  }

  // da iskoci modal kao potvrdni dijalog --> kad ga obrise da mu stigne poruka da je uspesno obrisao komentar
  // kad se komentar uspesno obrise da se ostalim koji su online obrise komentar
  // ako su na toj stranici ---> OVO FALI I KAD NEKO DODA KOMENTAR...............
  removeComment(comment: any) {
    this.commentService.removeComment(comment._id).subscribe(
      ress => {
        console.log(ress);
        this.socketService.removeComment(comment._id);
        this.notifPopUpSvc.success(
          'Comment successfuly removed',
          '',
          this.otherSettings
        );
      },
      err => {
        this.notifPopUpSvc.error(
          'Comment not successfuly removed',
          err.error,
          this.otherSettings
        );
      }
    );
  }

  // treba da se proveri i da li je user like/dislike tu animu... kad je load-a onda da load-a i kako je user glasao za tu animu....

  likeAnime() {
    this.dislikeButtonPresed = false;

    this.likeButtonPresed = true;

    this.voteService.rateAnime(
      true,
      this.userEmail,
      this.listName,
      this.anime.title
    );
  }

  dislikeAnime() {
    this.likeButtonPresed = false;
    this.dislikeButtonPresed = true;

    this.voteService.rateAnime(
      false,
      this.userEmail,
      this.listName,
      this.anime.title
    );
  }

  setButtons(vote: any) {
    if (vote.content === true) {
      this.likeButtonPresed = true;
      this.dislikeButtonPresed = false;
    } else if (vote.content === false) {
      this.likeButtonPresed = false;
      this.dislikeButtonPresed = true;
    }
  }

  // za yt video
}
