import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';

export interface Movie {
  title: string;
  imgSrc: string;
}

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private readonly dataURL = 'assets/mock-data/movies.json';
  constructor(private http: HttpClient) {}

  getMovies(cb: (movie: Movie[]) => void): void {
    this.http.get<Movie[]>(this.dataURL).pipe(take(1)).subscribe(cb);
  }
}
