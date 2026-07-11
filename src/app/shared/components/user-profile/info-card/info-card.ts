import { Component, inject, Input, Output, EventEmitter, signal, effect, OnInit } from '@angular/core';
import { UpdateProfileRequest, User } from '../../../../services/user/user.model';
import { UserService } from '../../../../services/user/user.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Modal } from '../../ui/modal/modal';
@Component({
  selector: 'app-info-card',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Modal
  ],
  templateUrl: './info-card.html',
  styleUrl: './info-card.css',
})
export class InfoCard implements OnInit {

 private readonly formBuilder = inject(FormBuilder)

  @Input() user: User | null = null;
  @Output() save = new EventEmitter<UpdateProfileRequest>();
  
  showModal = signal<boolean>(false)
  isSubmitting = signal<boolean>(false)
  errorMessage = signal<string>('')
  
  public readonly userService = inject(UserService)
  public readonly profileData : () => User | null = this.userService.userData
  private readonly urlPattern =
    /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

  public readonly userProfileForm = this.formBuilder.group({
    full_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    facebook: ['', [Validators.required, Validators.pattern(this.urlPattern)]],
    x: ['', [Validators.pattern(this.urlPattern)]],
    linkedin: ['', [Validators.pattern(this.urlPattern)]],
    instagram: ['', [Validators.pattern(this.urlPattern)]]
  })

  constructor() {
    effect(() => {
      const profile = this.profileData();
      console.log('Profile data changed:', profile);
      if (profile) {
        this.userProfileForm.patchValue({
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          facebook: profile.social_media?.find((s) => s.name === 'facebook')?.link ?? '',
          x: profile.social_media?.find((s) => s.name === 'x')?.link ?? '',
          linkedin: profile.social_media?.find((s) => s.name === 'linkedin')?.link ?? '',
          instagram: profile.social_media?.find((s) => s.name === 'instagram')?.link ?? '',
        }, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    if (this.user) {
      this.userProfileForm.patchValue({
        full_name: this.user.full_name,
        email: this.user.email,
        phone: this.user.phone,
        facebook: this.user.social_media?.find((s) => s.name === 'facebook')?.link ?? '',
        x: this.user.social_media?.find((s) => s.name === 'x')?.link ?? '',
        linkedin: this.user.social_media?.find((s) => s.name === 'linkedin')?.link ?? '',
        instagram: this.user.social_media?.find((s) => s.name === 'instagram')?.link ?? '',
      }, { emitEvent: false });
    }
  }

  onEdit() {
    this.showModal.set(true)
  }

  onSave() {
    if (this.userProfileForm.invalid) {
      this.userProfileForm.markAllAsTouched();
      return;
    }

    const formValue = this.userProfileForm.getRawValue();
    const socialLinks = [
      { name: 'facebook', url: formValue.facebook?.trim() ?? '' },
      { name: 'x', url: formValue.x?.trim() ?? '' },
      { name: 'linkedin', url: formValue.linkedin?.trim() ?? '' },
      { name: 'instagram', url: formValue.instagram?.trim() ?? '' },
    ].filter((link) => !!link.url);

    const profileUpdate: UpdateProfileRequest = {
      email: formValue.email?.trim() ?? '',
      full_name: formValue.full_name?.trim() ?? '',
      phone: formValue.phone?.trim() ?? '',
      social_links: socialLinks,
    };

    this.isSubmitting.set(true);
    this.save.emit(profileUpdate);
  }

  onClose() {
    this.isSubmitting.set(false)
    this.showModal.set(false)
  }

  /** True when the control has been touched/dirty and currently fails validation. */
  isInvalid(controlName: string): boolean {
    const control = this.userProfileForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  /** Human-readable message for the first active error on a control. */
  getErrorMessage(controlName: string): string {
    const control = this.userProfileForm.get(controlName);
    if (!control || !control.errors) return '';

    const label: Record<string, string> = {
      facebook: 'Facebook link',
      x: 'X.com link',
      linkedin: 'LinkedIn link',
      instagram: 'Instagram link',
      full_name: 'Full name',
      email: 'Email',
      phone: 'Phone number',
    };
    const name = label[controlName] ?? controlName;

    if (control.errors['required']) return `${name} is required.`;
    if (control.errors['email']) return 'Enter a valid email address.';
    if (control.errors['pattern']) return `Enter a valid ${name.toLowerCase()}.`;
    return `${name} is invalid.`;
  }
}
