import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const moviesGuard: CanActivateFn = (route, state) => {
  const id = route.queryParams['id']?.trim();

  if (id && id.length > 0) return true;
  return inject(Router).createUrlTree(['']);
};
