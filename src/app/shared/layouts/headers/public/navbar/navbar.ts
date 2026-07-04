import { CommonModule } from '@angular/common';
import { Component , HostListener} from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Logo } from '../../../../components/common/logo/logo';
import { ThemeToggle } from '../../../../components/theme-toggle/theme-toggle';
interface NavLink {
  href: string;
  label: string;
}
@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule, RouterModule, Logo, ThemeToggle
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  scrolled = false;
  open = false;
  menuOpen = false;

  links: NavLink[] = [
    { href: '/search', label: 'Search' },
    { href: '/controls', label: 'Controls' },
    { href: '/frameworks', label: 'Frameworks' },
    { href: '/mappings', label: 'Mappings' },
    { href: '/vendors', label: 'Platforms' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  // Replace with your auth service
  authed = false;

  user = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.open = false;
        this.menuOpen = false;
      });
  }

  get initials(): string {
    return (this.user?.name || this.user?.email || 'U')
      .charAt(0)
      .toUpperCase();
  }

  isActive(path: string): boolean {
    return (
      this.router.url === path ||
      this.router.url.startsWith(path + '/')
    );
  }

  toggleMobileMenu(): void {
    this.open = !this.open;
  }

  toggleUserMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  logout(): void {
    console.log('logout');
    this.router.navigate(['/login']);
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled = window.scrollY > 12;
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (!target.closest('.user-menu')) {
      this.menuOpen = false;
    }
  }
}
