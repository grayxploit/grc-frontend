import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  Output,
  PLATFORM_ID
} from '@angular/core';
@Component({
  selector: 'app-modal',
  imports: [
    CommonModule
  ],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
   @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Input() className = '';
  @Input() showCloseButton = true;
  @Input() isFullscreen = false;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId) && this.isOpen) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'unset';
    }
  }

  ngOnChanges() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.isOpen ? 'hidden' : 'unset';
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (!this.isFullscreen) {
      this.close.emit();
    }
  }

  onContentClick(event: MouseEvent) {
    event.stopPropagation();
  }

 @HostListener('document:keydown.escape')
  onEscape() {
    if (this.isOpen) {
      this.close.emit();
    }
  }
}
