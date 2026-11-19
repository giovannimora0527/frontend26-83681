// angular import
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

// project import
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { NavigationComponent } from './navigation/navigation.component';
import { ConfigurationComponent } from 'src/app/theme/layout/admin/configuration/configuration.component';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs/breadcrumbs.component';

/** Contiene la navegación y las pantallas que se abren con una sesión. */
@Component({
  selector: 'app-admin',
  imports: [NavBarComponent, NavigationComponent, RouterModule, CommonModule, ConfigurationComponent, BreadcrumbsComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {
  private readonly router = inject(Router);
  /** Abre la documentación de la API configurada para el entorno local. */
  readonly swaggerUrl = environment.swaggerUrl;

  // public props
  navCollapsed: any;
  navCollapsedMob: boolean;
  windowWidth: number;

  // constructor
  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor() {
    this.windowWidth = window.innerWidth;
    this.navCollapsedMob = false;
  }

  /** Comprueba si la interfaz está en la pantalla de inicio. */
  get isHome(): boolean {
    return this.router.url === '/inicio';
  }

  // public method
  /** Cambia la visibilidad de la navegación en una pantalla pequeña. */
  navMobClick() {
    if (this.navCollapsedMob && !document.querySelector('app-navigation.pcoded-navbar')?.classList.contains('mob-open')) {
      this.navCollapsedMob = !this.navCollapsedMob;
      setTimeout(() => {
        this.navCollapsedMob = !this.navCollapsedMob;
      }, 100);
    } else {
      this.navCollapsedMob = !this.navCollapsedMob;
    }
  }

  // this is for eslint rule
  /** Atiende la tecla usada para controlar la navegación. */
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeMenu();
    }
  }

  /** Cierra el menú de navegación abierto. */
  closeMenu() {
    const navigation = document.querySelector('app-navigation.pcoded-navbar');
    if (navigation?.classList.contains('mob-open')) {
      navigation.classList.remove('mob-open');
    }
  }
}
