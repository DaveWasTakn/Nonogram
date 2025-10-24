import {Component, Inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton
  ],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss'
})
export class Dialog {

  constructor(private dialogRef: MatDialogRef<Dialog>, @Inject(MAT_DIALOG_DATA) public data: {
    title: string,
    content: string,
    showButtonOk: boolean,
    showButtonCancel: boolean
  }) {
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onOk(): void {
    this.dialogRef.close(true);
  }

}
