import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const searchTitlesGuard: CanActivateFn = (route, state) => {
  const movieTitle = route.queryParams['searchTitle']?.trim();

  if (movieTitle && movieTitle.length > 0) return true;
  return inject(Router).createUrlTree(['']);
};
