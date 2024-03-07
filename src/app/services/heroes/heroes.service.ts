import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';

export interface Hero {
  src: string;
  redirectLink?: string;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class HeroesService {
  private readonly dataURL = 'assets/mock-data/heroes.json';
  constructor(private http: HttpClient) {}

  getHeroes(cb: (hero: Hero[]) => void): void {
    this.http.get<Hero[]>(this.dataURL).pipe(take(1)).subscribe(cb);
  }
}
