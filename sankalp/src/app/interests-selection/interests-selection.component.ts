import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Interest {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

@Component({
  selector: 'app-interests-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interests-selection.component.html',
  styleUrl: './interests-selection.component.scss'
})
export class InterestsSelectionComponent {
  @Output() interestsSelected = new EventEmitter<string[]>();
  @Output() close = new EventEmitter<void>();

  constructor(private router: Router) {}

  maxSelections = 5;
  selectedCount = 0;

  interests: Interest[] = [
    { id: 'seller', name: 'Seller', icon: 'bi-shop', selected: false },
    { id: 'buyer', name: 'Buyer', icon: 'bi-cart', selected: false },
    { id: 'pooja', name: 'Pooja Doing Person', icon: 'bi-candles', selected: false },
    { id: 'priest', name: 'Priest', icon: 'bi-person-badge', selected: false },
    { id: 'astrologer', name: 'Astrologer', icon: 'bi-stars', selected: false },
    { id: 'teacher', name: 'Teacher', icon: 'bi-book', selected: false },
    { id: 'student', name: 'Student', icon: 'bi-mortarboard', selected: false },
    { id: 'business', name: 'Business', icon: 'bi-briefcase', selected: false },
    { id: 'service', name: 'Service Provider', icon: 'bi-tools', selected: false },
    { id: 'consultant', name: 'Consultant', icon: 'bi-person-check', selected: false },
    { id: 'wellness', name: 'Wellness & Health', icon: 'bi-heart', selected: false },
    { id: 'spiritual', name: 'Spiritual Guide', icon: 'bi-circle', selected: false }
  ];

  toggleInterest(interest: Interest) {
    if (interest.selected) {
      interest.selected = false;
      this.selectedCount--;
    } else {
      if (this.selectedCount < this.maxSelections) {
        interest.selected = true;
        this.selectedCount++;
      }
    }
  }

  canSelectMore(): boolean {
    return this.selectedCount < this.maxSelections;
  }

  onSubmit() {
    const selectedInterests = this.interests
      .filter(interest => interest.selected)
      .map(interest => interest.id);
    
    // Emit the selected interests to parent component
    this.interestsSelected.emit(selectedInterests);
    
    // Navigate to home page
    this.router.navigate(['/home']);
  }

  onClose() {
    this.close.emit();
  }
}
