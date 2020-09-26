export class User {
  public _id: number;
  public name: string;
  public email: string;
  public password: string;
  public password2: string;
  public role: string;
  public isVerified: boolean;
  public blockedDueDate: Date;

  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    role: string,
    isVerified: boolean
  ) {
    this._id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.isVerified = isVerified;
    this.password2 = this.password;
    this.blockedDueDate = null;
  }
}
