import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpyLocation } from '@angular/common/testing';
import { Location } from '@angular/common';
import { NotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundComponent],
      providers: [{ provide: Location, useClass: SpyLocation }],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate back when gotoPreviousPage is caled', () => {
    const location = fixture.debugElement.injector.get(Location);
    const spy = spyOn(location, 'back');
    component.gotoPreviousPage();

    expect(spy).toHaveBeenCalled();
  });
});
