import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  Router,
} from '@angular/router';

import { moviesGuard } from './movies.guard';

type MockActivatedRouteSnapshot = Partial<ActivatedRouteSnapshot>;
describe('moviesGuard', () => {
  let state: RouterStateSnapshot;
  let router: Router;
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => moviesGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});

    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should return true and not call createUrlTree if query string is not empty', () => {
    let route: MockActivatedRouteSnapshot = {
      queryParams: { id: 'yeah' },
    };
    const creatUrlTree = spyOn(router, 'createUrlTree');

    const result = executeGuard(route as ActivatedRouteSnapshot, state);

    expect(creatUrlTree).not.toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('should return create URLTree if query string is empty', () => {
    let route: MockActivatedRouteSnapshot = {
      queryParams: { id: '' },
    };
    const creatUrlTree = spyOn(router, 'createUrlTree');

    executeGuard(route as ActivatedRouteSnapshot, state);

    expect(creatUrlTree).toHaveBeenCalled();
  });
});
