import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { JamendoPageRoutingModule } from './jamendo-routing.module';

import { JamendoPage } from './jamendo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    JamendoPageRoutingModule
  ],
  declarations: [JamendoPage]
})
export class JamendoPageModule {}
