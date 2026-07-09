import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { PageBreadcrumb } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../shared/components/common/card/card';
import { MetaCard } from '../../../shared/components/user-profile/meta-card/meta-card';
import { InfoCard } from '../../../shared/components/user-profile/info-card/info-card';
import { AuthService } from '../../../services/auth/auth.service';
import { UpdateProfileRequest, User } from '../../../services/user/user.model';
import { UserService } from '../../../services/user/user.service';
import { AddressCard } from '../../../shared/components/user-profile/address-card/address-card';
@Component({
  selector: 'app-profile',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
    MetaCard,
    InfoCard,
    AddressCard
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  public readonly authService = inject(AuthService)
  public readonly userService = inject(UserService)
  public user = signal<User | null>(this.authService.authUser())
  @ViewChild(MetaCard) private readonly metaCard?: MetaCard;
  @ViewChild(InfoCard) private readonly infoCard?: InfoCard;
  @ViewChild(AddressCard) private readonly addressCard?: AddressCard;
  ngOnInit() {
    this.userService.getFullUserProfile().subscribe({
      next: (response) => {
        this.user.set(response.data);
      },
      error: (error) => {
        console.error(error)
      },
    })
  }

  onProfileSave(profileUpdate: UpdateProfileRequest) {
    this.userService.updateUserProfile(profileUpdate).subscribe({
      next: (response) => {
        this.user.set(response.data);
        this.metaCard?.onClose();
        this.infoCard?.onClose();
        this.addressCard?.onClose();
      },
      error: (error) => {
        console.error(error);
        this.metaCard?.isSubmitting.set(false);
        this.infoCard?.isSubmitting.set(false);
        this.addressCard?.isSubmitting.set(false);
      },
    })
  }
}
