import { Component, OnDestroy, ViewEncapsulation, inject, input } from '@angular/core';
import { Spinkit } from './spinkits';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

/** Muestra el indicador de carga de la interfaz. */
@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss', './spinkit-css/sk-line-material.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SpinnerComponent implements OnDestroy {
  private router = inject(Router);

  isSpinnerVisible = true;
  Spinkit = Spinkit;
  readonly backgroundColor = input('#1dc4e9');
  readonly spinner = input(Spinkit.skLine);
  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor() {
    this.router.events.subscribe(
      (event) => {
        if (event instanceof NavigationStart) {
          this.isSpinnerVisible = true;
        } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
          this.isSpinnerVisible = false;
        }
      },
      () => {
        this.isSpinnerVisible = false;
      }
    );
  }

  /** Libera los recursos que se usaron mientras la pantalla estaba abierta. */
  ngOnDestroy(): void {
    this.isSpinnerVisible = false;
  }
}
