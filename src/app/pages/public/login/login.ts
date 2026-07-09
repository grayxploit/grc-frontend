import { Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Logo } from '../../../shared/components/common/logo/logo';
import { CommonModule } from '@angular/common';
import { User } from '../../../services/user/user.model';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Logo
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

 
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  public readonly applicationName = environment.applicationName;
  public readonly demoEmail = 'demo@grayxploit.io';
  public readonly demoPassword = 'Demo1234!';
  public readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
   public errorMessage = signal('');
  public showPassword = signal(false);
  public isSubmitting = signal(false);



  public onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Please fill in all fields');
      this.isSubmitting.set(false);
      return;
    }

    this.errorMessage.set('');
    this.isSubmitting.set(true);
    this.authService.login({
      email: this.loginForm.value.email as string,
      password: this.loginForm.value.password as string,
    }).subscribe({
      next: (response) => {
        this.authService.setToken(response.data.token.access_token);

        const user = response.data.user;
        const isAdminWithNoOrg = user.role?.toLowerCase() === 'admin' && (user.organization === null || user.organization === undefined);

        if (isAdminWithNoOrg) {
          this.router.navigate(['/organizations']);
          return;
        }

        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        
        const err = this.authService.apiService.extractApiErrorMessage(error);
        console.error('Login error:', err);
        this.errorMessage.set(err || 'Login failed. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }


  public useDemoCredentials(): void {
    this.loginForm.patchValue({
      email: this.demoEmail,
      password: this.demoPassword
    });
    this.errorMessage.set('');
  }


  public onCreateAccount(): void {
    // Navigate to registration page
     this.router.navigate(['/register'])
  }

  public togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  public onForgotPassword(): void {
    // Navigate to forgot password page
    this.router.navigate(['/forgot-password']);
  }
}
