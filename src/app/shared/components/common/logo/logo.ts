import { Component , Input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-logo',
  imports: [CommonModule, RouterModule],
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  @Input() size = 36;
  @Input() withText = true;
  @Input() href: string | null = '/';
  @Input() className = '';
  @Input() tagline = 'CyberControl';
  @Input() glow = true;
}
