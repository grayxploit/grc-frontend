import { Component } from '@angular/core';
import { Logo } from '../../../shared/components/common/logo/logo';

@Component({
  selector: 'app-register',
  imports: [
    Logo
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {}
