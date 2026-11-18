// angular import
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/demo/pages/login/service/auth.service';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent {
  // public props

  // constructor
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {
    const config = inject(NgbDropdownConfig);

    config.placement = 'bottom-right';
  }

  cerrarSesion(): void {
    this.authService.logout();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }
}
