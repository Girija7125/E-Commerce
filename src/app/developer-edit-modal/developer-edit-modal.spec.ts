import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeveloperEditModal } from './developer-edit-modal';

describe('DeveloperEditModal', () => {
  let component: DeveloperEditModal;
  let fixture: ComponentFixture<DeveloperEditModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeveloperEditModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeveloperEditModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
