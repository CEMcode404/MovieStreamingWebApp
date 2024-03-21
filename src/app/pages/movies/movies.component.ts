import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import {
  Movie,
  MoviesService,
  VideoSrc,
} from '../../services/movies/movies.service';
import { CommonModule } from '@angular/common';
import { LogService } from '../../services/log/log.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [NavBarComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './movies.component.html',
  styleUrl: './movies.component.scss',
})
export class MoviesComponent implements OnInit {
  movie!: Movie;
  selectedQuality!: VideoSrc;
  private queryParamsSubscription!: Subscription;

  constructor(
    private _movieService: MoviesService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.queryParamsSubscription = this._activatedRoute.queryParams.subscribe(
      async (params) => {
        await this.onQueryParamsChange(params);
      }
    );
  }

  async onQueryParamsChange(params: Params) {
    const movieId = params['id']?.trim();

    if (movieId) {
      try {
        const isMovieNotNull = await this._movieService.getMovieWithId(movieId);

        if (isMovieNotNull) {
          this.movie = isMovieNotNull;
          this.selectedQuality = this.movie.videoSrc[0] as VideoSrc;
        } else {
          this.handleError(
            Error(`Something went wrong. Movie with id: ${movieId} is missing.`)
          );
        }
      } catch (error) {
        this.handleError(Error('Failed to get movies.'));
      }
    } else {
      this.handleError(
        Error(
          '"/movies" path guard is malfunctioning, allowing empty IDs to pass through.'
        )
      );
    }
  }

  private handleError(errorMessage: Error) {
    LogService.error(errorMessage);
    this._router.navigateByUrl('/not-found');
  }
}
