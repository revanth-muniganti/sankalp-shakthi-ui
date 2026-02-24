import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppFooterComponent } from './widgets/app-footer/app-footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppFooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'sankalp';
  showFooter: boolean = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check initial route
    this.updateFooterVisibility(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateFooterVisibility(event.url);
      });
  }

  private updateFooterVisibility(url: string): void {
    // Hide footer on login and registration pages
    this.showFooter = !url.includes('/login') && !url.includes('/registration');
  }
}
