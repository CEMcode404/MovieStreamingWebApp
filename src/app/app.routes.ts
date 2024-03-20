import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SearchTitlesComponent } from './pages/search-titles/search-titles.component';
import { searchTitlesGuard } from './pages/search-titles/guard/search-titles.guard';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { MoviesComponent } from './pages/movies/movies.component';
import { moviesGuard } from './pages/movies/guard/movies.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'search-titles',
    component: SearchTitlesComponent,
    canActivate: [searchTitlesGuard],
  },
  {
    path: 'movies',
    component: MoviesComponent,
    canActivate: [moviesGuard],
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
