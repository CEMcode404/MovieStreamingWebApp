import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, firstValueFrom, catchError, throwError } from 'rxjs';

type MovieQuality = 'HD' | 'SD' | 'FULL HD' | '2K' | 'UHD' | '8K';
export interface VideoSrc {
  quality: string;
  type: string;
  src: string;
}

export interface Movie {
  actor: string[];
  country: string[];
  director: string[];
  description: string;
  durationInMinutes: number;
  filters: string[];
  genre: string[];
  isan: string;
  imdb: string;
  imgSrc: string;
  release: number;
  title: string;
  quality: MovieQuality;
  videoSrc: VideoSrc[];
}

interface MatchMovie extends Partial<Omit<Movie, 'imgSrc' | 'videoSrc'>> {}
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

  async getMovieWithId(id: string): Promise<Movie | null> {
    const isIdDefined = id.trim();

    if (isIdDefined) {
      const movie = (
        await this.getMovies({ isan: isIdDefined }, { limit: 1 })
      )[0];

      return movie ? movie : null;
    }
    return null;
  }

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
      const matcher = new MatchingContext(new StringMatchingStrategy());

      for (const key of Object.keys(matchObject)) {
        const movieFieldValue = (movie as any)[key];
        const matchObjectFieldValue = (matchObject as any)[key];

        if (key === 'isan') {
          matcher.setStrategy(new StrictStringMatchingStrategy());

          if (!matcher.isMatch(movieFieldValue, matchObjectFieldValue))
            return false;
        } else if (typeof matchObjectFieldValue === 'number') {
          matcher.setStrategy(new NumberMatchingStrategy());

          if (!matcher.isMatch(movieFieldValue, matchObjectFieldValue))
            return false;
        } else if (typeof matchObjectFieldValue === 'string') {
          matcher.setStrategy(new StringMatchingStrategy());

          if (!matcher.isMatch(movieFieldValue, matchObjectFieldValue))
            return false;
        } else {
          matcher.setStrategy(new StringArrayMatchingStrategy());

          if (!matcher.isMatch(movieFieldValue, matchObjectFieldValue))
            return false;
        }
      }
      return true;
    });
  }
}

class MatchingContext {
  private strategy: MatchingStrategy;

  constructor(strategy: MatchingStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: MatchingStrategy) {
    this.strategy = strategy;
  }

  isMatch(source: any, toBeMatch: any): boolean {
    return this.strategy.isMatch(source, toBeMatch);
  }
}

interface MatchingStrategy {
  isMatch(source: any, toBeMatch: any): boolean;
}

class StrictStringMatchingStrategy implements MatchingStrategy {
  isMatch(source: string, toBeMatch: string): boolean {
    if (typeof source === 'string' && typeof toBeMatch === 'string')
      return source === toBeMatch;
    else throw Error('Arguments must be strings');
  }
}

class NumberMatchingStrategy implements MatchingStrategy {
  isMatch(source: number, toBeMatch: number): boolean {
    if (typeof source === 'number' && typeof toBeMatch === 'number')
      return source === toBeMatch;
    else throw Error('Arugments must be numbers');
  }
}

class StringMatchingStrategy implements MatchingStrategy {
  isMatch(source: string, toBeMatch: string): boolean {
    if (typeof source === 'string' && typeof toBeMatch === 'string')
      return source
        .trim()
        .toLocaleLowerCase()
        .includes(toBeMatch.trim().toLocaleLowerCase());
    else throw Error('Arguments must be strings');
  }
}

class StringArrayMatchingStrategy implements MatchingStrategy {
  isMatch(source: string[], toBeMatch: string): boolean {
    if (Array.isArray(source) && Array.isArray(toBeMatch)) {
      const newSource = this.lowercaseAndTrim(source);

      for (const match of toBeMatch) {
        if (!newSource.includes(this.lowercaseAndTrim(match))) return false;
      }
      return true;
    } else throw Error('Argument must be string array');
  }

  private lowercaseAndTrim(input: string): string;
  private lowercaseAndTrim(input: string[]): string[];
  private lowercaseAndTrim(input: string | string[]): string | string[] {
    if (typeof input === 'string') return input.trim().toLowerCase();
    else if (Array.isArray(input))
      return input.map((str) => this.lowercaseAndTrim(str));
    else throw Error('Argument must be string or string array');
  }
}
