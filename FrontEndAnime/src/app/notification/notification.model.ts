export class Notificaion {
  public type: string;
  public content: any;
  public title: string;
  public seen: boolean;
  public scheduldeDate: Date;
  public user: number;
  public userRole: number;
  public _id: number;
  public message: string;

  constructor(
    type: string,
    content: any,
    title: string,
    seen: boolean,
    user: number,
    userRole: number,
    id: number
  ) {
    this.seen = seen;
    this.title = title;
    this.content = content;
    this.type = type;
    this.user = user;
    this.userRole = userRole;
    this._id = id;
  }
}
