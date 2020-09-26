import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule,
  MatToolbarModule,
  MatIconModule,
  MatBadgeModule,
  MatSidenavModule,
  MatListModule,
  MatGridListModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatRadioModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatChipsModule,
  MatTooltipModule,
  MatTableModule,
  MatPaginatorModule,
  MatCardModule,
  MatMenuModule,
  MatTextColumn
} from '@angular/material';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatTabsModule } from '@angular/material/tabs';

import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  imports: [
    MatCardModule,
    MatMenuModule,
    CommonModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatBadgeModule,
    MatListModule,
    MatGridListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatTableModule,
    FlexLayoutModule,
    MatSidenavModule,
    MatMenuModule,
    MatDialogModule,
    MatTabsModule,
    MatExpansionModule
  ],
  exports: [
    MatMenuModule,
    MatCardModule,
    MatMenuModule,
    FlexLayoutModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatBadgeModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatChipsModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatDialogModule,
    MatTabsModule,
    MatExpansionModule
  ],
  providers: [MatDatepickerModule]
})
export class AngularMaterialModule {}
