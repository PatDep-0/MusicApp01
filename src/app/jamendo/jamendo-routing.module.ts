import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { JamendoPage } from './jamendo.page';

const routes: Routes = [
  {
    path: '',
    component: JamendoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JamendoPageRoutingModule {}
