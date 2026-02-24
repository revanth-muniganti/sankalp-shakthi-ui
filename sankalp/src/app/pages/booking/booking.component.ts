import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AppHeaderComponent } from '../../widgets/app-header/app-header.component';
import { AppFooterComponent } from '../../widgets/app-footer/app-footer.component';
import { ApiService, BookingRequest, BookingResponse } from '../../services/api.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AppHeaderComponent, AppFooterComponent],
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.scss'
})
export class BookingComponent implements OnInit {
  currentStep: number = 1; // Start with date & time selection
  totalSteps: number = 3;

  // Service data
  service: any = {
    id: 0,
    name: '',
    category: '',
    image: 'assets/poojaservices.jpg',
    price: 0,
    location: 'Hyderabad',
    priest: 'Telugu'
  };

  loading: boolean = false;
  submitting: boolean = false;
  errorMessage: string = '';
  bookingSuccess: boolean = false;
  bookingId: number | null = null;
  showSuccessModal: boolean = false;

  // Booking data
  bookingData = {
    selectedDate: null as Date | null,
    selectedTime: '',
    fullName: '',
    phoneNumber: '+91 98765 43210',
    email: '',
    address: '',
    specialInstructions: '',
    paymentMethod: 'upi'
  };

  // Available time slots
  timeSlots = [
    '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM',
    '11:00 AM', '12:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  // Calendar data
  currentMonth: Date = new Date();
  selectedDate: Date | null = null;
  calendarDays: (Date | null)[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeCalendar();
      this.loadServiceData();
    }
  }

  loadServiceData(): void {
    // Get service ID and package data from query params (from package-selection page)
    const serviceId = this.route.snapshot.queryParams['serviceId'];
    const packagePrice = this.route.snapshot.queryParams['packagePrice'];
    
    if (serviceId) {
      this.service.id = parseInt(serviceId);
      this.loading = true;
      
      // Load full service details
      this.apiService.getServiceById(parseInt(serviceId)).subscribe({
        next: (apiService) => {
          this.service = {
            id: apiService.id,
            name: apiService.name,
            category: 'Service', // Could fetch service type name
            image: 'assets/poojaservices.jpg',
            price: packagePrice ? parseFloat(packagePrice) : (apiService.min_price || 0),
            location: 'Hyderabad',
            priest: 'Telugu'
          };
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading service:', error);
          this.loading = false;
          // Keep default service data with the ID
          if (packagePrice) {
            this.service.price = parseFloat(packagePrice);
          }
        }
      });
    } else {
      // If no service ID, show error or redirect
      this.errorMessage = 'No service selected. Please select a service first.';
    }
  }

  initializeCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    this.calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.calendarDays.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      this.calendarDays.push(new Date(year, month, day));
    }
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.initializeCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.initializeCalendar();
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
    this.bookingData.selectedDate = date;
  }

  isSelectedDate(date: Date | null): boolean {
    if (!date || !this.selectedDate) return false;
    return date.getTime() === this.selectedDate.getTime();
  }

  selectTime(time: string): void {
    this.bookingData.selectedTime = time;
  }

  // Datepicker methods
  getDateInputValue(): string {
    if (!this.selectedDate) return '';
    const year = this.selectedDate.getFullYear();
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getMinDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const selectedDate = new Date(input.value);
      this.selectDate(selectedDate);
    }
  }

  onTimeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      // Store time in 24-hour format (HH:MM) for API conversion
      const time24 = input.value;
      // Convert to 12-hour format for display
      const [hours, minutes] = time24.split(':');
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 % 12 || 12;
      const ampm = hour24 >= 12 ? 'PM' : 'AM';
      // Store display format
      this.bookingData.selectedTime = `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;
      // Store raw 24-hour format for API conversion
      (this.bookingData as any).selectedTime24 = time24;
    }
  }

  getTimeInputValue(): string {
    // Return 24-hour format for time input
    if ((this.bookingData as any).selectedTime24) {
      return (this.bookingData as any).selectedTime24;
    }
    // If we have 12-hour format, convert it back
    if (this.bookingData.selectedTime) {
      return this.convert12To24Hour(this.bookingData.selectedTime);
    }
    return '';
  }

  private convert12To24Hour(time12: string): string {
    // Convert "HH:MM AM/PM" to "HH:MM"
    const match = time12.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return '';
    
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = match[3].toUpperCase();
    
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${String(hours).padStart(2, '0')}:${minutes}`;
  }

  getMonthYearString(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  getDayName(day: number): string {
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    return days[day];
  }

  getSelectedDateString(): string {
    if (!this.selectedDate) return '';
    return this.selectedDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  }

  getShortDateString(): string {
    if (!this.selectedDate) return '';
    return this.selectedDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep || step === this.currentStep + 1) {
      this.currentStep = step;
    }
  }

  goBackToServices(): void {
    this.router.navigate(['/services']);
  }

  proceedToPayment(): void {
    // Validate required fields
    if (!this.service.id || !this.selectedDate || !this.bookingData.selectedTime || !this.bookingData.address) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    // Convert date and time to ISO format
    const scheduledTime = this.convertToISODateTime(this.selectedDate, this.bookingData.selectedTime);
    
    // Create booking request
    // Note: Backend requires payment_status to be "success"
    // In a real flow, payment should be processed first, then booking created
    // For now, we set it to "success" as the user will proceed to payment
    const bookingRequest: BookingRequest = {
      service_id: this.service.id,
      payment_status: 'success', // Backend requires "success" status
      scheduled_time: scheduledTime,
      address: this.bookingData.address
    };

    this.submitting = true;
    this.errorMessage = '';

    this.apiService.createBooking(bookingRequest).subscribe({
      next: (response: BookingResponse) => {
        this.submitting = false;
        this.bookingSuccess = true;
        this.bookingId = response.id;
        
        // Show success modal
        this.showSuccessModal = true;
      },
      error: (error: Error) => {
        this.submitting = false;
        this.errorMessage = error.message || 'Failed to create booking. Please try again.';
      }
    });
  }

  private convertToISODateTime(date: Date, time: string): string {
    let hours: number;
    let minutes: number;

    // Check if we have 24-hour format stored
    if ((this.bookingData as any).selectedTime24) {
      const [h, m] = (this.bookingData as any).selectedTime24.split(':');
      hours = parseInt(h, 10);
      minutes = parseInt(m, 10);
    } else {
      // Parse 12-hour format (HH:MM AM/PM)
      const timeMatch = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) {
        throw new Error('Invalid time format');
      }

      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();

      // Convert to 24-hour format
      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
    }

    // Create new date with the selected date and time
    const scheduledDate = new Date(date);
    scheduledDate.setHours(hours, minutes, 0, 0);

    // Return ISO 8601 format
    return scheduledDate.toISOString();
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    // Navigate to payment page after closing modal
    if (this.bookingId) {
      this.router.navigate(['/payment'], { 
        queryParams: { 
          bookingId: this.bookingId,
          serviceId: this.service.id,
          amount: this.service.price
        }
      });
    }
  }
}
