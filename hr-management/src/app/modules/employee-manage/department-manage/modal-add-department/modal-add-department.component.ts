import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DepartmentManageService } from '../department-manage.service';

@Component({
  selector: 'app-modal-add-department',
  templateUrl: './modal-add-department.component.html',
  styleUrls: ['./modal-add-department.component.scss']
})
export class ModalAddDepartmentComponent implements OnInit {
  addForm!: FormGroup;
  loading = false;
  id: any; // Input param
  data: any; // Input param for pre-fill

  constructor(
    private fb: FormBuilder,
    private modalRef: NzModalRef,
    private message: NzMessageService,
    private departmentManageService: DepartmentManageService
  ) { }

  ngOnInit(): void {
    this.addForm = this.fb.group({
      // code: [null, [Validators.required]],
      name: [null, [Validators.required]],
      description: [null],
      status: [true, [Validators.required]]
    });

    if (this.data) {
      this.patchData(this.data);
    } else if (this.id) {
      // If only ID is passed, fetch data
      this.fetchDetail(this.id);
    }
  }

  fetchDetail(id: any): void {
    this.departmentManageService.getDepartmentByIdApi(id).subscribe(res => {
      this.data = res;
      this.patchData(res);
    });
  }

  patchData(data: any): void {
    let isActive = true; // Default

    // Determine boolean value from various possible backend fields
    if (data.active !== undefined && data.active !== null) {
      isActive = data.active;
    } else if (data.isActive !== undefined && data.isActive !== null) {
      isActive = Boolean(data.isActive); // handle 1/0 or true/false
    } else if (data.status !== undefined && data.status !== null) {
      // Handle string status if backend mixes them
      if (data.status === 'INACTIVE' || data.status === 0 || data.status === '0') isActive = false;
    }

    this.addForm.patchValue({
      // code: data.code,
      name: data.name,
      description: data.description,
      status: isActive // Set boolean directly
    });
  }

  submit(): void {
    if (this.addForm.invalid) {
      Object.values(this.addForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      return;
    }
    this.loading = true;

    // Prepare payload explicitly
    const formValue = this.addForm.getRawValue();
    const payload = {
      id: this.id,
      name: formValue.name,
      description: formValue.description,
      active: formValue.status
    };
    if (this.id) {
      this.departmentManageService.updateDepartmentApi(this.id, payload)
        .subscribe({
          next: () => {
            this.message.success('Cập nhật phòng ban thành công!');
            this.modalRef.close(true);
          },
          error: (err) => {
            this.message.error('Cập nhật thất bại: ' + (err.error?.message || 'Lỗi hệ thống'));
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
    } else {
      this.departmentManageService.createDepartmentApi(payload)
        .subscribe({
          next: () => {
            this.message.success('Thêm mới phòng ban thành công!');
            this.modalRef.close(true);
          },
          error: (err) => {
            this.message.error('Thêm mới thất bại: ' + (err.error?.message || 'Lỗi hệ thống'));
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
    }
  }

  close(): void {
    this.modalRef.close(false);
  }
}
