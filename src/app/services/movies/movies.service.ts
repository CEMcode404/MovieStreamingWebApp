import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, firstValueFrom, catchError, throwError } from 'rxjs';

export interface Movie {
  title: string;
  imgSrc: string;
  filters: string[];
}

interface MatchMovie extends Partial<Omit<Movie, 'imgSrc'>> {}
interface Options {
  limit?: number;
  offset?: number;
}

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  private readonly dataURL = 'assets/mock-data/movies.json';
  constructor(private http: HttpClient) {}

  async getMoviesWithTitle(movieTitle: string): Promise<Movie[]>;
  async getMoviesWithTitle(
    movieTitle: string,
    options: Options
  ): Promise<Movie[]>;
  async getMoviesWithTitle(
    movieTitle: string,
    options?: Options
  ): Promise<Movie[]> {
    if (typeof movieTitle === 'string' && typeof options === 'undefined')
      return await this.getMovies({ title: movieTitle });
    else if (typeof movieTitle === 'string' && typeof options === 'object')
      return await this.getMovies({ title: movieTitle }, options);
    else throw Error('Invalid argument/s');
  }

  async getMoviesCountWithTitle(movieTitle: string): Promise<number> {
    return (await this.getMoviesWithTitle(movieTitle, { limit: Infinity }))
      .length;
  }

  async getMoviesWithFilter(filters: string[]): Promise<Movie[]>;
  async getMoviesWithFilter(
    filters: string[],
    options: Options
  ): Promise<Movie[]>;
  async getMoviesWithFilter(filters: string[], options?: Options) {
    if (Array.isArray(filters) && typeof options === 'object')
      return await this.getMovies({ filters }, options);
    else if (Array.isArray(filters) && typeof options === 'undefined')
      return await this.getMovies({ filters });
    else throw Error('Invalid argument');
  }

  async getMoviesCountWithFilter(filters: string[]): Promise<number> {
    return (await this.getMoviesWithFilter(filters, { limit: Infinity }))
      .length;
  }

  async getMovies(): Promise<Movie[]>;
  async getMovies(matchOrOptions: MatchMovie): Promise<Movie[]>;
  async getMovies(matchOrOptions: Options): Promise<Movie[]>;
  async getMovies(
    matchOrOptions: MatchMovie,
    options: Options
  ): Promise<Movie[]>;
  async getMovies(
    matchOrOptions?: MatchMovie | Options,
    options?: Options
  ): Promise<Movie[]> {
    let match: MatchMovie = { title: '', filters: [] };
    let processedOptions: Options = { limit: 10, offset: 0 };

    if (typeof matchOrOptions === 'object' && typeof options === 'undefined') {
      if (
        Object.keys(matchOrOptions).some((key) => key in match) ||
        Object.keys(matchOrOptions).length === 0
      ) {
        // First argument is MatchMovie
        match = { ...match, ...(matchOrOptions as MatchMovie) };
      } else if (
        Object.keys(matchOrOptions).some((key) => key in processedOptions)
      ) {
        // First argument is Options
        processedOptions = {
          ...processedOptions,
          ...(matchOrOptions as Options),
        };
      }
    } else if (
      typeof options === 'object' &&
      typeof processedOptions === 'object'
    ) {
      match = { ...match, ...(matchOrOptions as MatchMovie) };
      processedOptions = { ...processedOptions, ...(options as Options) };
    }

    return await firstValueFrom(
      this.http.get<Movie[]>(this.dataURL).pipe(
        map((movies) => {
          const limit =
            Math.abs(processedOptions.limit as number) +
            Math.abs(processedOptions.offset as number);

          return this.filterMoviesBy(match, movies).slice(
            Math.abs(processedOptions.offset as number),
            limit
          );
        }),
        catchError((err) => {
          return throwError(() => new Error('Failed to get movies', err));
        })
      )
    );
  }

  private filterMoviesBy(matchObject: MatchMovie, movies: Movie[]): Movie[] {
    return movies.filter((movie) => {
      for (const key of Object.keys(matchObject)) {
        const movieFieldValue = (movie as any)[key];
        const matchObjectFieldValue = (matchObject as any)[key];

        if (key === 'filters') {
          for (const filterName of matchObjectFieldValue) {
            if (
              !this.lowercaseAndTrim(movieFieldValue).includes(
                this.lowercaseAndTrim(filterName)
              )
            )
              return false;
          }
        } else if (
          typeof matchObjectFieldValue === 'string' &&
          !this.lowercaseAndTrim(movieFieldValue).includes(
            this.lowercaseAndTrim(matchObjectFieldValue)
          )
        )
          return false;
      }
      return true;
    });
  }

  private lowercaseAndTrim(input: string): string;
  private lowercaseAndTrim(input: string[]): string[];
  private lowercaseAndTrim(input: string | string[]): string | string[] {
    if (typeof input === 'string') return input.trim().toLowerCase();
    else if (Array.isArray(input))
      return input.map((str) => this.lowercaseAndTrim(str));
    else throw Error('input must be string or string array');
  }
}
