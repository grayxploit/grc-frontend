import { Component, inject, signal } from '@angular/core';
import { Logo } from '../../../shared/components/common/logo/logo';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment.prod';
import { Router } from '@angular/router';
import { RegisterRequest } from '../../../services/auth/auth.model';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  imports: [
    Logo,
    ReactiveFormsModule,

  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder)

  public readonly applicationName = environment.applicationName;
  public readonly router = inject(Router);
  public isSubmitting = signal(false);
  public errorMessage = signal('');
  public showPassword = signal(false);
  public showConfirmPassword = signal(false);
  public showSuccessMessage = signal('');
  public registerForm = this.formBuilder.group({
  full_name: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  phone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
  confirm_password: ['', Validators.required],
  is_subscriber: [false, Validators.requiredTrue],
  is_terms_accept: [false, Validators.requiredTrue]
}, {
  validators: this.passwordMatchValidator()
});

  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password')?.value;
      const confirmPassword = control.get('confirm_password')?.value;

      if (!password || !confirmPassword) {
        return null;
      }

      return password === confirmPassword
        ? null
        : { passwordMismatch: true };
    };
  }

  onSubmit() {
    this.errorMessage.set('');
    if (this.registerForm.invalid) {
      this.errorMessage.set('Please fill in all fields');
      return;
    }
    // Handle form submission logic here
    const formData = this.registerForm.value;
    const payload : RegisterRequest = {
      email: formData.email as string,
      password: formData.password as string,
      confirmPassword: formData.confirm_password as string,
      full_name: formData.full_name as string,
      phone: formData.phone as string,
      is_subscriber: formData.is_subscriber as boolean,
      is_terms_accept: formData.is_terms_accept as boolean
    };

    this.isSubmitting.set(true);
    this.authService.register(payload).subscribe({
      next: (response) => {
        // Handle successful registration
        this.isSubmitting.set(false);
        this.registerForm.reset();
        this.showSuccessMessage.set(response.message || 'Registration successful! Please check your email for verification.');
      },
      error: (error) => {
        // Handle registration error
        const err = this.authService.apiService.extractApiErrorMessage(error);
        this.errorMessage.set(err || 'Registration failed. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }

  public onLogin(): void {
    // Navigate to login page
     this.router.navigate(['/login'])
  }

  public togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }
  public toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

}
