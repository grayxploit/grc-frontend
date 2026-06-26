import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Navbar } from '../headers/public/navbar/navbar';
@Component({
  selector: 'app-public',
  imports: [
    RouterModule,
    Navbar
  ],
  templateUrl: './public.html',
  styleUrl: './public.css',
})
export class Public {}
