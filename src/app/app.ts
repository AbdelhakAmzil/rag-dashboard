import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationToast } from './shared/notification-toast/notification-toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NotificationToast],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  title = 'rag-chatbot-ui';
}
