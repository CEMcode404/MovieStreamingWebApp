import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { HeroComponent } from './hero/hero.component';
import { MovieCardComponent } from '../../shared/movie-card/movie-card.component';
import {
  FilterChangeEvent,
  MovieFilterComponent,
} from './movie-filter/movie-filter.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import {
  PageNo,
  PaginationComponent,
} from '../../shared/pagination/pagination.component';
import { MoviesService, Movie } from '../../services/movies/movies.service';
import { LogService } from '../../services/log/log.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavBarComponent,
    HeroComponent,
    MovieCardComponent,
    CommonModule,
    MovieFilterComponent,
    FooterComponent,
    PaginationComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  currentPage: number = 1;
  movies: Movie[] = [];
  currentActiveFilters: string[] = [];
  totalPages: number = 0;
  maxMoviesPerPage = 12;

  constructor(private movieService: MoviesService) {}

  async onFilterChange(event: FilterChangeEvent) {
    try {
      this.totalPages = Math.ceil(
        (await this.movieService.getMoviesCountWithFilter(
          event.activeFilters
        )) / this.maxMoviesPerPage
      );
      this.movies = await this.movieService.getMoviesWithFilter(
        event.activeFilters,
        { limit: this.maxMoviesPerPage }
      );

      this.currentActiveFilters = event.activeFilters;
      this.currentPage = 1;
    } catch (error) {
      LogService.error(error);
    }
  }

  async onPageChange(pageNumber: PageNo) {
    try {
      this.movies = await this.movieService.getMoviesWithFilter(
        this.currentActiveFilters,
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
}
