import { Component } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';

/** Muestra ejemplos de los estilos tipográficos de la interfaz. */
@Component({
  selector: 'app-basic-typography',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './basic-typography.component.html',
  styleUrls: ['./basic-typography.component.scss']
})
export default class BasicTypographyComponent {}
