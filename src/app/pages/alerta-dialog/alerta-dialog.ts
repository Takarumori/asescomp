import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-alerta-dialog',
  imports:
    [
      MatDialogModule,
      MatButtonModule,
      MatButtonModule,
      MatIconModule
    ],
  templateUrl: './alerta-dialog.html',
  styleUrl: './alerta-dialog.css',
})
export class AlertaDialog {
  constructor(
    private dialogRef: MatDialogRef<AlertaDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { campos: string[] }
  ) { }

  cerrar(): void {
    this.dialogRef.close();
  }
}
