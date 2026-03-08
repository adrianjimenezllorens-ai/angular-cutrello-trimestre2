import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../tasks/services/auth.service';

@Component({
  selector: 'top-menu',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './top-menu.html',
  styleUrl: './top-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopMenu {
  #router = inject(Router);
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
    this.#router.navigate(['/auth/login']);
  }
}