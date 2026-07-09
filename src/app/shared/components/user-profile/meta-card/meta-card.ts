import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { User } from '../../../../services/user/user.model';
import { UserService } from '../../../../services/user/user.service';
import { Avatar } from '../avatar/avatar';
@Component({
  selector: 'app-meta-card',
  standalone: true,
  imports: [
    CommonModule,
    Avatar
  ],
  templateUrl: './meta-card.html',
  styleUrls: ['./meta-card.css'],
})
export class MetaCard {

  
  @Input() user!: User;


  public readonly userService = inject(UserService)


}