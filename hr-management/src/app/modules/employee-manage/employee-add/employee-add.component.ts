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
  ) {}

  private  loadOptions(): void {
    this.employeeManageService.getAllDepartments().subscribe(data => {
      this.departmentOptions = data?.map((d: { name: string, id: number }) => ({
        label: d.name,
        value: d.id
      }));
    })
  }

  ngOnInit(): void {
    this.initForm();
    this.loadOptions();
    if (this.item) {
      this.formGroup.patchValue({
        code: this.item.code || this.item.userName,
        fullName: this.item.fullName,
        dateOfBirth: this.item.dateOfBirth,
        position: this.item.position || this.item.workPositionName,
        department: this.item.department || this.item.organizationName,
        email: this.item.email,
        phoneNumber: this.item.phoneNumber || this.item.phone
      });

      if (!this.isCopy) {
        this.formGroup.get('code')?.disable();
      }

      this.avatarUrl = 'https://via.placeholder.com/150';
    }
  }

  initForm(): void {
    this.formGroup = this.formBuilder.group({
      code: [null, [Validators.required]],  // API field name
      fullName: [null, [Validators.required]],
      dateOfBirth: [null],  // API field name (optional)
      position: [null, [Validators.required]],  // API field name
      department: [null, [Validators.required]],  // API field name
      email: [null, [Validators.required, Validators.email]],
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
}

