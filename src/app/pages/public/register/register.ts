import { Component, inject } from '@angular/core';
import { Logo } from '../../../shared/components/common/logo/logo';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment.prod';
import { Router } from '@angular/router';

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
  private readonly formBuilder = inject(FormBuilder)

  public readonly applicationName = environment.applicationName;
  public readonly router = inject(Router);
  public errorMessage = '';
   public showPassword = false;
   public showConfirmPassword = false;
  public registerForm = this.formBuilder.group({
  full_name: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
  confirm_password: ['', Validators.required],
  is_subscriber: [false],
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
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    // Handle form submission logic here
  }

  public onLogin(): void {
    // Navigate to login page
     this.router.navigate(['/login'])
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  public toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

}
