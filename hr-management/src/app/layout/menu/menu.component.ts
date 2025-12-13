import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
// import { Observable, of } from 'rxjs';
import { Location } from '@angular/common'; // Sử dụng Location để xử lý URL

// Định nghĩa interface giả định cho Menu Model
export interface UiNavModel {
  id?: string;
  title: string;
  icon?: string;
  url?: string;
  roles?: string[];
  level?: number;
  htmlIcon?: string;
  disabled?: boolean;
  children?: UiNavModel[];
  // Thêm các thuộc tính khác nếu cần
}

// Định nghĩa interface giả định cho Current User
export interface CurrentUser {
  fullName: string;
  userName: string;
  email?: string;
  gender?: boolean; // true for male, false for female
  image?: string;
  roles?: string[]; // Giả định có roles
}

@Component({
  selector: 'vss-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit, OnChanges {

  @Input() contentTpl!: TemplateRef<any>
  @Input() extendStartTpl!: TemplateRef<any>
  @Input() extendEndTpl!: TemplateRef<any>
  /**
   * Template của popup thông tin người dùng hiện tại
   */
  @Input() popoverInfoUserTpl!: TemplateRef<any>
  @Input() logoUrl = '/assets/icons/logo-App.svg';
  @Input() isCollapsed = false;
  @Input() isHorizontal = false;
  @Input() numberOfAvatar = 2;
  @Input() sizeAvatar = 32;

  @Input() set listMenus(v: UiNavModel[]) {
    this._listMenus = v;
    console.log('Menu items:', v);
    v.forEach(menu => {
      if (menu.htmlIcon) {
        console.log('Menu with htmlIcon:', menu.title, 'has htmlIcon:', !!menu.htmlIcon);
      }
    });
  }
  @Input() username: CurrentUser | null = {
    fullName: 'Người dùng',
    userName: 'username.default',
    email: 'user@example.com',
    gender: true,
    image: ''
  };
  @Output() onLogout = new EventEmitter<any>();
  nzPopoverUserVisible = false;
  currentUser: CurrentUser | null = null;
  _listMenus: UiNavModel[] = [];

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private location: Location // Inject Location
  ) {
  }

  getSafeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  isFontAwesome(icon: string | undefined): boolean {
    if (!icon) return false;
    // Kiểm tra nếu icon bắt đầu bằng 'fa-' hoặc 'fas ', 'far ', 'fab ', etc.
    return icon.startsWith('fa-') || icon.startsWith('fas ') ||
           icon.startsWith('far ') || icon.startsWith('fab ') ||
           icon.startsWith('fal ') || icon.startsWith('fad ');
  }

  isImagePath(icon: string | undefined): boolean {
    if (!icon) return false;
    return icon.includes('/') || icon.includes('.svg') ||
           icon.includes('.png') || icon.includes('.jpg');
  }

  getFontAwesomeClass(icon: string): string {
    if (icon.includes(' ')) {
      return icon;
    }
    return 'fas ' + icon;
  }

  isSelected(item: any): any {
    return this.router.url.includes(item.url);
  }

  ngOnInit() {
    this.router.events.pipe(filter((value: any) => value instanceof NavigationEnd)).subscribe((route: NavigationEnd) => {
      // Logic nội bộ này phụ thuộc vào VssTabDynamicService đã bị loại bỏ.
      // Ta giữ lại phần cập nhật trang nếu cần, nhưng logic tìm kiếm menu item
      // sẽ bị đơn giản hóa hoặc loại bỏ nếu không dùng service nội bộ.
      // const menu = this.tabDynamicService.getDataRoutes();
      // const menuItem = menu.find(
      //   (t: any) => t.url === route?.urlAfterRedirects
      //     || t?.url_pattern?.test(route?.urlAfterRedirects)
      //     || t?.urlPattern?.test(route?.urlAfterRedirects)
      // );
      // this.tabDynamicService.setCurrentPage({
      //   ...menuItem,
      //   state: this.router.getCurrentNavigation()?.extras.state,
      //   url: route.urlAfterRedirects
      // });
    });
    this.currentUser = this.username;
  }

  ngOnChanges(changes: SimpleChanges) {
    // if (!changes?.listMenus?.firstChange) {
    //   // Logic nội bộ này phụ thuộc vào VssTabDynamicService đã bị loại bỏ.
    //   // const menuItem = this.tabDynamicService.getDataRoutes()
    //   //   .find(x => x.url === this.router.url || x?.url_pattern?.test(this.router.url) || x?.urlPattern?.test(this.router.url));
    //   // this.tabDynamicService.setCurrentPage({ ...menuItem, url: this.router.url });
    //   this.tabDynamicService.setCurrentPage({ url: this.router.url }); // Giữ lại phần cập nhật URL
    // }
  }

  clickItem(item: any) {
    if (item.url) {
      if (/^(http:\/\/|https:\/\/|www\.)/g.test(item.url)) {
        window.open(item.url, '_blank')
      } else {
        this.router.navigateByUrl(item.url);
      }
    }
  }

  changeExpand() {
    this.isCollapsed = !this.isCollapsed
  }


  logout() {
    this.onLogout.emit();
  }

  isAuthorized(roles: string[] | undefined): boolean {
    // Nếu không có role nào được yêu cầu, luôn được phép truy cập
    if (!roles || roles.length === 0) {
      return true;
    }
    // Logic kiểm tra quyền thực tế của bạn sẽ nằm ở đây
    // Giả định người dùng luôn có quyền cho mục đích demo/thay thế
    // Thay thế bằng logic kiểm tra role của currentUser
    // Ví dụ: return this.currentUser?.roles?.some(r => roles.includes(r)) || false;
    return true;
  }
}
