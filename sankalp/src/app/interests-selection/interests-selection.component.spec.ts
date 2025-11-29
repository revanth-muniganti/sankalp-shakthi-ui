import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestsSelectionComponent } from './interests-selection.component';

describe('InterestsSelectionComponent', () => {
  let component: InterestsSelectionComponent;
  let fixture: ComponentFixture<InterestsSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestsSelectionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InterestsSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
