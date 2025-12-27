import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CurrentUser, UiNavModel } from '../menu/menu.component';
import { IconHtml } from '../../modules/shares/enum/icon-html.enum';
import { filter } from 'rxjs/operators';

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

  // Dynamic Tabs management
  dynamicTabs: Tab[] = [];
  selectedTabIndex = 0;

  menus: UiNavModel[] = [
    {
      htmlIcon: IconHtml.HOME,
      title: 'Trang chủ',
      id: '1',
      level: 1,
      url: '/welcome',
      roles: [],
      children: []
    },
    {
      htmlIcon: IconHtml.EMPLOYEE,
      title: 'Nhân viên',
      level: 1,
      url: '/employee-manage',
      roles: [],
      children: []
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
        }
      ]
    },
    {
      htmlIcon: IconHtml.STAFF,
      children: [],
      id: '11',
      level: 1,
      title: 'Thông tin người dùng',
      url: '/staffs/user-information',
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
          id: '123',
          level: 2,
          title: 'Import dữ liệu vào ra',
          url: '/import-data/check-in-out',
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
          title: 'Thêm mới tài khoản',
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
    {name: 'Chưa đọc', textCount: 'totalNewNotify'},
    {name: 'Tất cả', textCount: 'totalAllNotify'}
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
    private router: Router
  ) {
  }

  ngOnInit(): void {
    console.log('🔍 [LayoutFull] ngOnInit called');

    // Initialize with current route
    this.addTabFromCurrentRoute();
    console.log('🔍 [LayoutFull] Initial tabs:', this.dynamicTabs);

    // Listen to route changes and add/switch tabs
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      const navEvent = event as NavigationEnd;
      console.log('🔍 [LayoutFull] Route changed to:', navEvent.urlAfterRedirects);
      this.addOrSelectTab(navEvent.urlAfterRedirects);
      console.log('🔍 [LayoutFull] Tabs after route change:', this.dynamicTabs);
    });
  }

  private addTabFromCurrentRoute(): void {
    const currentUrl = this.router.url;
    this.addOrSelectTab(currentUrl);
  }

  private addOrSelectTab(url: string): void {
    console.log('🔍 [addOrSelectTab] URL:', url);

    // Skip login or other non-content routes
    if (url === '/login' || url === '/') {
      console.log('⏭️ [addOrSelectTab] Skipped (login or root)');
      return;
    }

    // Get menu title for this URL
    const menuTitle = this.getMenuTitleFromUrl(url);
    console.log('🔍 [addOrSelectTab] Title:', menuTitle);

    // Check if tab already exists
    const existingTabIndex = this.dynamicTabs.findIndex(tab => tab.url === url);

    if (existingTabIndex !== -1) {
      // Tab exists, just select it
      console.log('✅ [addOrSelectTab] Tab exists at index:', existingTabIndex);
      this.selectedTabIndex = existingTabIndex;
      this.dynamicTabs[existingTabIndex].active = true;
      this.dynamicTabs.forEach((tab, index) => {
        if (index !== existingTabIndex) {
          tab.active = false;
        }
      });
    } else {
      // Create new tab
      console.log('➕ [addOrSelectTab] Creating new tab');
      const newTab: Tab = {
        title: menuTitle,
        url: url,
        active: true
      };

      // Deactivate all dynamicTabs
      this.dynamicTabs.forEach(tab => tab.active = false);

      // Add new tab
      this.dynamicTabs.push(newTab);
      this.selectedTabIndex = this.dynamicTabs.length - 1;
      console.log('✅ [addOrSelectTab] New tab added. Total tabs:', this.dynamicTabs.length);
    }
  }

  private getMenuTitleFromUrl(url: string): string {
    // Map URLs to titles
    const titleMap: { [key: string]: string } = {
      '/welcome': 'Trang chủ',
      '/employee-manage': 'Nhân viên',
      '/gate-manage/leave-manage': 'Quản lý vắng mặt',
      '/gate-manage/special-schedule': 'Quản lý lịch đặc thù',
      '/gate-manage/timekeeping-explanation': 'Giải trình công',
      '/staffs/user-information': 'Thông tin người dùng',
      '/import-vgov/attendance': 'Import dữ liệu công',
      '/import-vgov/leave-absence': 'Import dữ liệu KPI',
      '/setting/user-account': 'Thêm mới tài khoản',
      '/setting/approve-schedule-config': 'Thiết lập người duyệt',
      '/setting/activity-log': 'Lịch sử log'
    };

    return titleMap[url] || 'Tab mới';
  }

  onTabChange(event: any): void {
    console.log('🔄 [onTabChange] Event:', event);
    const index = typeof event === 'number' ? event : event.index;
    console.log('🔄 [onTabChange] Tab index:', index);

    if (index >= 0 && index < this.dynamicTabs.length) {
      const tab = this.dynamicTabs[index];
      console.log('🔄 [onTabChange] Navigating to:', tab.url);
      this.router.navigateByUrl(tab.url);
    }
  }

  closeTab(index: number, event: Event): void {
    console.log('❌ [closeTab] Closing tab at index:', index, 'Total tabs:', this.dynamicTabs.length);
    event.stopPropagation();

    // Don't close if it's the only tab
    if (this.dynamicTabs.length === 1) {
      console.log('⚠️ [closeTab] Cannot close - only 1 tab left');
      return;
    }

    // Remove the tab
    this.dynamicTabs.splice(index, 1);
    console.log('✅ [closeTab] Tab removed. Remaining tabs:', this.dynamicTabs.length);

    // Adjust selected index
    if (index === this.selectedTabIndex) {
      // If closing the active tab, navigate to the previous or next tab
      const newIndex = index > 0 ? index - 1 : 0;
      this.selectedTabIndex = newIndex;
      console.log('🔄 [closeTab] Navigating to tab at index:', newIndex);
      this.router.navigateByUrl(this.dynamicTabs[newIndex].url);
    } else if (index < this.selectedTabIndex) {
      // If closing a tab before the active one, adjust index
      this.selectedTabIndex--;
      console.log('🔄 [closeTab] Adjusted selected index to:', this.selectedTabIndex);
    }
  }

  getUserInitials(userName: string | undefined): string {
    if (!userName) return 'U';
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
    // Implement change password logic
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
