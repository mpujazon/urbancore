import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-mobile-user-avatar',
  imports: [],
  templateUrl: './mobile-user-avatar.html',
  styleUrl: './mobile-user-avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileUserAvatar {
  name='Unknown User';
  imgUrl='/user-avatar.svg'
  role = 'Unregistred'
}
