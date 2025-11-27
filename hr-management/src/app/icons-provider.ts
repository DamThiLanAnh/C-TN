import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import {
  MenuFoldOutline,
  MenuUnfoldOutline,
  FormOutline,
  DashboardOutline,
  HomeOutline,
  UserOutline,
  DownloadOutline,
  LeftOutline,
  RightOutline,
  CheckCircleOutline,
  CalendarOutline,
  TeamOutline,
  FileTextOutline,
  SettingOutline
} from '@ant-design/icons-angular/icons';
import { NzIconModule } from 'ng-zorro-antd/icon';

const icons = [
  MenuFoldOutline,
  MenuUnfoldOutline,
  DashboardOutline,
  FormOutline,
  HomeOutline,
  UserOutline,
  DownloadOutline,
  LeftOutline,
  RightOutline,
  CheckCircleOutline,
  CalendarOutline,
  TeamOutline,
  FileTextOutline,
  SettingOutline
];

export function provideNzIcons(): EnvironmentProviders {
  return importProvidersFrom(NzIconModule.forRoot(icons));
}
