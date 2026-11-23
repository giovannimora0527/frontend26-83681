// angular import
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

// bootstrap import
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from 'src/app/demo/pages/login/service/auth.service';
import { getJwtPayload } from 'src/app/utils/jwt.util';

@Component({
  selector: 'app-nav-right',
  imports: [SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss'],
  providers: [NgbDropdownConfig]
})
export class NavRightComponent {
  username = 'Usuario';
  role = '';
  // public props

  // constructor
  constructor() {
    const config = inject(NgbDropdownConfig);

    config.placement = 'bottom-right';
    this.actualizarUsuario();
  }

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  cerrarSesion(): void {
    this.authService.cerrarSesion().subscribe({
      next: () => this.finalizarSesion(),
      error: () => this.finalizarSesion()
    });
  }

  private finalizarSesion(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  private actualizarUsuario(): void {
    try {
      const payload = getJwtPayload();
      this.username = payload?.username ?? 'Usuario';
      this.role = payload?.rol ?? '';
    } catch {
      this.username = 'Usuario';
      this.role = '';
    }
  }
}
