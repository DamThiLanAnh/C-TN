import { Component, OnInit } from '@angular/core';
import { StaffsService } from '../staffs.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-staff-detail',
  templateUrl: './staff-detail.component.html',
  styleUrls: ['./staff-detail.component.scss']
})
export class StaffDetailComponent implements OnInit {
  select = 'Thông tin người dùng';
  isLoading = false;
  isUser = true;
  isEdit = false;
  keyword = '';
  countSkill = 15;
  userName = 'nguyenvana';
  dateHistoryReview: Date = new Date();

  avatarText = 'NVA';
  avatarUrl = '';

  dataDetail: any = {
    full_name: '',
    user_name: '',
    position_name: '',
    organization_name: '',
    dob: null,
    gender: true,
    phone: '',
    email: '',
    status: 1,
    entryDate: null,
    siteName: '',
    universityName: '',
    majorEduName: '',
    eduLevelName: ''
  };

  listSkillFilter = [
    {
      id: 1,
      skillName: 'Angular',
      level: 4,
      category: 'Frontend',
      experience: '3 năm'
    },
    {
      id: 2,
      skillName: 'TypeScript',
      level: 4,
      category: 'Programming Language',
      experience: '3 năm'
    },
    {
      id: 3,
      skillName: 'Node.js',
      level: 3,
      category: 'Backend',
      experience: '2 năm'
    },
    {
      id: 4,
      skillName: 'Docker',
      level: 3,
      category: 'DevOps',
      experience: '1.5 năm'
    },
    {
      id: 5,
      skillName: 'PostgreSQL',
      level: 3,
      category: 'Database',
      experience: '2 năm'
    }
  ];


  listOfData = [
    {
      id: 1,
      reviewDate: new Date('2023-06-30'),
      reviewer: 'Trần Văn B',
      period: 'Q2 2023',
      rating: 4.5,
      comment: 'Hiệu suất làm việc tốt, đạt được các mục tiêu đề ra'
    },
    {
      id: 2,
      reviewDate: new Date('2023-12-31'),
      reviewer: 'Lê Thị C',
      period: 'Q4 2023',
      rating: 4.8,
      comment: 'Xuất sắc trong công việc, có nhiều đóng góp cho team'
    }
  ];

  col2 = [
    {title: 'Kỳ đánh giá', key: 'period'},
    {title: 'Ngày đánh giá', key: 'reviewDate'},
    {title: 'Người đánh giá', key: 'reviewer'},
    {title: 'Điểm', key: 'rating'},
    {title: 'Nhận xét', key: 'comment'}
  ];


  constructor(
    private staffsService: StaffsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
        const id = params['id'] || 2; // Default to 2 if no ID provided, as per user request
        this.loadEmployeeDetail(id);
    });
  }

  loadEmployeeDetail(id: number) {
      this.isLoading = true;
      this.staffsService.getEmployeeDetail(id).subscribe((res: any) => {
          this.isLoading = false;
          const data = res.data || res;
          if (data) {
              this.dataDetail = {
                  full_name: data.fullName || data.name || data.full_name,
                  user_name: data.username || data.user_name,
                  position_name: data.positionName || data.position?.name || data.position_name,
                  organization_name: data.departmentName || data.organization?.name || data.organization_name,
                  dob: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                  gender: data.gender === 'Nam' || data.gender === true || data.gender === 1,
                  phone: data.phoneNumber || data.phone,
                  email: data.email,
                  status: data.status,
                  entryDate: data.createdAt ? new Date(data.createdAt) : null,
                  siteName: data.siteName || data.address,
                  universityName: data.universityName,
                  majorEduName: data.majorEduName,
                  eduLevelName: data.eduLevelName
              };
              
              if (this.dataDetail.full_name) {
                  const names = this.dataDetail.full_name.split(' ');
                  if (names.length > 0) {
                      this.avatarText = names[names.length - 1][0].toUpperCase();
                      if (names.length > 1) {
                          this.avatarText = names[0][0].toUpperCase() + this.avatarText;
                      }
                  }
              }
          }
      }, (err) => {
          this.isLoading = false;
      });
  }

  change(value: string): void {
    this.select = value;
  }

  startEditInfor(): void {
    console.log('Edit thông tin cá nhân');
  }

  startEdit(): void {
    this.isEdit = true;
  }


  searchSkills(): void {
    if (this.keyword.trim()) {
      this.listSkillFilter = this.listSkillFilter.filter(skill =>
        skill.skillName.toLowerCase().includes(this.keyword.toLowerCase())
      );
    } else {
      this.listSkillFilter = [...this.listSkillFilter];
    }
  }

  getNameStatus(status: number): string {
    const statusMap: { [key: number]: string } = {
      1: 'Đang làm việc',
      2: 'Nghỉ việc',
      3: 'Tạm nghỉ'
    };
    return statusMap[status] || 'Không xác định';
  }

  onChangeDate(date: Date): void {
    this.dateHistoryReview = date;
    // Load lại data theo năm
  }

  onFilterInTable(event: any): void {
    console.log('Filter:', event);
  }

  onSelectLinkItem(event: any): void {
    console.log('Select item:', event);
  }
}
