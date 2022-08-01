import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroMemberComponent } from './hero-member.component';

describe('HeroMemberComponent', () => {
  let component: HeroMemberComponent;
  let fixture: ComponentFixture<HeroMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeroMemberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeroMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
