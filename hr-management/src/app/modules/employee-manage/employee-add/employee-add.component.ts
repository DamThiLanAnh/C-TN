import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EmployeeManageService } from '../employee-manage.service';
import { GenderOptions, PositionOptions, Status } from '../../shares/enum/options.constants';

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

  readonly GenderOptions = GenderOptions;
  readonly PositionOptions = PositionOptions;
  readonly StatusOptions = Status;

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

    if (this.item) {
      // Map position "Trưởng phòng" to "TP" if needed, or if item.position is already "Trưởng phòng" and not in options.
      // Actually the Select value should match the Option value.
      // If JSON has "Trưởng phòng" but options are "TP", it won't select unless mapped.
      // Assuming "Trưởng phòng" corresponds to "TP" in our PositionOptions.
      // But let's check if the response is label or value.
      // JSON: "position": "Trưởng phòng". Constant: label "TP", value "TP".
      // Wait, "Trưởng phòng" maps to "TP" usually.
      // Let's try to find value by label 'Trưởng phòng'?? No, PositionOptions only has "TP" label.
      // Maybe the JSON "position" is the LABEL, and we want VALUE to bind.
      // Or maybe for "Trưởng phòng", let's assume it maps to "TP" value for now if exact match fails.
      // Actually, looking at PositionOptions: { label: 'TP', value: 'TP' }. 'TP' stands for Truong Phong.
      // If API returns "Trưởng phòng", we might need to map it manually or standardise.
      // For now, I will start binding what's there.

      let pos = this.item.position || this.item.workPositionName;
      if (pos === 'Trưởng phòng') pos = 'TP';

      this.formGroup.patchValue({

        fullName: this.item.fullName || this.item.name,
        dateOfBirth: this.item.dateOfBirth,
        gender: this.item.gender === 1 || this.item.gender === 'MALE' ? 'MALE' : (this.item.gender === 0 || this.item.gender === 'FEMALE' ? 'FEMALE' : null),
        citizenId: this.item.citizenId,
        phoneNumber: this.item.phoneNumber || this.item.phone,

        address: this.item.address || this.item.siteName,
        position: pos,
        departmentId: this.item.departmentId || this.item.department,
        status: this.item.status
      });

      this.avatarUrl = 'https://via.placeholder.com/150';
    }
  }

  initForm(): void {
    this.formGroup = this.formBuilder.group({
      fullName: [null, [Validators.required]],
      dateOfBirth: [null, [Validators.required]],
      gender: [null, [Validators.required]],
      citizenId: [null, [Validators.required]],
      phoneNumber: [null],
      address: [null],
      position: [null, [Validators.required]],
      departmentId: [null, [Validators.required]],
      status: ['ACTIVE', [Validators.required]]
    });

    // If viewing (not editing), disable is handled below, but maybe disable specific if needed.
    // User JSON: email is "teolv...".
    // Form init previously had email disabled. I'll keep it enabled for editing unless rule says otherwise.
    // Previous code: email: [{ value: null, disabled: true }] (auto-generated?)
    // If it's auto-generated, usually we don't edit it. But for "view", it should receive value.
    // I will set it as normal control but maybe disable if logic requires. For now, normal to show value.

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


  onEdit(): void {
    this.canEdit = true;
    this.formGroup.enable();
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

