import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TransactionDashboard } from './components/dashboard';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TransactionDashboard],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('trans-app');
}
