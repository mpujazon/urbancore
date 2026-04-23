import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  onMenuIconClick(event: Event){
    const icon = event.target as HTMLLIElement;
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-xmark');
  }
}
