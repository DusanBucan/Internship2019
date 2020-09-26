import { Component, OnInit } from '@angular/core';
import { AnimeService } from '../anime/anime.service';
import { runInThisContext } from 'vm';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'ngAnime-animes-community-page',
  templateUrl: './animes-community-page.component.html',
  styleUrls: ['./animes-community-page.component.scss']
})
export class AnimesCommunityPageComponent implements OnInit {
  constructor(private animeService: AnimeService, private router: Router, private spinner: NgxSpinnerService) {}

  foundAnimes: any;
  users = [];
  page = 0;
  searchParam = '';
  spinnerText = ''

  ngOnInit() {}

  searchLocal(searchParam: string) {

    this.spinnerText = "Searching anime"
    this.page = 0;
    this.searchParam = searchParam;

    this.spinner.show();

    this.animeService
      .searchLocalAnimes({ searchParam: this.searchParam, page: this.page })
      .subscribe((res: any) => {
        this.foundAnimes = null;
        this.users = [];

        if (res.animes.length > 0) {
          this.foundAnimes = res.animes;

          res.users.map(x => {
            x.pls.map(y => {
              const indx = this.foundAnimes.findIndex(
                z => z.title === y.animeTitle
              );
              if (indx !== -1) {
                this.users.push({
                  email: x.email,
                  name: x.name,
                  list: y.listName,
                  anime: this.foundAnimes[indx]
                });
              }
            });
          });
        }

        this.spinner.hide()


      });
  }

  // sta ja ovde limitiram????
  loadMoreAnimes() {
    this.page += 1;
    this.animeService
      .searchLocalAnimes({ searchParam: this.searchParam, page: this.page })
      .subscribe((res: any) => {
        if (res.animes.length > 0) {
          // za svaki animu koja je stigla ako nije u found animama dodaj je
          res.animes.map(x => {
            const indx2 = this.foundAnimes.findIndex(y => y.title === x.title);

            if (indx2 === -1) {
              this.foundAnimes.push(x);
            }
          });

          // ovde sad dodaje za usere u listu usera
          res.users.map(x => {
            x.pls.map(y => {
              const indx = this.foundAnimes.findIndex(
                z => z.title === y.animeTitle
              );
              if (indx !== -1) {
                this.users.push({
                  email: x.email,
                  name: x.name,
                  list: y.listName,
                  anime: this.foundAnimes[indx]
                });
              }
            });
          });
        }
      });
  }

  showAnimeDetails(user: any) {
    const userEmail = user.email; /// mozda cu morati da saljem i email...
    const listName = user.list;
    const animeTitle = user.anime.title;

    this.router.navigate(['/animeDetails', userEmail, listName, animeTitle]);
  }
}
