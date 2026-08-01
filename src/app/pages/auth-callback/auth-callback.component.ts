import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-auth-callback',
  imports: [],
  template: `
    <div class="callback-page">
      <div class="spinner"></div>
      <p class="mt-3 text-secondary">Completing sign-in...</p>
      @if (error) {
        <p class="mt-2" style="color: var(--red-600);">{{ error }}</p>
      }
    </div>
  `,
  styles: [`
    .callback-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  error = '';

  async ngOnInit(): Promise<void> {
    const code = this.route.snapshot.queryParamMap.get('code');
    const state = this.route.snapshot.queryParamMap.get('state');
    const errParam = this.route.snapshot.queryParamMap.get('error');

    if (errParam) {
      this.error = `LinkedIn auth error: ${errParam}`;
      setTimeout(() => this.router.navigate(['/login']), 3000);
      return;
    }

    if (!code || !state) {
      this.router.navigate(['/login']);
      return;
    }

    const success = await this.auth.handleCallback(code, state);
    if (success) {
      this.router.navigate(['/']);
    } else {
      this.error = 'Authentication failed. Please try again.';
      setTimeout(() => this.router.navigate(['/login']), 3000);
    }
  }
}
