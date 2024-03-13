import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SearchTitlesComponent } from './pages/search-titles/search-titles.component';
import { searchTitlesGuard } from './pages/search-titles/guard/search-titles.guard';

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
];
