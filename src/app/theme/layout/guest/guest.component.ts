// angular import
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

/** Contiene las pantallas a las que se accede sin iniciar sesión. */
@Component({
  selector: 'app-guest',
  imports: [RouterModule],
  templateUrl: './guest.component.html',
  styleUrls: ['./guest.component.scss']
})
export class GuestComponent {}
