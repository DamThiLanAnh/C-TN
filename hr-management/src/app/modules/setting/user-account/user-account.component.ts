import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SettingService } from '../setting.service';
import { finalize } from 'rxjs/operators';
import { USER_ACCOUNT_COLUMNS, EMPLOYEE_NO_USER_COLUMNS } from './user-account.columns';

@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.scss']
})
export class UserAccountComponent implements OnInit {
  selectedTabIndex = 0;

  // Tab 1: Users
  userColumns = USER_ACCOUNT_COLUMNS;
  users: any[] = [];
  isLoading = false;
  totalElements = 0;
  pageIndex = 1;
  pageSize = 10;

  // Tab 2: Employees No User
  noUserColumns = EMPLOYEE_NO_USER_COLUMNS;
  noUserEmployees: any[] = [];
  noUserIsLoading = false;
  noUserTotalElements = 0;
  noUserPageIndex = 1;
  noUserPageSize = 10;

  constructor(
    private settingService: SettingService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    if (index === 0 && this.users.length === 0) {
      this.loadData();
    } else if (index === 1 && this.noUserEmployees.length === 0) {
      this.loadNoUserData();
    }
  }

  loadData(): void {
    this.isLoading = true;
    this.settingService.getUsers(this.pageIndex - 1, this.pageSize)
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe(res => {
        if (res && res.content) {
          this.users = res.content;
          this.totalElements = res.totalElements;
        } else {
          this.users = [];
          this.totalElements = 0;
        }
      });
  }

  loadNoUserData(): void {
    this.noUserIsLoading = true;
    this.settingService.getEmployeesNoUser(this.noUserPageIndex - 1, this.noUserPageSize)
      .pipe(finalize(() => {
        this.noUserIsLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe(res => {
        if (res && res.content) {
          this.noUserEmployees = res.content;
          this.noUserTotalElements = res.totalElements;
        } else {
          this.noUserEmployees = [];
          this.noUserTotalElements = 0;
        }
      });
  }

  onQueryParamsChange(params: any): void {
    const { pageSize, pageIndex } = params;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.loadData();
  }

  onNoUserQueryParamsChange(params: any): void {
    const { pageSize, pageIndex } = params;
    this.noUserPageIndex = pageIndex;
    this.noUserPageSize = pageSize;
    this.loadNoUserData();
  }
}
