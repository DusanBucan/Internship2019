export class List {
  public _id: number;
  public name: string;
  public accessibility: number;
  public date: Date;
  public creator: any;
  public likes: number;
  public dislikes: number;
  public lists: [];

  constructor(id: number, title: string, accessability: number, date: Date) {
    this._id = id;
    this.name = title;
    this.accessibility = accessability;
    this.date = date;
  }
}
