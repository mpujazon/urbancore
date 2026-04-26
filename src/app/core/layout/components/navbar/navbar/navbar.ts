import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Link } from '../../../../../shared/models/LinkInterface';
import { RouterLink } from "@angular/router";
import { MobileUserAvatar } from "../mobile-user-avatar/mobile-user-avatar";
import { NavLink } from "../nav-link/nav-link";
import { NAV_LINKS } from '../../../config/nav-links';
import { AuthService } from '../../../../services/auth-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  imports: [MobileUserAvatar, NavLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private auth = inject(AuthService);
  user = toSignal(this.auth.user$, {initialValue: null});

  // TODO: links will be given by a computed expression based on a signal of AuthService.
  links: Link[] = NAV_LINKS.filter(link => link.roles.includes('unlogged'));
  isMenuOpen = signal(false);
  isUserLogged = computed(()=> this.user());

  onOpenMenuClick(){
    this.isMenuOpen.set(true);
  }
  onCloseMenuClick(){
    this.isMenuOpen.set(false);
  }

  onSignInWithGoogle(){
    try{
      this.auth.loginWithGoogle();
    }catch(error){
      console.error('Error signing in');
    }
  }

  onSignOut(){
    try{
      this.auth.logout();
    }catch(error){
      console.error('Error signing out');
    }
  }
}
