import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoCollection } from './photo-collection';

describe('PhotoCollection', () => {
  let component: PhotoCollection;
  let fixture: ComponentFixture<PhotoCollection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoCollection],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoCollection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
