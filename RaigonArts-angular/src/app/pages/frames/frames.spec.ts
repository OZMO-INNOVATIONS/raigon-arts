import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Frames } from './frames';

describe('Frames', () => {
  let component: Frames;
  let fixture: ComponentFixture<Frames>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Frames],
    }).compileComponents();

    fixture = TestBed.createComponent(Frames);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
