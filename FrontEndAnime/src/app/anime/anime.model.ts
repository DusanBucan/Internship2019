export class Anime {
  public _id: number;
  public malId: number; // ovo je id sa  MyAnimeList
  public title: string;
  public synopsis: string;
  public accessibility: number;
  public startDate: Date;
  public endDate: Date;
  public malScore: number;
  public imageUrl: string;
  public avgRate: number;
  public episodes: number;
  public url: string;
  public airing: boolean;
  public type: [string];

  constructor(
    id: number,
    malId: number, // ovo je id sa  MyAnimeList
    title: string,
    synopsis: string,
    accessibility: number,
    startDate: Date,
    endDate: Date,
    malScore: number,
    imageUrl: string,
    avgRate: number,
    episodes: number,
    url: string,
    airing: boolean,
    type: [string]
  ) {
    this._id = id;
    this.malId = malId; // ovo je id sa  MyAnimeList
    this.title = title;
    this.synopsis = synopsis;
    this.accessibility = accessibility;
    this.startDate = startDate;
    this.endDate = endDate;
    this.malScore = malScore;
    this.imageUrl = imageUrl;
    this.avgRate = avgRate;
    this.episodes = episodes;
    this.url = url;
    this.airing = airing;
    this.type = type;
  }
}
