import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavBarComponent } from '../../shared/nav-bar/nav-bar.component';
import { HeroComponent } from './hero/hero.component';
import { MovieCardComponent } from '../../shared/movie-card/movie-card.component';
import { MovieFilterComponent } from './movie-filter/movie-filter.component';
import movies from '../../../assets/mock-data/movies.json';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavBarComponent,
    HeroComponent,
    MovieCardComponent,
    CommonModule,
    MovieFilterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  movies = movies;
}
