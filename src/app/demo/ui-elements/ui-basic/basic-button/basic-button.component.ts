import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';

/** Muestra ejemplos de botones de la interfaz. */
@Component({
  selector: 'app-basic-button',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './basic-button.component.html',
  styleUrls: ['./basic-button.component.scss']
})
export default class BasicButtonComponent {}
