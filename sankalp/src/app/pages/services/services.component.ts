import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppHeaderComponent } from '../../widgets/app-header/app-header.component';
import { ApiService, ServiceType, Service } from '../../services/api.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AppHeaderComponent],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss'
})
export class ServicesComponent implements OnInit {
  selectedCategory: string = 'all';
  sortBy: string = 'popular';
  categories: any[] = [];
  loadingCategories: boolean = false;
  services: any[] = [];
  allServices: any[] = []; // Keep all services for counting
  loadingServices: boolean = false;
  serviceTypeMap: Map<number, string> = new Map(); // Map service_type_id to service type name

  // Icon mapping for service types
  private iconMap: { [key: string]: string } = {
    'homa': 'bi-fire',
    'japas': 'bi-book',
    'parihara': 'bi-shield-check',
    'poojas': 'bi-star',
    'powerful devi homa': 'bi-fire',
    'ancestor rituals': 'bi-calendar',
    'other services': 'bi-grid',
    'astrology': 'bi-stars',
    'temple tours': 'bi-building'
  };

  constructor(
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  selectedCity: string = 'bangalore';
  selectedLanguage: string = 'tamil';

  ngOnInit() {
    // Only load data in browser (not during SSR)
    if (isPlatformBrowser(this.platformId)) {
      // Load all services first (no filter) to get accurate counts
      this.loadServices(null);
      this.loadServiceTypes();
    }
  }

  loadServiceTypes() {
    this.loadingCategories = true;
    this.apiService.getServiceTypes(0, 100).subscribe({
      next: (serviceTypes: ServiceType[]) => {
        if (serviceTypes && serviceTypes.length > 0) {
          // Build service type map for quick lookup
          serviceTypes.forEach(st => {
            this.serviceTypeMap.set(st.id, st.name);
          });

          // Update category counts after services are loaded
          this.updateCategoryCounts(serviceTypes);
        }
        this.loadingCategories = false;
      },
      error: (error: any) => {
        this.loadingCategories = false;
      }
    });
  }

  loadServices(serviceTypeId: number | null = null) {
    this.loadingServices = true;
    
    // Always load ALL services first to get accurate counts
    // Then filter in the getter if needed
    this.apiService.getServices(null, 0, 100).subscribe({
      next: (apiServices: Service[]) => {
        // Map API response to template format
        const mappedServices = apiServices.map(service => ({
          id: service.id,
          name: service.name,
          category: this.serviceTypeMap.get(service.service_type_id) || 'Other',
          image: this.getServiceImage(service),
          price: this.formatPrice(service.min_price, service.max_price),
          popular: service.rating !== null && service.rating >= 4.0,
          service_type_id: service.service_type_id,
          description1: service.description1,
          key_insights_descr: service.key_insights_descr
        }));

        // Store all services for counting
        this.allServices = mappedServices;
        // Set services for display (will be filtered by filteredServices getter)
        this.services = mappedServices;

        // Update category counts if categories are already loaded
        if (this.categories.length > 0) {
          this.updateCategoryCounts();
        }

        this.loadingServices = false;
      },
      error: (error: any) => {
        this.loadingServices = false;
        // Keep empty services array on error
        this.services = [];
        this.allServices = [];
      }
    });
  }

  private updateCategoryCounts(serviceTypes?: ServiceType[]) {
    // Always use allServices for counting, not the filtered services array
    const servicesForCounting = this.allServices.length > 0 ? this.allServices : this.services;
    const allServicesCount = servicesForCounting.length;
    
    if (serviceTypes && serviceTypes.length > 0) {
      // Build categories with counts
      this.categories = [
        { id: 'all', name: 'All Services', icon: 'bi-grid', count: allServicesCount, active: this.selectedCategory === 'all' },
        ...serviceTypes.map((st) => {
          const count = servicesForCounting.filter(s => s.service_type_id === st.id).length;
          return {
            id: st.id.toString(),
            name: st.name,
            icon: this.getIconForServiceType(st.name),
            count: count,
            active: this.selectedCategory === st.id.toString()
          };
        })
      ];
    } else if (this.categories.length > 0) {
      // Just update counts for existing categories
      this.categories.forEach(cat => {
        if (cat.id === 'all') {
          cat.count = allServicesCount;
        } else {
          const serviceTypeId = parseInt(cat.id);
          if (!isNaN(serviceTypeId)) {
            cat.count = servicesForCounting.filter(s => s.service_type_id === serviceTypeId).length;
          }
        }
      });
    }
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

  private getIconForServiceType(name: string): string {
    const key = name.toLowerCase();
    return this.iconMap[key] || 'bi-circle';
  }

  get filteredServices() {
    let filtered = [...this.services];

    // Filter by category
    if (this.selectedCategory !== 'all') {
      const serviceTypeId = parseInt(this.selectedCategory);
      if (!isNaN(serviceTypeId)) {
        filtered = filtered.filter(service => service.service_type_id === serviceTypeId);
      }
    }

    // Apply sorting
    if (this.sortBy === 'popular') {
      filtered = filtered.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    } else if (this.sortBy === 'price-low') {
      filtered = filtered.sort((a, b) => {
        const aPrice = this.extractMinPrice(a.price);
        const bPrice = this.extractMinPrice(b.price);
        return aPrice - bPrice;
      });
    } else if (this.sortBy === 'price-high') {
      filtered = filtered.sort((a, b) => {
        const aPrice = this.extractMaxPrice(a.price);
        const bPrice = this.extractMaxPrice(b.price);
        return bPrice - aPrice;
      });
    } else if (this.sortBy === 'name') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }

  private extractMinPrice(priceStr: string): number {
    const match = priceStr.match(/₹([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : 0;
  }

  private extractMaxPrice(priceStr: string): number {
    const matches = priceStr.match(/₹([\d,]+)/g);
    if (matches && matches.length > 1) {
      return parseInt(matches[matches.length - 1].replace(/[₹,]/g, ''));
    }
    return this.extractMinPrice(priceStr);
  }

  get servicesCount() {
    return this.filteredServices.length;
  }

  selectCategory(category: any) {
    this.categories.forEach(cat => cat.active = false);
    category.active = true;
    this.selectedCategory = category.id === 'all' ? 'all' : category.id;
    
    // Don't reload services - filtering is handled by filteredServices getter
    // This ensures counts remain accurate based on allServices
  }
}
