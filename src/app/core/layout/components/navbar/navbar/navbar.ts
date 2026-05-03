import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, OnInit, computed, effect, inject, signal } from '@angular/core';
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
  host: {
    '[class.scrolled]': 'isScrolled()',
  },
})
export class Navbar implements OnInit {
  isMenuOpen = signal(false);
  isScrolled = signal(false);

  private auth = inject(AuthService);
  private document = inject(DOCUMENT);
  private scrollLockEffect = effect((onCleanup) => {
    const body = this.document.body;
    body.classList.toggle('mobile-menu-open', this.isMenuOpen());

    onCleanup(() => body.classList.remove('mobile-menu-open'));
  });

  // TODO: links will be given by a computed expression based on a signal of AuthService.
  links = computed(()=>
    NAV_LINKS.filter(link =>
      link.roles.includes(this.auth.dbUser()?.role ?? 'unlogged')
    )
  );
  isUserLogged = computed(()=> this.auth.user());
  isSigningIn = signal(false);

  ngOnInit() {
    this.updateScrolledState();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.updateScrolledState();
  }

  private updateScrolledState() {
    const scrollTop = this.document.defaultView?.scrollY ?? 0;
    this.isScrolled.set(scrollTop > 6);
  }

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
