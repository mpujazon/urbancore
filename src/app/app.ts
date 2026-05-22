import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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
  protected readonly title = signal('urbancore');

  constructor(public router: Router) {}
}
