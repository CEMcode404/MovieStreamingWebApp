import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import {
  PageNo,
  PaginationComponent,
} from '../../shared/pagination/pagination.component';
import { MovieCardComponent } from '../../shared/movie-card/movie-card.component';
import { Movie, MoviesService } from '../../services/movies/movies.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { LogService } from '../../services/log/log.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'search-titles',
  standalone: true,
  imports: [
    CommonModule,
    NavBarComponent,
    FooterComponent,
    PaginationComponent,
    MovieCardComponent,
  ],
  templateUrl: './search-titles.component.html',
  styleUrl: './search-titles.component.scss',
})
export class SearchTitlesComponent implements OnInit, OnDestroy {
  movieData: Movie[] = [];
  searchTitle?: string;
  currentPage: number = 1;
  totalPages: number = 0;
  maxMoviesPerPage = 20;
  private queryParamsSubscription!: Subscription;

  constructor(
    private _router: ActivatedRoute,
    private movieService: MoviesService
  ) {}

  ngOnInit(): void {
    this.queryParamsSubscription = this._router.queryParams.subscribe(
      async (params) => {
        await this.onQueryParamsChange(params);
      }
    );
  }

  async onQueryParamsChange(params: Params) {
    const queryTitle = params['searchTitle']?.trim();
    if (queryTitle) {
      this.searchTitle = queryTitle;
      this.currentPage = 1;

      try {
        this.totalPages = Math.ceil(
          (await this.movieService.getMoviesCountWithTitle(
            this.searchTitle as string
          )) / this.maxMoviesPerPage
        );

        this.movieData = await this.movieService.getMoviesWithTitle(
          this.searchTitle as string,
          { limit: this.maxMoviesPerPage }
        );
      } catch (error) {
        LogService.error(error);
      }
    }
  }

  async onPageChange(pageNumber: PageNo) {
    try {
      this.movieData = await this.movieService.getMoviesWithTitle(
        this.searchTitle as string,
        {
          limit: this.maxMoviesPerPage,
          offset: pageNumber - 1,
        }
      );

      this.currentPage = pageNumber;
    } catch (error) {
      LogService.error(error);
    }
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
  }
}
