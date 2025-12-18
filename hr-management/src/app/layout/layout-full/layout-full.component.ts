import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CurrentUser, UiNavModel } from '../menu/menu.component';
import { IconHtml } from '../../modules/shares/enum/icon-html.enum';

interface Notification {
  id: string;
  title: string;
  message: string;
  staffId: string;
  createdDate: Date;
  readNotify: boolean;
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
        },
        {
          children: [],
          id: '104',
          level: 2,
          title: 'Thiết lập người duyệt',
          url: '/gate-manage/approve-schedule-config',
          roles: [],
        },
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
      htmlIcon: IconHtml.IMPORT,
      id: '12',
      level: 1,
      title: 'Import dữ liệu',
      url: '',
      roles: [],
      children: [
        // {
        //   icon: '',
        //   children: [],
        //   id: '120',
        //   level: 2,
        //   title: 'Import số lượng thực tập sinh',
        //   url: '/import/trainee',
        //   roles: [],
        // },
        // {
        //   icon: '',
        //   children: [],
        //   id: '121',
        //   level: 2,
        //   title: 'Import chi phí hỗ trợ thực tập sinh',
        //   url: '/import/trainee-cost',
        //   roles: [],
        // },
        {
          icon: '',
          children: [],
          id: '123',
          level: 2,
          title: 'Import dữ liệu công',
          url: '/import-vgov/attendance',
          roles: [],
        },
        {
          icon: '',
          children: [],
          id: '123',
          level: 2,
          title: 'Import dữ liệu KPI',
          url: '/import-vgov/leave-absence',
          roles: [],
        },
      ]
    },
    {
      htmlIcon: IconHtml.SETTING,
      id: '13',
      level: 1,
      title: 'Cài đặt hệ thống',
      url: '/settings/system-config',
      roles: [],
      children: [
        {
          icon: '',
          children: [],
          id: '130',
          level: 2,
          title: 'Thêm mới tài khoản',
          url: '/settings/add-account',
          roles: [],
        },
        {
          icon: '',
          children: [],
          id: '131',
          level: 2,
          title: 'Quản lý vai trò',
          url: '/settings/role-management',
          roles: [],
        },
        {
          icon: '',
          children: [],
          id: '132',
          level: 2,
          title: 'Thiết lâp người duyệt',
          url: '/settings/approver-setup',
          roles: [],
        },
        {
          icon: '',
          children: [],
          id: '133',
          level: 2,
          title: 'Lịch sử log',
          url: '/settings/activity-log',
          roles: [],
        }
      ]
    },
    // {
    //   icon: 'fa-money-bill',
    //   id: '1111',
    //   level: 1,
    //   url: '/staff-cost',
    //   title: 'Chi phí',
    //   // roles: ['ROLE_VIEW_COST']
    //   children: [
    //     {
    //       icon: '',
    //       children: [],
    //       id: '12',
    //       level: 2,
    //       title: 'Danh sách tổng lương',
    //       url: '/staff-cost',
    //       roles: [],
    //     },
    //     {
    //       icon: '',
    //       children: [],
    //       id: '13',
    //       level: 2,
    //       title: 'Lương bình quân',
    //       url: '/free-effort/standard-effort-price',
    //       roles: [],
    //     },
    //   ],
    // }
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
    // Initialize component
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
