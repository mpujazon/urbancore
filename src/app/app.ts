import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import {Navbar} from './core/layout/components/navbar/navbar/navbar';
import { Footer } from "./core/layout/components/footer/footer";
import { ToastComponent } from "./shared/components/toast/toast";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('urbancore');

  constructor(public router: Router) {}
}
