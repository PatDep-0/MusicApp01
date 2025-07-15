import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JamendoPage } from './jamendo.page';

describe('JamendoPage', () => {
  let component: JamendoPage;
  let fixture: ComponentFixture<JamendoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JamendoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
