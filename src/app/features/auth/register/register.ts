import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { Notification } from '../../../core/services/notification';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private auth = inject(Auth);
  private router = inject(Router);
  private notification = inject(Notification);

  username = '';
  email = '';
  password = '';
  isLoading = signal(false);

  submit() {
    if (!this.username || !this.email || !this.password) {
      this.notification.error('Please fill in all fields.');
      return;
    }

    if (this.password.length < 6) {
      this.notification.error('Password must be at least 6 characters.');
      return;
    }

    this.isLoading.set(true);

    this.auth.register(this.username, this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.notification.success(`Account created! Welcome, ${res.username}.`);
        this.router.navigate(['/chat']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.notification.error(
          typeof err.error === 'string' ? err.error : 'Something went wrong. Please try again.',
        );
      },
    });
  }
}
