import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../shared/components/common/card/card';
import { MetaCard } from '../../../shared/components/user-profile/meta-card/meta-card';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../services/user/user.model';
import { UserService } from '../../../services/user/user.service';
@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
    MetaCard
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  public readonly authService = inject(AuthService)
  public readonly userService = inject(UserService)
  public user = signal<User | null>(this.authService.authUser())


  ngOnInit() {
    this.userService.getFullUserProfile().subscribe({
      next: (response) => {
        console.log(response.data)
      },
      error: (error) => {
        console.error(error)
      },
    })
  }
}
