import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Logo } from '../../../shared/components/common/logo/logo';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { ResetPasswordRequest } from '../../../services/auth/auth.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [
    CommonModule,
    Logo,
    ReactiveFormsModule
  ],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword  implements OnInit{
  public readonly applicationName = environment.applicationName;
  private readonly formBuilder = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  public isSubmitting = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);
  public showPassword = signal<boolean>(false);
  public showConfirmPassword = signal<boolean>(false);


  public resetPasswordForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    token: ['', Validators.required],
    newPassword: ['', Validators.required],
    newPasswordConfirmation: ['', Validators.required],
  }, {
    validators: this.passwordMatchValidator(),
  });

passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('newPassword')?.value;
      const confirmPassword = control.get('newPasswordConfirmation')?.value;

      if (!password || !confirmPassword) {
        return null;
      }

      return password === confirmPassword
        ? null
        : { passwordMismatch: true };
    };
  }

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe(queryParams => {
      this.resetPasswordForm.patchValue({
        email: queryParams.get('email') || '',
      });
    });

    this.activatedRoute.paramMap.subscribe(params => {
      this.resetPasswordForm.patchValue({
        token: params.get('token') || '',
      });
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formData = this.resetPasswordForm.value;
    const resetPasswordData : ResetPasswordRequest = {
      email: formData.email as string,
      token: formData.token as string,
      new_password: formData.newPassword as string,
      confirm_password: formData.newPasswordConfirmation as string,
    };

    this.authService.resetPassword(resetPasswordData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.successMessage.set(response.message || 'Password reset successful. You can now log in with your new password.');
        
        this.resetPasswordForm.reset();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (error) => {
        const err = this.authService.apiService.extractApiErrorMessage(error);
        this.isSubmitting.set(false);
        this.errorMessage.set(err || 'Failed to reset password. Please try again.');
      }
    });
  }

   public togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }
  public toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
}
