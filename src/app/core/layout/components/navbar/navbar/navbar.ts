import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Link } from '../../../../../shared/models/LinkInterface';
import { RouterLink } from "@angular/router";
import { MobileUserAvatar } from "../mobile-user-avatar/mobile-user-avatar";

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, MobileUserAvatar],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  links: Link[] = [
    {
      label: 'Homepage',
      basedRole: 'public',
      url: '/'
    },
    {
      label: 'Incidents Explorer',
      basedRole: 'public',
      url: '/incidents'
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
