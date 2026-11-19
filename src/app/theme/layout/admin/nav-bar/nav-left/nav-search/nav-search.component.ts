// angular import
import { Component } from '@angular/core';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';

/** Presenta el control de búsqueda de la barra de navegación. */
@Component({
  selector: 'app-nav-search',
  imports: [SharedModule],
  templateUrl: './nav-search.component.html',
  styleUrls: ['./nav-search.component.scss']
})
export class NavSearchComponent {
  // public props
  searchInterval;
  searchWidth: number;
  searchWidthString: string;

  // constructor
  /** Recibe los servicios y prepara el estado inicial del componente. */
  constructor() {
    this.searchWidth = 0;
  }

  // public method
  /** Abre el cuadro de búsqueda de la barra de navegación. */
  searchOn() {
    document.querySelector('#main-search').classList.add('open');
    this.searchInterval = setInterval(() => {
      if (this.searchWidth >= 170) {
        clearInterval(this.searchInterval);
        // return false;
      }
      this.searchWidth = this.searchWidth + 30;
      this.searchWidthString = this.searchWidth + 'px';
    }, 35);
  }

  /** Cierra el cuadro de búsqueda de la barra de navegación. */
  searchOff() {
    this.searchInterval = setInterval(() => {
      if (this.searchWidth <= 0) {
        document.querySelector('#main-search').classList.remove('open');
        clearInterval(this.searchInterval);
        // return false;
      }
      this.searchWidth = this.searchWidth - 30;
      this.searchWidthString = this.searchWidth + 'px';
    }, 35);
  }
}
