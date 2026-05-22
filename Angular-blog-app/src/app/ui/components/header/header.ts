import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { AUTH_SERVICE } from '../../../services/auth/auth-service.token';
import { AuthDialog } from '../auth-dialog/auth-dialog';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AUTH_SERVICE);

  protected readonly currentUser = this.authService.currentUser;
  protected readonly isUserMenuOpen = signal(false);

  protected openAuthDialog(): void {
    this.isUserMenuOpen.set(false);

    this.dialog.open(AuthDialog, {
      width: '430px',
      maxWidth: 'calc(100vw - 32px)',
      autoFocus: 'first-tabbable',
    });
  }

  protected toggleUserMenu(): void {
    this.isUserMenuOpen.update(value => !value);
  }

  protected logout(): void {
    this.authService.logout();
    this.isUserMenuOpen.set(false);
  }
}