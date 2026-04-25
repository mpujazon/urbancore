import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Link } from '../../../../../shared/models/LinkInterface';
import { RouterLink } from "@angular/router";
import { MobileUserAvatar } from "../mobile-user-avatar/mobile-user-avatar";
import { NavMobileLink } from "../nav-link/nav-mobile-link";

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, MobileUserAvatar, NavMobileLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  links: Links[] = ;
  links: Link[] = [
    {
      label: 'Homepage',
      basedRole: 'public',
      url: '/',
      iconClasses: 'fa-solid fa-house'
    },
    {
      label: 'Incidents Explorer',
      basedRole: 'public',
      url: '/incidents',
      iconClasses: 'fa-solid fa-magnifying-glass-location'
    },
    {
      label: 'Planned Actions',
      basedRole: 'public',
      url: '/planned-actions',
      iconClasses: 'fa-solid fa-calendar'
    },
    {
      label: 'Stats',
      basedRole: 'public',
      url: '/stats',
      iconClasses: 'fa-solid fa-chart-simple'
    }
  ];

  isMenuOpen = signal(false);

  onOpenMenuClick(){
    this.isMenuOpen.set(true);
  }
  onCloseMenuClick(){
    this.isMenuOpen.set(false);
  }
}
