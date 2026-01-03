import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EmployeeManageService } from '../employee-manage.service';

@Component({
  selector: 'app-employee-add',
  templateUrl: './employee-add.component.html',
  styleUrls: ['./employee-add.component.scss'],
})
export class EmployeeAddComponent implements OnInit {
  @Input() item?: any;
  @Input() col: any;
  @Input() field: any[] = [];
  @Input() canEdit: boolean = true;
  @Input() isCopy: boolean = false;

  formGroup!: FormGroup;
  submitting = false;
  loading: boolean = false;
  avatarUrl?: any;
  departmentOptions: any[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private nzModalService: NzModalService,
    private modalRef: NzModalRef,
    private message: NzMessageService,
    private employeeManageService: EmployeeManageService
  ) { }

  private loadOptions(): void {
    // Fetch a large number of departments for the dropdown
    this.employeeManageService.getAllDepartments(0, 1000).subscribe(response => {
      const data = response?.content || [];
      this.departmentOptions = data.map((d: { name: string, id: number }) => ({
        label: d.name,
        value: d.id
      }));
    })
  }

  ngOnInit(): void {
    this.initForm();
    this.loadOptions();

    // Auto-generate email when fullName changes
    this.formGroup.get('fullName')?.valueChanges.subscribe((fullName: string) => {
      if (fullName && !this.item) { // Only auto-gen for new employees
        const generatedEmail = this.generateEmailFromFullName(fullName);
        // Use patchValue to update disabled control
        this.formGroup.patchValue({
          email: generatedEmail
        });
      }
    });

    if (this.item) {
      this.formGroup.patchValue({
        fullName: this.item.fullName,
        dateOfBirth: this.item.dateOfBirth,
        position: this.item.position || this.item.workPositionName,
        departmentId: this.item.departmentId || this.item.department,
        email: this.item.email,
        phoneNumber: this.item.phoneNumber || this.item.phone
      });

      this.avatarUrl = 'https://via.placeholder.com/150';
    }
  }

  initForm(): void {
    this.formGroup = this.formBuilder.group({
      fullName: [null, [Validators.required]],
      dateOfBirth: [null],  // API field name (optional)
      position: [null, [Validators.required]],  // API field name
      departmentId: [null, [Validators.required]],  // API field name - changed from department to departmentId
      email: [{ value: null, disabled: true }],  // Disabled - auto-generated from fullName
      phoneNumber: [null, [Validators.required]]  // API field name
    });

    if (!this.canEdit) {
      this.formGroup.disable();
    }
  }

  submitConfirm(): void {
    if (this.formGroup.invalid) {
      this.message.error('Vui lòng nhập đầy đủ các trường yêu cầu!');
      Object.values(this.formGroup.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.onSubmit();
  }

  onSubmit(): void {
    this.submitting = true;

    const formData = this.formGroup.getRawValue();

    if (formData.dateOfBirth && formData.dateOfBirth instanceof Date) {
      const year = formData.dateOfBirth.getFullYear();
      const month = String(formData.dateOfBirth.getMonth() + 1).padStart(2, '0');
      const day = String(formData.dateOfBirth.getDate()).padStart(2, '0');
      formData.dateOfBirth = `${year}-${month}-${day}`;
    }

    this.submitting = false;
    this.modalRef.close({ success: true, data: formData });
  }

  destroyModal(): void {
    if (this.canEdit && this.formGroup.dirty) {
      this.nzModalService.warning({
        nzTitle: 'Thông báo',
        nzContent: 'Bạn có chắc chắn muốn thoát không?',
        nzOkText: 'Có',
        nzCancelText: 'Không',
        nzOnOk: () => {
          this.modalRef.destroy();
        },
      });
    } else {
      this.modalRef.destroy();
    }
  }

  closeModel(): void {
    this.modalRef.destroy();
  }

  beforeUpload = (file: any): boolean => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.avatarUrl = e.target.result;
    };
    reader.readAsDataURL(file);
    return false;
  };

  /**
   * Generate email from Vietnamese full name
   * Example: "Phạm Mai Phương" -> "phuongpm"
   * Format: firstName + first letters of middle and last names (lowercase, no accents)
   */
  private generateEmailFromFullName(fullName: string): string {
    if (!fullName || !fullName.trim()) {
      return '';
    }

    // Remove extra spaces and split into words
    const words = fullName.trim().split(/\s+/);

    if (words.length === 0) {
      return '';
    }

    // Last word is the first name (tên)
    const firstName = words[words.length - 1];

    // Other words are middle and last names (họ đệm)
    const middleAndLastNames = words.slice(0, -1);

    // Get first letter of each middle/last name
    const initials = middleAndLastNames.map(word => word.charAt(0)).join('');

    // Combine: firstName + initials (all lowercase, no accents)
    const email = this.removeVietnameseAccents(firstName + initials).toLowerCase();

    return email;
  }

  /**
   * Remove Vietnamese accents from string
   */
  private removeVietnameseAccents(str: string): string {
    // Map of Vietnamese characters to their non-accented equivalents
    const accentsMap: { [key: string]: string } = {
      'à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ': 'a',
      'è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ': 'e',
      'ì|í|ị|ỉ|ĩ': 'i',
      'ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ': 'o',
      'ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ': 'u',
      'ỳ|ý|ỵ|ỷ|ỹ': 'y',
      'đ': 'd',
      'À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ': 'A',
      'È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ': 'E',
      'Ì|Í|Ị|Ỉ|Ĩ': 'I',
      'Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ': 'O',
      'Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ': 'U',
      'Ỳ|Ý|Ỵ|Ỷ|Ỹ': 'Y',
      'Đ': 'D'
    };

    for (const pattern in accentsMap) {
      str = str.replace(new RegExp(pattern, 'g'), accentsMap[pattern]);
    }

    return str;
  }
}

