import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FrameSizes } from './frame-sizes';

describe('FrameSizes', () => {
  let component: FrameSizes;
  let fixture: ComponentFixture<FrameSizes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FrameSizes],
    }).compileComponents();

    fixture = TestBed.createComponent(FrameSizes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
