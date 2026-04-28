import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Link } from '../../../../../shared/models/LinkInterface';
import { NavUserAvatar } from "../nav-user-avatar/nav-user-avatar";
import { NavLink } from "../nav-link/nav-link";
import { NAV_LINKS } from '../../../config/nav-links';
import { AuthService } from '../../../../services/auth-service';

@Component({
  selector: 'app-navbar',
  imports: [NavUserAvatar, NavLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private auth = inject(AuthService);

  // TODO: links will be given by a computed expression based on a signal of AuthService.
  links = computed(()=>
    NAV_LINKS.filter(link =>
      link.roles.includes(this.auth.dbUser()?.role ?? 'unlogged')
    )
  );
  isMenuOpen = signal(false);
  isUserLogged = computed(()=> this.auth.user());
  isSigningIn = signal(false);

  onOpenMenuClick(){
    this.isMenuOpen.set(true);
  }
  onCloseMenuClick(){
    this.isMenuOpen.set(false);
  }

  async onSignInWithGoogle(){
    if(this.isSigningIn()) return;
    this.isSigningIn.set(true);
    try{
      await this.auth.loginWithGoogle();
    }catch(error){
      console.error('Error signing in');
    }finally {
      this.isSigningIn.set(false);
    }
  }

  async onSignOut(){
    try{
      await this.auth.logout();
    }catch(error){
      console.error('Error signing out');
    }
  }
}
