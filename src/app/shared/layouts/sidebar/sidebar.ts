import { ChangeDetectorRef, Component, ElementRef, inject, Input, PLATFORM_ID, QueryList, ViewChildren, } from '@angular/core';
import { Subscription, combineLatest } from 'rxjs';
import { SidebarService } from '../../../services/sidebar/sidebar.service';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SafeHtmlPipePipe } from '../../../pipes/safe-html-pipe';
import { Logo } from '../../components/common/logo/logo';
import { MatIconModule } from '@angular/material/icon';


export type NavItem = {
  name: string;
  icon: string;
  path?: string;
  new?: boolean;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};
@Component({
  selector: 'app-sidebar',
  imports: [
    // LogoComponent,
    RouterModule,
    CommonModule,
   

    // Links,
    SafeHtmlPipePipe,

    Logo
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private platformId = inject(PLATFORM_ID);
  @Input() public navItems: NavItem[] = [];
  @Input() public title: string = 'Menu'
  openSubmenu: string | null | number = null;
  subMenuHeights: { [key: string]: number } = {};
  @ViewChildren('subMenu') subMenuRefs!: QueryList<ElementRef>;
  public sidebarService = inject(SidebarService);
  readonly isExpanded$ = this.sidebarService.isExpanded$;
  readonly isMobileOpen$ = this.sidebarService.isMobileOpen$;
  readonly isHovered$ = this.sidebarService.isHovered$;

  private subscription: Subscription = new Subscription();


  private router = inject(Router);
  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // Subscribe to router events
    this.subscription.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.setActiveMenuFromRoute(this.router.url);
        }
      })
    );

    // Subscribe to combined observables to close submenus when all are false
    this.subscription.add(
      combineLatest([this.isExpanded$, this.isMobileOpen$, this.isHovered$]).subscribe(
        ([isExpanded, isMobileOpen, isHovered]) => {
          if (!isExpanded && !isMobileOpen && !isHovered) {
            // this.openSubmenu = null;
            // this.savedSubMenuHeights = { ...this.subMenuHeights };
            // this.subMenuHeights = {};
            this.cdr.detectChanges();
          } else {
            // Restore saved heights when reopening
            // this.subMenuHeights = { ...this.savedSubMenuHeights };
            // this.cdr.detectChanges();
          }
        }
      )
    );

    // Initial load
    this.setActiveMenuFromRoute(this.router.url);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscription.unsubscribe();
  }

  isActive(path: string): boolean {
    return this.router.url === path;
  }

  toggleSubmenu(section: string, index: number) {
    const key = `${section}-${index}`;

    if (this.openSubmenu === key) {
      this.openSubmenu = null;
      this.subMenuHeights = { ...this.subMenuHeights, [key]: 0 };
      this.cdr.detectChanges();
    } else {
      this.openSubmenu = key;

      setTimeout(() => {
        if (isPlatformBrowser(this.platformId)) {
          const el = document.getElementById(key);
          if (el) {
            const measured = el.scrollHeight;
            const height = measured > 0 ? measured : (this.subMenuHeights[key] || 0);
            this.subMenuHeights = { ...this.subMenuHeights, [key]: height };
            this.cdr.detectChanges();
          }
        }
      });
    }
  }

  onSidebarMouseEnter() {
    this.isExpanded$.subscribe(expanded => {
      if (!expanded) {
        this.sidebarService.setHovered(true);
      }
    }).unsubscribe();
  }

  private setActiveMenuFromRoute(currentUrl: string) {
    const menuGroups = [
      { items: this.navItems, prefix: 'main' },
    ];

    menuGroups.forEach(group => {
      group.items.forEach((nav, i) => {
        if (nav.subItems) {
          nav.subItems.forEach(subItem => {
            if (currentUrl === subItem.path) {
              const key = `${group.prefix}-${i}`;
              this.openSubmenu = key;

              setTimeout(() => {
                if (isPlatformBrowser(this.platformId)) {
                  const el = document.getElementById(key);
                  if (el) {
                    this.subMenuHeights = { ...this.subMenuHeights, [key]: el.scrollHeight };
                    this.cdr.detectChanges();
                  }
                }
              });
            }
          });
        }
      });
    });
  }

  onSubmenuClick() {
    console.log('click submenu');
    this.isMobileOpen$.subscribe(isMobile => {
      if (isMobile) {
        this.sidebarService.setMobileOpen(false);
      }
    }).unsubscribe();
  }
}
