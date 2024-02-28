import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { HeroComponent } from './hero/hero.component';
import { MovieCardComponent } from '../../shared/movie-card/movie-card.component';
import { MovieFilterComponent } from './movie-filter/movie-filter.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import movies from '../../../assets/mock-data/movies.json';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

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
  movies = movies;
}
