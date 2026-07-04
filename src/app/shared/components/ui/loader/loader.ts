import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { LoaderService } from '../../../../services/loader/loader.service';

@Component({
  selector: 'app-loader',
  imports: [
    CommonModule
  ],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
})
export class Loader {
  private readonly loaderService = inject(LoaderService);
  loading$ = this.loaderService.loading$;
}
