import { Component, inject } from '@angular/core';
import { Notification } from '../../core/services/notification';

@Component({
  selector: 'app-notification-toast',
  imports: [],
  templateUrl: './notification-toast.html',
  styleUrl: './notification-toast.scss',
})
export class NotificationToast {
  notification = inject(Notification);
}
