import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CertificatesManageService } from '../certificates-manage.service';
import { finalize } from 'rxjs/operators';
import { differenceInCalendarDays } from 'date-fns';

@Component({
    selector: 'app-modal-add-certificate',
    templateUrl: './modal-add-certificate.component.html',
    styleUrls: ['./modal-add-certificate.component.scss']
})
export class ModalAddCertificateComponent implements OnInit {
    @Input() id: any;
    @Input() data: any;
    @Input() isHR: boolean = false;

    formGroup!: FormGroup;
    isLoading = false;

    constructor(
        private fb: FormBuilder,
        private modal: NzModalRef,
        private messageService: NzMessageService,
        private certificatesManageService: CertificatesManageService
    ) { }

    ngOnInit(): void {
        this.initForm();
        if (this.id && this.data) {
            this.patchData();
        }
    }

    initForm(): void {
        this.formGroup = this.fb.group({
            empCode: [null, [Validators.required]],
            name: [null, [Validators.required]],
            issuer: [null, [Validators.required]],
            issuedDate: [null, [Validators.required]],
            expiredDate: [null],
            note: [null]
        });
    }

    patchData(): void {
        this.formGroup.patchValue({
            empCode: this.data.employeeCode, // API response uses employeeCode, payload uses empCode. careful mapping.
            name: this.data.name,
            issuer: this.data.issuer,
            issuedDate: this.data.issuedDate,
            expiredDate: this.data.expiredDate,
            note: this.data.note
        });

        // If updating, maybe we shouldn't edit empCode? OR is it allowed?
        // Based on requirement, user sends empCode. 
        // If it's pure add, user enters empCode.
    }

    disabledDate = (current: Date): boolean => {
        // Can add logic if needed, e.g., expiredDate > issuedDate
        return false;
    };

    submitForm(): void {
        if (this.formGroup.invalid) {
            Object.values(this.formGroup.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
            return;
        }

        this.isLoading = true;
        const formValue = this.formGroup.value;

        // Format dates to YYYY-MM-DD
        const formatDate = (date: Date | string) => {
            if (!date) return null;
            const d = new Date(date);
            const year = d.getFullYear();
            const month = ('0' + (d.getMonth() + 1)).slice(-2);
            const day = ('0' + d.getDate()).slice(-2);
            return `${year}-${month}-${day}`;
        };

        const payload = {
            ...formValue,
            issuedDate: formatDate(formValue.issuedDate),
            expiredDate: formatDate(formValue.expiredDate)
        };

        if (this.id) {
            this.certificatesManageService.updateCertificateApi(this.id, payload)
                .pipe(finalize(() => this.isLoading = false))
                .subscribe(
                    (res) => {
                        this.messageService.success('Cập nhật chứng chỉ thành công!');
                        this.modal.destroy(true);
                    },
                    (err) => {
                        this.messageService.error('Cập nhật thất bại: ' + (err.error?.message || 'Lỗi hệ thống'));
                    }
                );
        } else {
            this.certificatesManageService.createCertificateApi(payload)
                .pipe(finalize(() => this.isLoading = false))
                .subscribe(
                    (res) => {
                        this.messageService.success('Thêm mới chứng chỉ thành công!');
                        this.modal.destroy(true);
                    },
                    (err) => {
                        this.messageService.error('Thêm mới thất bại: ' + (err.error?.message || 'Lỗi hệ thống'));
                    }
                );
        }
    }

    close(): void {
        this.modal.destroy();
    }
}
