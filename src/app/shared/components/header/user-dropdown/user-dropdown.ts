import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Dropdown } from '../../ui/dropdown/dropdown';
import { DropdownItemTwo } from '../../ui/dropdown/dropdown-item/dropdown-item-two';
import { AuthService } from '../../../../services/auth/auth.service';
@Component({
  selector: 'app-user-dropdown',
  imports: [CommonModule, RouterModule, Dropdown, DropdownItemTwo],
  templateUrl: './user-dropdown.html',
  styleUrl: './user-dropdown.css',
})
export class UserDropdown implements OnInit {
  private authService = inject(AuthService);
  authUser = this.authService.authUser; // live computed signal
  isOpen = false;

  ngOnInit() {
    console.log('authUser in ngOnInit:', this.authUser());
  }

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  closeDropdown() {
    this.isOpen = false;
  }
}
