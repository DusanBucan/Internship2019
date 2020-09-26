import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService } from '../user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { switchMap } from 'rxjs/operators';

import { SortAnimesPipe } from '../sort-animes.pipe';
import { FilterAnimesPipe } from '../filter-animes.pipe';
import { Anime } from '../anime/anime.model';

@Component({
  selector: 'ngAnime-otherslist',
  templateUrl: './otherslist.component.html',
  styleUrls: ['./otherslist.component.scss']
})
export class OtherslistComponent implements OnInit {
  animes = [];

  showFilter = false;

  filterParam: null;

  sortBy = 'title';
  type = 'asc';
  filter = '';
  value = '';

  success = false;

  show = false;

  userEmail = '';
  playListName = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          this.userEmail = params.get('user_email');
          this.playListName = params.get('play_list');
          return ['a'];
        })
      )
      .subscribe(a => {
        if (this.userEmail && this.playListName) {
          this.userService
            .getUserByEmail(this.userEmail)
            .subscribe((user: any) => {
              this.userService
                .getListDetails(user._id, this.playListName)
                .subscribe((res: any) => {
                  this.animes = res;

                  console.log(this.animes);

                  this.filter = '';
                  this.value = '';
                  this.type = '';
                  this.sortBy = '';
                });
            });
        }
      });
  }

  showAnimeDetails(anime: Anime) {
    const animeTitle = anime.title;

    this.router.navigate([
      '/animeDetails',
      this.userEmail,
      this.playListName,
      animeTitle
    ]);
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
