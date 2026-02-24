import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AppHeaderComponent } from '../../widgets/app-header/app-header.component';
import { ApiService, Service, ServiceType } from '../../services/api.service';

@Component({
  selector: 'app-service-details',
  standalone: true,
  imports: [CommonModule, RouterModule, AppHeaderComponent],
  templateUrl: './service-details.component.html',
  styleUrl: './service-details.component.scss'
})
export class ServiceDetailsComponent implements OnInit {
  serviceId: string | null = null;
  loading: boolean = false;
  errorMessage: string = '';
  serviceTypeMap: Map<number, string> = new Map();
  
  service: any = {
    id: 0,
    name: '',
    category: '',
    image: 'assets/poojaservices.jpg',
    price: 'Price on request',
    duration: '2-3 hours',
    location: 'Bangalore',
    priest: 'Tamil Priest',
    rating: null,
    reviews: 0,
    popular: false,
    description: '',
    description1: '',
    key_insights_descr: '',
    benefits: [],
    included: [
      'Experienced Vedic priest',
      'All pooja materials and samagri',
      'Sacred mantras and rituals',
      'Prasadam distribution',
      'Ceremonial guidance'
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.serviceId = this.route.snapshot.paramMap.get('id');
      if (this.serviceId) {
        this.loadServiceTypes();
        this.loadServiceDetails(parseInt(this.serviceId));
      }
    }
  }

  loadServiceTypes() {
    this.apiService.getServiceTypes(0, 100).subscribe({
      next: (serviceTypes: ServiceType[]) => {
        serviceTypes.forEach(st => {
          this.serviceTypeMap.set(st.id, st.name);
        });
      },
      error: (error) => {
        // Silently fail - we can still show service without category name
      }
    });
  }

  loadServiceDetails(serviceId: number) {
    this.loading = true;
    this.errorMessage = '';
    
    this.apiService.getServiceById(serviceId).subscribe({
      next: (apiService: Service) => {
        // Map API response to component format
        // Parse key_insights_descr into benefits array
        const benefits = this.parseKeyInsights(apiService.key_insights_descr);
        
        this.service = {
          id: apiService.id,
          name: apiService.name,
          category: this.serviceTypeMap.get(apiService.service_type_id) || 'Service',
          image: this.getServiceImage(apiService),
          price: this.formatPrice(apiService.min_price, apiService.max_price),
          duration: '2-3 hours', // Default or could come from API
          location: 'Bangalore', // Default or could come from API
          priest: 'Tamil Priest', // Default or could come from API
          rating: apiService.rating,
          reviews: 0, // Could come from API if available
          popular: apiService.rating !== null && apiService.rating >= 4.0,
          description: apiService.description1 || '',
          description1: apiService.description1 || '',
          key_insights_descr: apiService.key_insights_descr || '',
          descr3: apiService.descr3 || '',
          benefits: benefits,
          included: [
            'Experienced Vedic priest',
            'All pooja materials and samagri',
            'Sacred mantras and rituals',
            'Prasadam distribution',
            'Ceremonial guidance'
          ]
        };
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error.message || 'Failed to load service details';
        console.error('Error loading service:', error);
      }
    });
  }

  private getServiceImage(service: Service): string {
    // Default images based on service type or use a generic one
    const defaultImages: { [key: number]: string } = {
      1: 'assets/homalu.jpg', // Homa
      4: 'assets/poojaservices.jpg', // Poojas
    };
    return defaultImages[service.service_type_id] || 'assets/poojaservices.jpg';
  }

  private formatPrice(minPrice: number | null, maxPrice: number | null): string {
    if (minPrice !== null && maxPrice !== null) {
      if (minPrice === maxPrice) {
        return `₹${minPrice.toLocaleString('en-IN')}`;
      }
      return `₹${minPrice.toLocaleString('en-IN')} - ₹${maxPrice.toLocaleString('en-IN')}`;
    } else if (minPrice !== null) {
      return `₹${minPrice.toLocaleString('en-IN')}+`;
    } else if (maxPrice !== null) {
      return `Up to ₹${maxPrice.toLocaleString('en-IN')}`;
    }
    return 'Price on request';
  }

  private parseKeyInsights(keyInsights: string | null): string[] {
    if (!keyInsights) {
      // Return default benefits if no key insights available
      return [
        'Blesses with wisdom and knowledge',
        'Marks an auspicious beginning',
        'Invokes divine blessings',
        'Creates positive spiritual energy',
        'Establishes a strong foundation'
      ];
    }

    // Try to split by common delimiters (newlines, periods, semicolons, etc.)
    // Remove empty strings and trim whitespace
    const benefits = keyInsights
      .split(/[.\n;•]/)
      .map(item => item.trim())
      .filter(item => item.length > 0 && item.length < 100); // Filter out very long items

    // If we got benefits from splitting, return them
    if (benefits.length > 0) {
      return benefits;
    }

    // If it's a single sentence, return it as a single benefit
    return [keyInsights.trim()];
  }

  goBackToServices(): void {
    this.router.navigate(['/services']);
  }

  bookNow(): void {
    this.router.navigate(['/package-selection'], { 
      queryParams: { serviceId: this.service.id } 
    });
  }
}
