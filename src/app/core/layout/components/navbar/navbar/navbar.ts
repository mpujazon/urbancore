import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Link } from '../../../../../shared/models/LinkInterface';
import { RouterLink } from "@angular/router";
import { MobileUserAvatar } from "../mobile-user-avatar/mobile-user-avatar";
import { NavMobileLink } from "../nav-link/nav-mobile-link";
import { NAV_LINKS } from '../../../config/nav-links';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, MobileUserAvatar, NavMobileLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  // TODO: links will be given by a computed expression based on a signal of AuthService.
  links: Link[] = NAV_LINKS.filter(link => link.roles.includes('unlogged'));
  isMenuOpen = signal(false);
  isUserLogged = signal(true);

  onOpenMenuClick(){
    this.isMenuOpen.set(true);
  }
  onCloseMenuClick(){
    this.isMenuOpen.set(false);
  }
}
