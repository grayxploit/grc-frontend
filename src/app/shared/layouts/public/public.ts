import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Navbar } from '../headers/public/navbar/navbar';
import { BlockchainBackgroundComponent } from '../../components/common/blockchain-background/blockchain-background';
import { ThemeService } from '../../../services/theme/theme.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-public',
  imports: [
    CommonModule,
    RouterModule,
    Navbar,
    BlockchainBackgroundComponent
  ],
  templateUrl: './public.html',
  styleUrl: './public.css',
})
export class Public {
   private readonly themeService = inject(ThemeService);

   theme = this.themeService.theme$;
}
