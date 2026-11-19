// angular import
import { Component, Input, output } from '@angular/core';
import { RouterModule } from '@angular/router';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

/** Presenta el identificador visual de la aplicación en el menú. */
@Component({
  selector: 'app-nav-logo',
  imports: [SharedModule, RouterModule],
  templateUrl: './nav-logo.component.html',
  styleUrls: ['./nav-logo.component.scss']
})
export class NavLogoComponent {
  // public props
  @Input() navCollapsed: boolean;
  NavCollapse = output();
  windowWidth = window.innerWidth;

  // public method
  /** Abre o cierra el grupo seleccionado del menú. */
  navCollapse() {
    if (this.windowWidth >= 992) {
      this.navCollapsed = !this.navCollapsed;
      this.NavCollapse.emit();
    }
  }
}
