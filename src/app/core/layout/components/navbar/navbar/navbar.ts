import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavUserAvatar } from "../nav-user-avatar/nav-user-avatar";
import { NavLink } from "../nav-link/nav-link";
import { NAV_LINKS } from '../../../config/nav-links';
import { AuthService } from '../../../../services/auth-service';

@Component({
  selector: 'app-navbar',
  imports: [NavUserAvatar, NavLink, RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.scrolled]': 'isScrolled()',
    '(document:keydown)': 'onDocumentKeydown($event)',
  },
})
export class Navbar implements OnInit {
  isMenuOpen = signal(false);
  isScrolled = signal(false);

  private readonly openMenuButton = viewChild<ElementRef<HTMLButtonElement>>('openMenuButton');
  private readonly closeMenuButton = viewChild<ElementRef<HTMLButtonElement>>('closeMenuButton');
  private readonly mobileNavigation = viewChild<ElementRef<HTMLElement>>('mobileNavigation');

  private auth = inject(AuthService);
  private document = inject(DOCUMENT);
  private scrollLockEffect = effect((onCleanup) => {
    const body = this.document.body;
    body.classList.toggle('mobile-menu-open', this.isMenuOpen());

    onCleanup(() => body.classList.remove('mobile-menu-open'));
  });

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

    requestAnimationFrame(() => this.closeMenuButton()?.nativeElement.focus());
  }
  onCloseMenuClick(){
    this.isMenuOpen.set(false);

    requestAnimationFrame(() => this.openMenuButton()?.nativeElement.focus());
  }

  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.isMenuOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.onCloseMenuClick();
      return;
    }

    if (event.key === 'Tab') {
      this.trapMobileMenuFocus(event);
    }
  }

  private trapMobileMenuFocus(event: KeyboardEvent): void {
    const focusable = this.getMobileMenuFocusableElements();
    const first = focusable.at(0);
    const last = focusable.at(-1);

    if (!first || !last) {
      event.preventDefault();
      return;
    }

    const activeElement = this.document.activeElement;

    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getMobileMenuFocusableElements(): HTMLElement[] {
    const mobileNavigation = this.mobileNavigation()?.nativeElement;
    if (!mobileNavigation) return [];

    return Array.from(
      mobileNavigation.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute('disabled') && element.offsetParent !== null);
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
