import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss'
})
export class AppHeaderComponent implements OnInit {
  isMobileMenuOpen: boolean = false;
  searchQuery: string = '';
  isAuthenticated: boolean = false;
  username: string | null = null;
  showProfileDropdown: boolean = false;

  navItems = [
    { label: 'Temple Services', route: '/services', active: false },
    { label: 'About Us', route: '/about-us', active: false },
    { label: 'How It Works', route: '/how-it-works', active: false }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkAuthStatus();
    }
    
    // Set active nav item based on current route
    this.updateActiveNavItem();
    
    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateActiveNavItem();
        if (isPlatformBrowser(this.platformId)) {
          this.checkAuthStatus();
        }
      });
  }

  checkAuthStatus(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.username = this.authService.getUsername();
    } else {
      this.username = null;
    }
  }

  updateActiveNavItem(): void {
    const currentPath = this.router.url;
    this.navItems.forEach(item => {
      item.active = currentPath === item.route || currentPath.startsWith(item.route + '/');
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  setActiveNavItem(item: any): void {
    this.navItems.forEach(nav => nav.active = false);
    item.active = true;
    this.closeMobileMenu();
  }

  onSearch(): void {
    // Handle search functionality
    console.log('Search query:', this.searchQuery);
  }

  toggleProfileDropdown(): void {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  closeProfileDropdown(): void {
    this.showProfileDropdown = false;
  }

  onProfileClick(): void {
    // Navigate to profile page
    this.router.navigate(['/profile']);
    this.closeProfileDropdown();
  }

  onEditClick(): void {
    // Navigate to edit profile page
    this.router.navigate(['/profile/edit']);
    this.closeProfileDropdown();
  }

  onSettingsClick(): void {
    // Navigate to settings page
    this.router.navigate(['/settings']);
    this.closeProfileDropdown();
  }

  onLogoutClick(): void {
    this.authService.logout();
    this.closeProfileDropdown();
    this.checkAuthStatus();
  }

  getInitials(): string {
    if (!this.username) return 'U';
    return this.username.charAt(0).toUpperCase();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-section')) {
      this.closeProfileDropdown();
    }
  }
}
