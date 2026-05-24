import { ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, inject, viewChild } from '@angular/core';
import { AuthService } from '../../../../services/auth-service';
import { UserRoleLabelPipe } from '../../../pipes/user-role-label.pipe';

@Component({
  selector: 'app-nav-user-avatar',
  imports: [UserRoleLabelPipe],
  templateUrl: './nav-user-avatar.html',
  styleUrl: './nav-user-avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavUserAvatar {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly avatarButton = viewChild<ElementRef<HTMLButtonElement>>('avatarButton');
  private auth = inject(AuthService);

  name = computed(()=>this.auth.user()?.displayName);

  imgUrl = computed(() =>
    this.auth.user()?.photoURL ?? 'user-avatar.svg'
  );
  role = computed(()=>
    this.auth.dbUser()?.role
);
  isDesktopMenuOpen = false;

  toggleDesktopMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isDesktopMenuOpen = !this.isDesktopMenuOpen;
  }

  closeDesktopMenu(restoreFocus = false): void {
    this.isDesktopMenuOpen = false;

    if (restoreFocus) {
      requestAnimationFrame(() => this.avatarButton()?.nativeElement.focus());
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;

    if (!target || this.elementRef.nativeElement.contains(target)) {
      return;
    }

    this.closeDesktopMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isDesktopMenuOpen) {
      this.closeDesktopMenu(true);
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
