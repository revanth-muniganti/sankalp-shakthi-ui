import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { AppHeaderComponent } from '../../widgets/app-header/app-header.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-package-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, AppHeaderComponent],
  templateUrl: './package-selection.component.html',
  styleUrl: './package-selection.component.scss'
})
export class PackageSelectionComponent implements OnInit {
  selectedPackage: any = null;
  showReadMoreModal = false;
  selectedPackageForModal: any = null;
  service: any = {
    id: 0,
    name: '',
    location: 'Hyderabad',
    priest: 'Telugu'
  };

  /** Pooja materials brought by service provider (shown in Read More modal list) */
  poojaMaterialsByUs: string[] = [
    'Pasupu',
    'Kum kum',
    'Coconuts',
    'Mango leaves',
    'Tulasi',
    'Darba',
    'Vastralu',
    'Dhanyalu',
    'Tamalaakulu',
    'Vakkalu',
    'Kharjura',
    'Dravyas'
  ];

  /** House items to be kept by Yajaman (shown in Read More modal list) */
  poojaMaterialsByYajaman: string[] = [
    'Vessels',
    'Deepalu',
    'Mats',
    'Bowls',
    'Milk',
    'Curd',
    'Prasadam',
    'Plates',
    'Photos'
  ];

  packages: any[] = [
    {
      id: 1,
      name: 'Economy',
      subtitle: '(1 Priest + Pooja Samagries)',
      price: 4800.00,
      procedures: [
        { name: 'Ganapathi Pooja', duration: '2-3 hours' },
        { name: 'Punyaha Vachanam', duration: '1-2 hours' },
        { name: 'Saraswati Pooja', duration: '1-2 hours' }
      ],
      inclusions: [
        { name: 'Dakshina', included: true },
        { name: 'All Pooja Materials', included: true },
        { name: 'Flowers & Fruits', included: false }
      ]
    },
    {
      id: 2,
      name: 'Standard',
      subtitle: '(2 Priest + Saraswati & Hayagreeva Homam)',
      price: 13800.00,
      procedures: [
        { name: 'Ganapathi Pooja', duration: '2-3 hours' },
        { name: 'Punyaha Vachanam, Maha Sankalpam', duration: '2-3 hours' },
        { name: 'Kalasha Pooja', duration: '1-2 hours' },
        { name: 'Saraswati & Hayagreeva Homam', duration: '2-3 hours' }
      ],
      inclusions: [
        { name: 'Dakshina', included: true },
        { name: 'All Pooja Materials', included: true },
        { name: 'Flowers & Fruits', included: false }
      ]
    },
    {
      id: 3,
      name: 'Premium',
      subtitle: '(3 Priest + Grand Homam + Flowers)',
      price: 21500.00,
      procedures: [
        { name: 'Full Traditional Ritual Package', duration: '3-4 hours' },
        { name: 'Special Homam & Archana', duration: '2-3 hours' },
        { name: 'Personal Priest Consultation', duration: '1-2 hours' }
      ],
      inclusions: [
        { name: 'Dakshina', included: true },
        { name: 'All Pooja Materials', included: true },
        { name: 'Flowers & Fruits Included', included: true }
      ]
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadServiceData();
    }
  }

  loadServiceData(): void {
    const serviceId = this.route.snapshot.queryParams['serviceId'];
    if (serviceId) {
      this.apiService.getServiceById(parseInt(serviceId)).subscribe({
        next: (apiService) => {
          this.service = {
            id: apiService.id,
            name: apiService.name,
            location: 'Hyderabad',
            priest: 'Telugu'
          };
        },
        error: (error) => {
          console.error('Error loading service:', error);
        }
      });
    }
  }

  selectPackage(packageItem: any): void {
    this.selectedPackage = packageItem;
  }

  readMore(packageItem: any): void {
    this.selectedPackageForModal = packageItem;
    this.showReadMoreModal = true;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeReadMoreModal(): void {
    this.showReadMoreModal = false;
    this.selectedPackageForModal = null;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'auto';
    }
  }

  selectPackageFromModal(): void {
    if (this.selectedPackageForModal) {
      this.selectPackage(this.selectedPackageForModal);
      this.closeReadMoreModal();
    }
  }

  proceedToDateAvailability(): void {
    if (this.selectedPackage && this.service.id) {
      this.router.navigate(['/booking'], {
        queryParams: {
          serviceId: this.service.id,
          packageId: this.selectedPackage.id,
          packagePrice: this.selectedPackage.price
        }
      });
    }
  }

  goBack(): void {
    if (this.service.id) {
      this.router.navigate(['/service', this.service.id]);
    } else {
      this.router.navigate(['/services']);
    }
  }
}
