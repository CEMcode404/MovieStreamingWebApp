import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, throwError } from 'rxjs';

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

  async getHeroes(): Promise<Hero[]> {
    return await firstValueFrom(
      this.http
        .get<Hero[]>(this.dataURL)
        .pipe(
          catchError(() => throwError(() => new Error('Failed to get heroes.')))
        )
    );
  }
}
