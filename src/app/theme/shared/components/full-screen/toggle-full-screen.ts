// Angular import
import { Directive, ElementRef, HostListener, inject } from '@angular/core';

// project import
import screenfull from 'screenfull';

/** Permite alternar entre la vista normal y el modo de pantalla completa. */
@Directive({
  selector: '[appToggleFullScreen]'
})
export class ToggleFullScreenDirective {
  private elements = inject(ElementRef);

  // public method
  /** Atiende el clic en el control de pantalla completa. */
  @HostListener('click')
  onClick() {
    if (screenfull.isEnabled) {
      this.elements.nativeElement.querySelector('.feather').classList.toggle('icon-maximize');
      this.elements.nativeElement.querySelector('.feather').classList.toggle('icon-minimize');
      screenfull.toggle();
    }

    if (isScreenFull(screenfull)) {
      if (screenfull.isFullscreen) {
        screenfull.exit();
      } else {
        screenfull.request();
      }
    }
  }
}

/** Comprueba si el navegador está en pantalla completa. */
function isScreenFull(sf) {
  return sf.isFullscreen;
}
