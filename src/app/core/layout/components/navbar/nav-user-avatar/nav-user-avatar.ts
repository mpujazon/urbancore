import { ChangeDetectionStrategy, Component, computed, ElementRef, HostListener, inject } from '@angular/core';
import { AuthService } from '../../../../services/auth-service';

@Component({
  selector: 'app-nav-user-avatar',
  imports: [],
  templateUrl: './nav-user-avatar.html',
  styleUrl: './nav-user-avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavUserAvatar {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private auth = inject(AuthService);

  name = computed(()=>this.auth.user()?.displayName);

  imgUrl = computed(()=>this.auth.user()?.photoURL || '/user-avatar.svg');
  role = 'Citizen';
  isDesktopMenuOpen = false;

  toggleDesktopMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.isDesktopMenuOpen = !this.isDesktopMenuOpen;
  }

  closeDesktopMenu(): void {
    this.isDesktopMenuOpen = false;
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
    this.closeDesktopMenu();
  }

  onSignOut(){
    try{
      this.auth.logout();
    }catch(error){
      console.error('Error signing out');
    }
  }
}
