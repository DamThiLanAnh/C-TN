import { EnvironmentProviders, importProvidersFrom } from '@angular/core';
import {
  CalendarOutline,
  CheckCircleOutline,
  DashboardOutline,
  DownloadOutline,
  FileTextOutline,
  FormOutline,
  HomeOutline,
  LeftOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  RightOutline,
  SettingOutline,
  TeamOutline,
  UserOutline
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
