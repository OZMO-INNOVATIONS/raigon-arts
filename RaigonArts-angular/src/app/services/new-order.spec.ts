import { TestBed } from '@angular/core/testing';
import { NewOrder } from './new-order';

describe('NewOrder', () => {
  let service: NewOrder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NewOrder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
