import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Link } from '../../../../../shared/models/LinkInterface';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-nav-mobile-link',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-mobile-link.html',
  styleUrl: './nav-mobile-link.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavMobileLink {
  link = input.required<Link>();
}
