import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Navbar } from '../headers/public/navbar/navbar';
import { BlockchainBackgroundComponent } from '../../components/common/blockchain-background/blockchain-background';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ThemeService } from '../../../services/theme/theme.service';
@Component({
  selector: 'app-public',
  imports: [
    CommonModule,
    AsyncPipe,
    RouterModule,
    Navbar,
    BlockchainBackgroundComponent
  ],
  templateUrl: './public.html',
  styleUrl: './public.css',
})
export class Public {
  constructor(public themeService: ThemeService) {}
}
