import { Component, ElementRef, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import {Navbar} from './core/layout/components/navbar/navbar/navbar';
import { Footer } from "./core/layout/components/footer/footer";
import { ToastComponent } from "./shared/components/toast/toast";
import { CitySelector } from './shared/components/city-selector/city-selector';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, ToastComponent, CitySelector],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly mainContent = viewChild<ElementRef<HTMLElement>>('mainContent');

  constructor(public router: Router) {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        requestAnimationFrame(() => this.mainContent()?.nativeElement.focus({ preventScroll: true }));
      });
  }
}
