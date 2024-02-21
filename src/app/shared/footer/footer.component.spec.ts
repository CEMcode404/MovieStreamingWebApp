import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterComponent } from './footer.component';
import { By } from '@angular/platform-browser';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call onResize on window resize', () => {
    const onResize = spyOn(component, 'onResize');

    window.dispatchEvent(new Event('resize'));

    expect(onResize).toHaveBeenCalled();
  });

  it('should set height on initialization', () => {
    component.ngAfterViewInit();

    expect(component.height).toBeDefined();
  });

  it('container height should exceed the content height', () => {
    component.ngAfterViewInit();
    fixture.detectChanges();

    const contentHeight = fixture.debugElement.query(By.css('.footer-box'))
      .nativeElement.scrollHeight;

    expect(component.height.replace('px', '')).toBeGreaterThanOrEqual(
      contentHeight
    );
  });
});
