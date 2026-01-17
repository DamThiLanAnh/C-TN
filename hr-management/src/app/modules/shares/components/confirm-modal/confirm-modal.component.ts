import { Component, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
    selector: 'app-confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {
    @Input() type: 'approve' | 'reject' = 'approve';
    @Input() title: string = '';
    @Input() content: string = '';
    @Input() requireReason: boolean = false;

    reason: string = '';
    reasonError: boolean = false;

    constructor(private modal: NzModalRef) { }

    ngOnInit(): void {
    }

    onCancel(): void {
        this.modal.destroy({ success: false });
    }

    onConfirm(): void {
        if (this.requireReason && (!this.reason || !this.reason.trim())) {
            this.reasonError = true;
            return;
        }
        this.modal.destroy({ success: true, reason: this.reason });
    }
}
