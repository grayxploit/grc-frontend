import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { Logo } from '../../../shared/components/common/logo/logo';
import { AuthService } from '../../../services/auth/auth.service';
import { sign } from 'crypto';
import { ActivatedRoute , Router} from '@angular/router';

@Component({
  selector: 'app-verify-email',
  imports: [
    CommonModule,
    Logo
  ],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly router = inject(Router)
  public isVerifying = signal(true);
  public verificationSuccess = signal(false);
  public errorMessage = signal('');

  public token = signal<string | null>(null);
  
  public activeUserError = signal<string | null>(null);
  ngOnInit(){
    console.log('VerifyEmail component initialized');
    this.activatedRoute.paramMap.subscribe(params => {
      this.token.set(params.get('token'))
    });
    this.verifyEmail();
  }
  public verifyEmail() {
    if(!this.token()){
      return;
    }
    this.authService.verifyEmail(this.token()!).subscribe({
      next: (response) => {
        this.isVerifying.set(false)
        this.verificationSuccess.set(true);
        this.errorMessage.set('')

        this.router.navigate(['/login']);

      },
      error: (error) => {
       
        const err = this.authService.apiService.extractApiErrorMessage(error);
        const errorCode = error?.error?.error.detail?.error_code
        if(errorCode === 'USER_ALREADY_VERIFIED'){
          
          this.activeUserError.set('Your email is already verified. Please login to continue.');
        }
        this.errorMessage.set(err || 'Failed to verify email. Please try again.');
        this.isVerifying.set(false);
        this.verificationSuccess.set(false);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
