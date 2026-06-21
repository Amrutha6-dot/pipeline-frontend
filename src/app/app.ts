import { Component } from '@angular/core';
import { Board } from './components/board/board';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Board],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'pipeline-frontend';
}