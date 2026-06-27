import { Service } from '@angular/core';
export interface User {
    id: number;
    email: string;
    full_name: string;
    phone: string;
    status: string;
    role: string
}
@Service()
export class UserService {




}
