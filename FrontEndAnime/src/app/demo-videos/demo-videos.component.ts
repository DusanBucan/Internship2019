import { Component, OnInit } from '@angular/core';
import { EmbedVideoService } from 'ngx-embed-video';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'ngAnime-demo-videos',
  templateUrl: './demo-videos.component.html',
  styleUrls: ['./demo-videos.component.scss']
})
export class DemoVideosComponent implements OnInit {
  demos = [
    {
      description: 'create new anime playlist',
      videoUrl: 'https://www.youtube.com/watch?v=TtUk26sj5fk'
    },
    {
      description: 'add anime to list',
      videoUrl: 'https://www.youtube.com/watch?v=nZY3AZeaPk8'
    },
    {
      description: 'remove anime from list',
      videoUrl: 'https://www.youtube.com/watch?v=iagbc9o3tSk'
    },
    {
      description: 'add anime to schedule list',
      videoUrl: 'https://www.youtube.com/watch?v=08ZW4TM6ImE'
    },
    {
      description: 'search random anime',
      videoUrl: 'https://www.youtube.com/watch?v=UOZwoinLdJQ'
    },
    {
      description: 'view user profile',
      videoUrl: 'https://www.youtube.com/watch?v=INEY04-JqRU'
    },
    {
      description: 'see anime details',
      videoUrl: 'https://www.youtube.com/watch?v=_u7649sM-IA'
    }
  ];

  yt_iframe_html = null;
  urlTrailer = null;

  spinnerText = 'Loading demo';

  constructor(
    private embedService: EmbedVideoService,
    private spinner: NgxSpinnerService
  ) {}

  showVideo(demo: any) {
    this.spinner.show();
    this.urlTrailer = demo.videoUrl;
    this.yt_iframe_html = this.embedService.embed(this.urlTrailer, {
      attr: { width: 700, height: 500 }
    });

    setTimeout(() => {
      this.spinner.hide();
    }, 4000);
  }

  ngOnInit() {}
}
