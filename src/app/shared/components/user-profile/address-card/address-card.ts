import { Component, EventEmitter, inject, Input, Output, signal, effect } from '@angular/core';
import { UpdateProfileRequest, User } from '../../../../services/user/user.model';
import { UserService } from '../../../../services/user/user.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Modal } from '../../ui/modal/modal';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-address-card',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Modal
  ],
  templateUrl: './address-card.html',
  styleUrl: './address-card.css',
})
export class AddressCard {

  private readonly formBuilder = inject(FormBuilder)
  @Input() user: User | null = null;
  @Output() save = new EventEmitter<UpdateProfileRequest>();



  showModal = signal<boolean>(false)
  isSubmitting = signal<boolean>(false)

  public readonly userService = inject(UserService)
  public readonly profileData : () => User | null = this.userService.userData


  public readonly userProfileForm = this.formBuilder.group({
    address_1: [''],
    address_2: [''],
    city: [''],
    state: [''],
    zip: [''],
    country: ['']
  })

  constructor() {
    effect(() => {
      const profile = this.profileData();

      console.log('Profile data changed:', profile);
      if (profile) {
        const address = profile.addresses?.[0]; // Assuming you want to use the first address
        this.userProfileForm.patchValue({
          address_1: address?.address_1 ?? '',
          address_2: address?.address_2 ?? '',
          city: address?.city ?? '',
          state: address?.state ?? '',
          zip: address?.zip_code ?? '',
          country: address?.country ?? ''
        }, { emitEvent: false });
      }
    })
  }

  ngOnInit() {
    if (this.user) {
      const address = this.user.addresses?.[0]; // Assuming you want to use the first address
      this.userProfileForm.patchValue({
        address_1: address?.address_1 ?? '',
        address_2: address?.address_2 ?? '',
        city: address?.city ?? '',
        state: address?.state ?? '',
        zip: address?.zip_code ?? '',
        country: address?.country ?? ''
      }, { emitEvent: false });
    }
  }

  onEdit() {
    this.showModal.set(true);
  }

  onSave() {
    if (this.userProfileForm.valid) {
      const addressUpdate: UpdateProfileRequest = {
        email: this.user?.email ?? '',
        full_name: this.user?.full_name ?? '',
        phone: this.user?.phone ?? '',
        address: {
          address_1: this.userProfileForm.value.address_1 ?? '',
          address_2: this.userProfileForm.value.address_2 ?? '',
          city: this.userProfileForm.value.city ?? '',
          state: this.userProfileForm.value.state ?? '',
          zip_code: this.userProfileForm.value.zip ?? '',
          country: this.userProfileForm.value.country ?? ''
        }
      };
      this.save.emit(addressUpdate);
    }
  }

  onClose() {
    this.showModal.set(false);
  }
}
