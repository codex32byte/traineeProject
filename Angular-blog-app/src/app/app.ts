import { Component, signal } from '@angular/core';
//import { RouterOutlet } from '@angular/router';
import { Header } from './ui/components/header/header';
import { Footer } from './ui/components/footer/footer';
import { MainPage } from './ui/pages/main-page/main-page';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, MainPage],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('Angular-blog-app');
}
