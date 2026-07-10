import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../../../services/user/user.service';
import { PaginationMeta, QueryFilter } from '../../../../services/api/api-response.model';
import { LoginLog as LoginLogsModel, LoginLogQueryParam } from '../../../../services/user/user.model'; 
import { CommonModule } from '@angular/common';
import { PageBreadcrumb } from '../../../../shared/components/common/page-breadcrumb/page-breadcrumb';
import { Card } from '../../../../shared/components/common/card/card';
import { Pagination } from '../../../../shared/components/common/pagination/pagination';
@Component({
  selector: 'app-login-log',
  imports: [
    CommonModule,
    PageBreadcrumb,
    Card,
    Pagination
  ],
  templateUrl: './login-log.html',
  styleUrl: './login-log.css',
})
export class LoginLog {
  private readonly userService = inject(UserService);


  limit = 5;
  limitOptions = [5, 10, 20, 50, 100];
  filter: QueryFilter = {};
  loginLogs = signal<LoginLogsModel[]> ([]);
  meta!: PaginationMeta;





  ngOnInit() {
    this.getLoginLogs();
  }

  getLoginLogs() {
    const page = this.filter['page'] || 1;
     const params: LoginLogQueryParam = { page, size: this.limit || 5 };
     this.userService.getLoginLog(params).subscribe({
      next: (response) => {
        this.loginLogs.set(response.data);
        this.meta = response.meta;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

    onLimitChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.limit = Number(select.value);
    this.filter['page'] = 1;
    this.getLoginLogs();
  }


    getSerialNumber(index: number): number {
    const currentPage = this.filter['page'] || 1;
    const itemsPerPage = this.meta?.size || 2;
    return (currentPage - 1) * itemsPerPage + index + 1;
  }

   onPageChange(page: number) {
    this.filter['page'] = page;
    this.getLoginLogs();
  }
}
