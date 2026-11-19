import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';

/** Muestra ejemplos de etiquetas de estado. */
@Component({
  selector: 'app-basic-badge',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './basic-badge.component.html',
  styleUrls: ['./basic-badge.component.scss']
})
export default class BasicBadgeComponent {}
