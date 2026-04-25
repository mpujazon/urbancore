import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Link } from '../../../../../shared/models/LinkInterface';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-nav-link',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav-link.html',
  styleUrl: './nav-link.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavLink {
  link = input.required<Link>();
}
