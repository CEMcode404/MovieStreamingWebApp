import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FiltersService {
  private readonly dataURL = 'assets/mock-data/movieGenres.json';
  constructor(private http: HttpClient) {}

  getFilters(cb: (filters: string[]) => void): void {
    this.http.get<string[]>(this.dataURL).pipe(take(1)).subscribe(cb);
  }

  getDefaultActiveFilters(): string[] {
    return ['Popular'];
  }

  getInviewFilters(): string[] {
    return ['Popular', 'Television Series', 'Movie', 'New Release'];
  }
}
