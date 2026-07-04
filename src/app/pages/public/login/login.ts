import { Component, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Logo } from '../../../shared/components/common/logo/logo';
import { CommonModule } from '@angular/common';
import { User } from '../../../services/user/user.service';
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
  public errorMessage = '';
  public showPassword = false;
  public isSubmitting = false;



  public onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }
    this.isSubmitting = true;
    this.authService.login({
      email: this.loginForm.value.email as string,
      password: this.loginForm.value.password as string,
    }).subscribe({
      next: (response) => {
        this.authService.setToken(response.data.token.access_token);

        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isSubmitting = false;
      }
    });
  }


  public useDemoCredentials(): void {
    this.loginForm.patchValue({
      email: this.demoEmail,
      password: this.demoPassword
    });
    this.errorMessage = '';
  }


  public onCreateAccount(): void {
    // Navigate to registration page
     this.router.navigate(['/register'])
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

}
