import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AppHeaderComponent } from '../../widgets/app-header/app-header.component';
import { AppFooterComponent } from '../../widgets/app-footer/app-footer.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AppHeaderComponent, AppFooterComponent],
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss'
})
export class PaymentComponent implements OnInit {
  selectedPaymentMethod: string = 'upi';
  upiId: string = '';

  service = {
    id: 1,
    name: 'Aksharabhyasam',
    category: 'Traditional Vedic Ceremony',
    date: 'Monday, 26 January 2026 at 05:00 PM',
    location: 'Bangalore',
    customerName: 'Monthly Recurring Fee',
    serviceFee: 3500,
    platformFee: 99,
    gst: 0,
    total: 3500
  };

  popularUpiHandles = ['@ybl', '@paytm', '@okicici', '@okhdfcbank'];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get booking data from query params or service
    const serviceId = this.route.snapshot.queryParams['serviceId'];
    // Load service details based on ID
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
  }

  selectUpiHandle(handle: string): void {
    this.upiId = handle;
  }

  goBack(): void {
    this.router.navigate(['/booking']);
  }

  processPayment(): void {
    // Handle payment processing
    console.log('Processing payment...', {
      method: this.selectedPaymentMethod,
      upiId: this.upiId,
      amount: this.service.total
    });
  }
}
