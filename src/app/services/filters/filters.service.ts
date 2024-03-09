import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FiltersService {
  private readonly dataURL = 'assets/mock-data/movieGenres.json';
  constructor(private http: HttpClient) {}

  async getFilters(): Promise<string[]> {
    return await firstValueFrom(
      this.http
        .get<string[]>(this.dataURL)
        .pipe(
          catchError(() =>
            throwError(() => new Error('Failed to get filters.'))
          )
        )
    );
  }

  getDefaultActiveFilters(): string[] {
    return ['Popular'];
  }

  getInviewFilters(): string[] {
    return ['Popular', 'Television Series', 'Movie', 'New Release'];
  }
}
