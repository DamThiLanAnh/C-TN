import { Component, OnInit } from '@angular/core';

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

  dataDetail = {
    full_name: 'Nguyễn Văn A',
    user_name: 'nguyenvana',
    position_name: 'Senior Developer',
    organization_name: 'Phòng Phát triển Phần mềm',
    dob: new Date('1990-05-15'),
    gender: true, // true = Nam, false = Nữ
    phone: '0123456789',
    email: 'nguyenvana@company.com',
    status: 1, // 1 = Đang làm việc
    entryDate: new Date('2020-01-15'),
    siteName: 'Hà Nội',
    universityName: 'Đại học Bách Khoa Hà Nội',
    majorEduName: 'Công nghệ thông tin',
    eduLevelName: 'Đại học'
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


  ngOnInit(): void {
    // Load data nếu cần
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
