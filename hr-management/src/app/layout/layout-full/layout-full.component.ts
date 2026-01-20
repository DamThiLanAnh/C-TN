import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CurrentUser, UiNavModel } from '../menu/menu.component';
import { IconHtml } from '../../modules/shares/enum/icon-html.enum';
import { filter, debounceTime, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AllNotificationService, Notification } from '../../services/all-notification.service';
import { Subject } from 'rxjs'; // Add Subject import

interface UINotification extends Notification {
  staffId?: string;
  message?: string;
  createdDate?: Date;
  readNotify?: boolean;
  senderName?: string;
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
export class LayoutFullComponent implements OnInit, OnDestroy {
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
  totalNewNotify = 0;
  totalAllNotify = 0;
  indexSysNotifyActivate = 0;
  indexTabNotifyActive = 0;
  isLoadingNotify = false;

  sysNotification = [
    {
      label: 'Hệ thống',
      totalNewNotify: 0,
      totalAllNotify: 0
    },
    {
      label: 'Cá nhân',
      totalNewNotify: 0,
      totalAllNotify: 0
    }
  ];

  tabs = [
    { name: 'Chưa đọc', textCount: 'totalNewNotify' },
    { name: 'Tất cả', textCount: 'totalAllNotify' }
  ];

  dataNotify: UINotification[] = [];
  allDataNotify: UINotification[] = []; // Store all notifications

  private notifyRefreshSubject = new Subject<void>();
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private notification: NzNotificationService,
    private allNotificationService: AllNotificationService
  ) {
  }

  ngOnInit(): void {

    this.loadUserInfo();
    this.filterMenuByRole();

    this.addTabFromCurrentRoute();

    // Setup debounce for notifications
    this.notifyRefreshSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.doLoadNotifications();
    });

    if (this.router.url.includes('/staffs/detail')) {
      this.loadNotifications();
    }

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event) => {
      const navEvent = event as NavigationEnd;
      this.addOrSelectTab(navEvent.urlAfterRedirects);

      // Check for specific route to trigger notification refresh
      if (navEvent.urlAfterRedirects.includes('/staffs/detail')) {
        this.loadNotifications();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  onPopoverVisibleChange(visible: boolean): void {
    this.nzPopoverVisible = visible;
    if (visible && this.indexSysNotifyActivate === 1) {
      this.loadNotifications();
    }
  }

  onSysTabChange(params: any): void {
    const index = params.index;
    this.indexSysNotifyActivate = index;
    if (index === 1) {
      this.loadNotifications();
    } else {
      this.dataNotify = [];
    }
  }

  loadNotifications(): void {
    this.notifyRefreshSubject.next();
  }

  private doLoadNotifications(): void {
    this.isLoadingNotify = true;
    this.allNotificationService.getNotifications().subscribe(
      (data) => {
        this.isLoadingNotify = false;
        this.allDataNotify = data.map(item => ({
          ...item,
          message: this.formatMessageDate(item.content),
          createdDate: new Date(item.createdAt),
          readNotify: item.isRead,
          staffId: '', // API does not return staffId yet
          senderName: this.extractEmployeeName(item.content)
        }));
        this.totalAllNotify = this.allDataNotify.length;
        this.totalNewNotify = this.allDataNotify.filter(n => !n.readNotify).length;

        // Initial load based on current tab
        this.filterNotifications();
      },
      (error) => {
        this.isLoadingNotify = false;
        console.error('Error fetching notifications:', error);
      }
    );
  }

  filterNotifications(): void {
    if (this.indexTabNotifyActive === 0) {
      // Unread tab
      this.dataNotify = this.allDataNotify.filter(n => !n.readNotify);
    } else {
      // All tab
      this.dataNotify = [...this.allDataNotify];
    }
  }

  private formatMessageDate(content: string): string {
    if (!content) return '';
    // Identify date pattern YYYY-MM-DD
    const datePattern = /(\d{4})-(\d{2})-(\d{2})/g;
    return content.replace(datePattern, (match, year, month, day) => {
      return `${day}/${month}/${year}`;
    });
  }

  private extractEmployeeName(content: string): string {
    if (!content) return '';
    const match = content.match(/^Nhân viên (.+?) (đã|gửi|yêu cầu)/);
    return match ? match[1] : '';
  }

  changeTabNotify(params: any): void {
    const index = params.index;
    this.indexTabNotifyActive = index;
    this.filterNotifications();
  }

  getNotificationLabel(type: string): string {
    const typeMapping: { [key: string]: string } = {
      'EXPLANATION_REQUEST': 'Giải trình',
      'LEAVE_REQUEST': 'Đơn nghỉ phép',
      'OVERTIME_REQUEST': 'Làm thêm giờ',
      'Compensatory_LEAVE': 'Nghỉ bù',
      'LATE_EARLY_REQUEST': 'Đi muộn về sớm',
    };
    return typeMapping[type] || 'Thông báo';
  }

  updateReadAll(): void {
    this.allNotificationService.markAllAsRead().subscribe({
      next: () => {
        this.allDataNotify.forEach(n => {
          n.readNotify = true;
          n.isRead = true;
        });
        this.totalNewNotify = 0;
        this.filterNotifications();
        this.notification.success('Thành công', 'Đã đánh dấu tất cả là đã đọc');
      },
      error: (err) => console.error('Error marking all as read', err)
    });
  }

  refreshNotify(): void {
    this.loadNotifications();
  }

  routerNotify(item: UINotification): void {
    if (!item.readNotify) {
      this.allNotificationService.markAsRead(item.id).subscribe({
        next: () => {
          item.readNotify = true;
          item.isRead = true; // Update original property too if needed
          this.totalNewNotify = Math.max(0, this.totalNewNotify - 1);
          this.filterNotifications(); // Refresh list to remove from 'Unread' tab if needed
        },
        error: (err) => console.error('Error marking as read', err)
      });
    } else {
      // Already read, just navigate or whatever logic needed
    }
    // Add navigation logic here if applicable, for now it just marks as read
  }
}
