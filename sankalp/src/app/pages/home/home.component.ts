import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppHeaderComponent } from '../../widgets/app-header/app-header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AppHeaderComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  selectedCity: string = 'bangalore';
  selectedPriest: string = 'tamil';
  
  // Background image path
  backgroundImage = '/assets/main.png';

  viewAllServices(): void {
    // Navigate to services page
    console.log('View all services clicked');
    // You can add router navigation here
  }
}
