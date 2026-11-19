// Angular import
import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

// project import
import { SpinnerComponent } from './theme/shared/components/spinner/spinner.component';
import { FooterComponent } from './theme/shared/components/footer/footer.component';

/** Contiene la vista raíz de la aplicación Angular. */
@Component({
  selector: 'app-root',
  imports: [SpinnerComponent, FooterComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  private router = inject(Router);

  title = 'Clínica Veterinaria Uniminuto';

  // life cycle hook
  /** Prepara la pantalla al abrirse y carga los datos que necesita. */
  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}
