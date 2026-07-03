import { Component, inject } from '@angular/core';
import { Logo } from '../../../shared/components/common/logo/logo';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

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


  public registerForm = this.formBuilder.group({
      full_name :['', Validators.required, Validators.minLength(3)],
      email: ['', Validators.required, Validators.email],
      password:['', Validators.required ],
      confirm_password :['', Validators.required],
      is_subscriber: ['', Validators.required],
      is_terms_accept:['', Validators.required]
    },
    {
        validators: this.passwordMatchValidator(),
  })

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

}
