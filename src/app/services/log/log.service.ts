import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  constructor() {}

  static error<T>(err?: T | any) {
    if (err === undefined || err === null) console.log('An error occured!');
    else console.log(err);
  }
}
