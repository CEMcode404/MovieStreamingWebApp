import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingsMenuComponent } from './settings-menu.component';

describe('SettingsMenuComponent', () => {
  let component: SettingsMenuComponent;
  let fixture: ComponentFixture<SettingsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onClose handler should emit close event', () => {
    spyOn(component.close, 'emit');
    component.onClose();

    expect(component.close.emit).toHaveBeenCalled();
  });

  it('onGoBack handler should emit goBack event', () => {
    spyOn(component.goBack, 'emit');
    component.onGoBack();

    expect(component.goBack.emit).toHaveBeenCalled();
  });
});
