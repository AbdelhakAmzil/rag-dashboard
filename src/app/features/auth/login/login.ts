import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { Notification } from '../../../core/services/notification';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);
  private notification = inject(Notification);

  email = '';
  password = '';
  isLoading = signal(false);

  submit() {
    if (!this.email || !this.password) {
      this.notification.error('Please fill in all fields.');
      return;
    }

    this.isLoading.set(true);

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.notification.success(`Welcome back, ${res.username}!`);
        this.router.navigate(['/chat']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notification.error(
          err.status === 401
            ? 'Invalid email or password.'
            : 'Something went wrong. Please try again.',
        );
      },
    });
  }
}
