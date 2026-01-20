import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SettingService } from '../setting.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
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
  pageSize = 6;

  // Tab 2: Employees No User
  noUserColumns = EMPLOYEE_NO_USER_COLUMNS;
  noUserEmployees: any[] = [];
  noUserIsLoading = false;
  noUserTotalElements = 0;
  noUserPageIndex = 1;
  noUserPageSize = 6;

  isVisibleRoleModal = false;
  selectedUserForRole: any = null;
  roleOptions = [
    { label: 'Nhân viên', value: 'EMPLOYEE', disabled: true, checked: true },
    { label: 'Quản lý', value: 'MANAGER', disabled: false, checked: false },
    { label: 'Quản trị viên', value: 'ADMIN', disabled: false, checked: false }
  ];
  isRolesLoading = false;

  constructor(
    private settingService: SettingService,
    private cdr: ChangeDetectorRef,
    private modal: NzModalService,
    private message: NzMessageService
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

  createAccount(data: any): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận tạo tài khoản',
      nzContent: `Bạn có chắc chắn muốn tạo tài khoản cho nhân viên <b>${data.fullName}</b> không?`,
      nzOkText: 'Có',
      nzCancelText: 'Không',
      nzOnOk: () => {
        this.settingService.createUserFromEmployee(data.id)
          .subscribe({
            next: (res) => {
              this.message.success('Tạo tài khoản thành công');
              this.loadNoUserData();
            },
            error: (err) => {
              this.message.error(err.error?.message || 'Có lỗi xảy ra khi tạo tài khoản');
            }
          });
      }
    });
  }

  openRoleModal(user: any): void {
    this.selectedUserForRole = user;
    this.isVisibleRoleModal = true;

    // Reset selections based on user's current roles
    const userRoles = user.roles || [];
    this.roleOptions = this.roleOptions.map(option => ({
      ...option,
      checked: option.value === 'EMPLOYEE' || userRoles.includes(option.value)
    }));
  }

  handleCancelRoleModal(): void {
    this.isVisibleRoleModal = false;
    this.selectedUserForRole = null;
  }

  submitUpdateRoles(): void {
    if (!this.selectedUserForRole) return;

    // Always include EMPLOYEE
    const selectedRoles = this.roleOptions
      .filter(opt => opt.checked)
      .map(opt => opt.value);

    // Ensure EMPLOYEE is present
    if (!selectedRoles.includes('EMPLOYEE')) {
      selectedRoles.push('EMPLOYEE');
    }

    this.isRolesLoading = true;
    this.settingService.updateUserRoles(this.selectedUserForRole.id, selectedRoles)
      .pipe(finalize(() => {
        this.isRolesLoading = false;
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: (res) => {
          this.message.success(`Cập nhật quyền cho tài khoản ${this.selectedUserForRole.username} thành công`);
          this.isVisibleRoleModal = false;
          this.loadData(); // Refresh user list
        },
        error: (err) => {
          this.message.error(err.error?.message || 'Có lỗi xảy ra khi cập nhật quyền');
        }
      });
  }

  lockUser(user: any): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận khóa tài khoản',
      nzContent: `Bạn có chắc chắn muốn khóa tài khoản <b>${user.username}</b> không?`,
      nzOkText: 'Có',
      nzCancelText: 'Không',
      nzOnOk: () => {
        this.settingService.lockUser(user.id)
          .subscribe({
            next: (res) => {
              this.message.success(`Khóa tài khoản ${user.username} thành công`);
              this.loadData();
            },
            error: (err) => {
              this.message.error(err.error?.message || 'Có lỗi xảy ra khi khóa tài khoản');
            }
          });
      }
    });
  }

  deactivateUser(user: any): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận vô hiệu hóa tài khoản',
      nzContent: `Bạn có chắc chắn muốn vô hiệu hóa tài khoản <b>${user.username}</b> không?`,
      nzOkText: 'Có',
      nzCancelText: 'Không',
      nzOnOk: () => {
        this.settingService.deactivateUser(user.id)
          .subscribe({
            next: (res) => {
              this.message.success(`Vô hiệu hóa tài khoản ${user.username} thành công`);
              this.loadData();
            },
            error: (err) => {
              this.message.error(err.error?.message || 'Có lỗi xảy ra khi vô hiệu hóa tài khoản');
            }
          });
      }
    });
  }

  // User Detail Modal
  isVisibleDetailModal = false;
  selectedUserForDetail: any = null;

  openDetailModal(user: any): void {
    this.selectedUserForDetail = user;
    this.isVisibleDetailModal = true;
  }

  handleCancelDetailModal(): void {
    this.isVisibleDetailModal = false;
    this.selectedUserForDetail = null;
  }

  activateUser(user: any): void {
    this.settingService.activateUser(user.id)
      .subscribe({
        next: (res) => {
          const actionText = user.status === 'LOCKED' ? 'Mở khóa' : 'Kích hoạt';
          this.message.success(`${actionText} tài khoản ${user.username} thành công`);
          this.isVisibleDetailModal = false;
          this.loadData();
        },
        error: (err) => {
          const actionText = user.status === 'LOCKED' ? 'mở khóa' : 'kích hoạt';
          this.message.error(err.error?.message || `Có lỗi xảy ra khi ${actionText} tài khoản`);
        }
      });
  }

  resetPassword(user: any): void {
    this.modal.confirm({
      nzTitle: 'Xác nhận reset mật khẩu',
      nzContent: `Bạn có chắc chắn muốn reset mật khẩu cho tài khoản <b>${user.username}</b> không?`,
      nzOkText: 'Có',
      nzCancelText: 'Không',
      nzOnOk: () => {
        this.settingService.resetPassword(user.id)
          .subscribe({
            next: (res) => {
              this.message.success(`Reset mật khẩu cho tài khoản ${user.username} thành công`);
            },
            error: (err) => {
              this.message.error(err.error?.message || 'Có lỗi xảy ra khi reset mật khẩu');
            }
          });
      }
    });
  }
}
