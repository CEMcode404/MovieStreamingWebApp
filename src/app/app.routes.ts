import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SearchTitlesComponent } from './pages/search-titles/search-titles.component';
import { searchTitlesGuard } from './pages/search-titles/guard/search-titles.guard';
import { NotFoundComponent } from './pages/not-found/not-found.component';

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
    path: '**',
    component: NotFoundComponent,
  },
];
