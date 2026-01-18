import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CurrentUser, UiNavModel } from '../menu/menu.component';
import { IconHtml } from '../../modules/shares/enum/icon-html.enum';
import { filter } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

interface Notification {
  id: string;
  title: string;
  message: string;
  staffId: string;
  createdDate: Date;
  readNotify: boolean;
}

interface Tab {
  title: string;
  url: string;
  active: boolean;
}

@Component({
  selector: 'app-layout',
  templateUrl: './layout-full.component.html',
  styleUrls: ['./layout-full.component.scss'],
})
export class LayoutFullComponent implements OnInit {
  isCollapsed = false;
  nzPopoverVisible = false;
  nzPopoverUserVisible = false;

  isVisibleChangePassword = false;
  changePasswordForm!: FormGroup;
  passwordVisible = false;
  newPasswordVisible = false;
  isLoadingChangePassword = false;

  dynamicTabs: Tab[] = [];
  selectedTabIndex = 0;

  menus: UiNavModel[] = [
    {
      htmlIcon: IconHtml.STATISTICS,
      title: 'Thống kê',
      id: '1',
      level: 1,
      url: '/dashboard',
      roles: [],
      children: []
    },
    {
      htmlIcon: IconHtml.EMPLOYEE,
      title: 'Nhân viên',
      level: 1,
      url: '',
      roles: [],
      children: [
        {
          icon: '',
          children: [],
          id: '2',
          level: 2,
          title: 'Quản lý nhân viên',
          url: '/employee/employee-manage',
          roles: [],
        },
        {
          icon: '',
          children: [],
          id: '3',
          level: 2,
          title: 'Quản lý phòng ban',
          url: '/employee/department-manage',
          roles: [],
        },
        {
          icon: '',
          children: [],
          id: '4',
          level: 2,
          title: 'Quản lý bằng cấp',
          url: '/employee/certificates-manage',
          roles: [],
        },
      ]
    },
    {
      icon: '',
      htmlIcon: IconHtml.GATE_MANAGE,
      title: 'Quản lý vào ra',
      id: '10',
      level: 1,
      url: '',
      roles: [],
      children: [
        {
          children: [],
          id: '101',
          level: 2,
          title: 'Quản lý vắng mặt',
          url: '/gate-manage/leave-manage',
          roles: [],
        },
        {
          children: [],
          id: '101',
          level: 2,
          title: 'Quản lý lịch đặc thù',
          url: '/gate-manage/special-schedule',
          roles: [],
        },
        {
          children: [],
          id: '106',
          level: 2,
          title: 'Giải trình công',
          url: '/gate-manage/timekeeping-explanation',
          roles: [],
        },
        {
          children: [],
          id: '107',
          level: 2,
          title: 'Quản lý tăng ca',
          url: '/gate-manage/over-time-manage',
          roles: [],
        }
      ]
    },
    {
      htmlIcon: IconHtml.STAFF,
      children: [],
      id: '11',
      level: 1,
      title: 'Thông tin người dùng',
      url: '/staffs/detail',
      // roles: ['ROLE_INFOR_BY_SELF']
    },
    {
      htmlIcon: IconHtml.COST,
      id: '1111',
      level: 1,
      url: '/staff-cost',
      title: 'Chi phí',
      // roles: ['ROLE_VIEW_COST']
      children: [
        // {
        //   icon: '',
        //   children: [],
        //   id: '12',
        //   level: 2,
        //   title: 'Danh sách tổng lương',
        //   url: '/staff-cost',
        //   roles: [],
        // },
      ],
    },
    {
      htmlIcon: IconHtml.IMPORT,
      id: '12',
      level: 1,
      title: 'Import dữ liệu',
      url: '',
      roles: [],
      children: [
        {
          icon: '',
          children: [],
          id: '123',
          level: 2,
          title: 'Import dữ liệu công',
          url: '/import-data/attendance',
          roles: [],
        },
        {
          icon: '',
          children: [],
          id: '124',
          level: 2,
          title: 'Import dữ liệu lương',
          url: '/import-data/salary',
          roles: [],
        },
      ]
    },
    {
      htmlIcon: IconHtml.SETTING,
      id: '13',
      level: 1,
      title: 'Cài đặt hệ thống',
      roles: [],
      children: [
        {
          icon: '',
          children: [],
          id: '130',
          level: 2,
          title: 'Quản lý người dùng',
          url: '/setting/user-account',
          roles: [],
        },
        {
          icon: '',
          children: [],
          id: '132',
          level: 2,
          title: 'Thiết lâp người duyệt',
          url: '/setting/approve-schedule-config',
          roles: [],
        },
        {
          icon: '',
          children: [],
          id: '133',
          level: 2,
          title: 'Lịch sử log',
          url: '/setting/activity-log',
          roles: [],
        }
      ]
    },
  ];

  // Cập nhật kiểu dữ liệu User sang CurrentUser
  user: CurrentUser = {
    fullName: 'Administrator',
    userName: 'Admin',
    email: 'admin@company.com',
    gender: true,
    image: ''
  };

  // Notification data
  totalNewNotify = 5;
  indexSysNotifyActivate = 0;
  indexTabNotifyActive = 0;

  sysNotification = [
    {
      label: 'Hệ thống',
      totalNewNotify: 3,
      totalAllNotify: 10
    },
    {
      label: 'Cá nhân',
      totalNewNotify: 2,
      totalAllNotify: 5
    }
  ];

  tabs = [
    { name: 'Chưa đọc', textCount: 'totalNewNotify' },
    { name: 'Tất cả', textCount: 'totalAllNotify' }
  ];

  dataNotify: Notification[] = [
    {
      id: '1',
      title: 'Thông báo mới',
      message: 'Bạn có một yêu cầu nghỉ phép mới',
      staffId: 'NV001',
      createdDate: new Date(),
      readNotify: false
    },
    {
      id: '2',
      title: 'Cập nhật thông tin',
      message: 'Thông tin nhân viên đã được cập nhật',
      staffId: 'NV002',
      createdDate: new Date(Date.now() - 86400000),
      readNotify: false
    }
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private notification: NzNotificationService
  ) {
  }

  ngOnInit(): void {

    this.loadUserInfo();
    this.filterMenuByRole();

    this.addTabFromCurrentRoute();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navEvent = event as NavigationEnd;
      this.addOrSelectTab(navEvent.urlAfterRedirects);
    });
  }

  private filterMenuByRole(): void {
    const { isHR, isManager, isAdmin, isOnlyEmployee } = this.authService.getUserRolesState();

    console.log('Role check for Sidebar:', { isHR, isManager, isAdmin, isOnlyEmployee });

    let allowedTitles: string[] = [];

    if (isAdmin) {
      // isAdmin -> Thong tin nguoi dung, Thiet lap he thong
      allowedTitles = ['Thông tin người dùng', 'Quản lý vào ra', 'Chi phí', 'Cài đặt hệ thống'];
    } else if (isHR) {
      // isHR -> Nhan vien, Dashboard, Quan ly vao ra, Thong tin nguoi dung, Chi phi, Import du lieu
      allowedTitles = ['Thống kê', 'Nhân viên', 'Quản lý vào ra', 'Thông tin người dùng', 'Chi phí', 'Import dữ liệu'];
    } else if (isManager || isOnlyEmployee) {
      // isManager OR Only Employee -> Quan ly vao ra, Thong tin nguoi dung, Chi phi
      allowedTitles = ['Quản lý vào ra', 'Thông tin người dùng', 'Chi phí'];
    } else {
      // Default fallback
      allowedTitles = ['Thống kê', 'Quản lý vào ra', 'Thông tin người dùng'];
    }

    // Luu lai menu goc neu chua luu (tranh filter nhieu lan lam mat menu)
    if (!(this as any).originalMenus) {
      (this as any).originalMenus = [...this.menus];
    } else {
      this.menus = [...(this as any).originalMenus];
    }

    this.menus = this.menus.filter(item => allowedTitles.includes(item.title));
    console.log('Filtered Sidebar Menus:', this.menus);
  }

  private loadUserInfo(): void {
    const userInfo = this.authService.getUser();
    if (userInfo) {
      this.user = {
        fullName: userInfo.fullName || userInfo.username || 'User',
        userName: userInfo.username || 'User',
        email: userInfo.email || '',
        gender: userInfo.gender !== undefined ? userInfo.gender : true,
        image: userInfo.image || '',
        roles: userInfo.roles
      };
      console.log('✅ [LayoutFull] User info loaded:', this.user);
    }
  }

  private addTabFromCurrentRoute(): void {
    const currentUrl = this.router.url;
    this.addOrSelectTab(currentUrl);
  }

  private addOrSelectTab(url: string): void {
    if (url === '/login' || url === '/') {
      return;
    }

    const menuTitle = this.getMenuTitleFromUrl(url);
    const existingTabIndex = this.dynamicTabs.findIndex(tab => tab.url === url);

    if (existingTabIndex !== -1) {
      this.selectedTabIndex = existingTabIndex;
      this.dynamicTabs[existingTabIndex].active = true;
      this.dynamicTabs.forEach((tab, index) => {
        if (index !== existingTabIndex) {
          tab.active = false;
        }
      });
    } else {
      const newTab: Tab = {
        title: menuTitle,
        url: url,
        active: true
      };

      this.dynamicTabs.forEach(tab => tab.active = false);

      this.dynamicTabs.push(newTab);
      this.selectedTabIndex = this.dynamicTabs.length - 1;
    }
  }

  private getMenuTitleFromUrl(url: string): string {
    const titleMap: { [key: string]: string } = {
      '/dashboard': 'Thống kê',
      '/employee/employee-manage': 'Quản lý nhân viên',
      '/employee/department-manage': 'Quản lý phòng ban',
      '/employee/certificates-manage': 'Quản lý bằng cấp',
      '/gate-manage/leave-manage': 'Quản lý vắng mặt',
      '/gate-manage/special-schedule': 'Quản lý lịch đặc thù',
      '/gate-manage/timekeeping-explanation': 'Giải trình công',
      '/gate-manage/over-time-manage': 'Quản lý tăng ca',
      '/staffs/detail': 'Thông tin người dùng',
      '/import-vgov/attendance': 'Import dữ liệu công',
      '/import-vgov/leave-absence': 'Import dữ liệu KPI',
      '/setting/user-account': 'Quản lý người dùng',
      '/setting/approve-schedule-config': 'Thiết lập người duyệt',
      '/setting/activity-log': 'Lịch sử log',
      '/staff-cost': 'Chi phí',
      '/import-data/attendance': 'Import dữ liệu công',
      '/import-data/salary': 'Import dữ liệu lương',
    };

    return titleMap[url] || 'Tab mới';
  }

  onTabChange(event: any): void {
    const index = typeof event === 'number' ? event : event.index;
    if (index >= 0 && index < this.dynamicTabs.length) {
      const tab = this.dynamicTabs[index];
      this.router.navigateByUrl(tab.url);
    }
  }

  closeTab(index: number, event: Event): void {
    event.stopPropagation();

    if (this.dynamicTabs.length === 1) {
      return;
    }

    this.dynamicTabs.splice(index, 1);
    if (index === this.selectedTabIndex) {
      const newIndex = index > 0 ? index - 1 : 0;
      this.selectedTabIndex = newIndex;
      this.router.navigateByUrl(this.dynamicTabs[newIndex].url);
    } else if (index < this.selectedTabIndex) {
      this.selectedTabIndex--;
    }
  }

  getUserInitials(userName: string | undefined): string {
    if (!userName) return 'U';
    if (!userName.includes(' ')) {
      return userName.slice(0, 2).toUpperCase();
    }
    const words = userName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return userName.slice(0, 2).toUpperCase();
  }

  toggleCollapsed(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.nzPopoverUserVisible = false;
    this.router.navigate(['/login']);
  }

  handleChangePassword(): void {
    this.nzPopoverUserVisible = false;
    this.isVisibleChangePassword = true;
    this.initChangePasswordForm();
  }

  initChangePasswordForm(): void {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  handleCancelChangePassword(): void {
    this.isVisibleChangePassword = false;
    this.changePasswordForm.reset();
  }

  submitChangePassword(): void {
    if (this.changePasswordForm.invalid) {
      Object.values(this.changePasswordForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }

    this.isLoadingChangePassword = true;
    const { oldPassword, newPassword } = this.changePasswordForm.value;

    this.authService.changePassword(oldPassword, newPassword).subscribe(
      () => {
        this.isLoadingChangePassword = false;
        this.isVisibleChangePassword = false;
        this.notification.success('Thành công', 'Đổi mật khẩu thành công');
        this.changePasswordForm.reset();
      },
      (error) => {
        this.isLoadingChangePassword = false;
        this.notification.error('Thất bại', error.error?.message || 'Đổi mật khẩu thất bại, vui lòng thử lại sau');
      }
    );
  }

  popoverNotifyOnChangeShow(visible: boolean): void {
    if (visible) {
      // Load notifications
    }
  }

  changeTabNotify(index: number): void {
    this.indexTabNotifyActive = index;
  }

  updateReadAll(): void {
    this.dataNotify.forEach(n => n.readNotify = true);
    this.totalNewNotify = 0;
  }

  refreshNotify(): void {
    // Reload notifications
  }

  routerNotify(item: Notification): void {
    item.readNotify = true;
    this.totalNewNotify = Math.max(0, this.totalNewNotify - 1);
  }
}
