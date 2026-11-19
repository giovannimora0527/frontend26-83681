// angular import
import { Component, output } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NavLogoComponent } from './nav-logo/nav-logo.component';
import { NavContentComponent } from './nav-content/nav-content.component';

/** Presenta el menú lateral de la aplicación. */
@Component({
  selector: 'app-navigation',
  imports: [SharedModule, NavLogoComponent, NavContentComponent],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  // public props
  NavCollapse = output();
  NavCollapsedMob = output();
  navCollapsed: boolean;
  navCollapsedMob: boolean;
  windowWidth: number;

  // constructor
  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor() {
    this.windowWidth = window.innerWidth;
    this.navCollapsedMob = false;
  }

  // public method
  /** Abre o cierra el grupo seleccionado del menú. */
  navCollapse() {
    if (this.windowWidth >= 992) {
      this.navCollapsed = !this.navCollapsed;
      this.NavCollapse.emit();
    }
  }

  /** Cambia la visibilidad del menú en pantallas pequeñas. */
  navCollapseMob() {
    if (this.windowWidth < 992) {
      this.NavCollapsedMob.emit();
    }
  }
}
