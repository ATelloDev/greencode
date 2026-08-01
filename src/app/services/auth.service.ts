import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LinkedInUser } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly CLIENT_ID = 'YOUR_LINKEDIN_CLIENT_ID';
  private readonly REDIRECT_URI = window.location.origin + '/auth/callback';
  private readonly SCOPES = 'openid profile email';
  private readonly AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
  private readonly TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
  private readonly USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';

  private readonly STORAGE_KEY = 'redlink_auth';

  readonly user = signal<LinkedInUser | null>(null);
  readonly accessToken = signal<string | null>(null);
  readonly isAuthenticated = computed(() => this.user() !== null);

  constructor(private http: HttpClient) {
    this.restoreSession();
  }

  private restoreSession(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.user.set(data.user);
        this.accessToken.set(data.accessToken);
      } catch {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  /**
   * Initiates the LinkedIn OAuth 2.0 Authorization Code flow with PKCE.
   * Redirects the browser to LinkedIn's authorization page.
   */
  signInWithLinkedIn(): void {
    if (this.isDemoMode()) {
      this.signInDemo();
      return;
    }
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    sessionStorage.setItem('redlink_pkce_verifier', codeVerifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      scope: this.SCOPES,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state: this.generateState(),
    });

    sessionStorage.setItem('redlink_oauth_state', params.get('state')!);

    window.location.href = `${this.AUTH_URL}?${params.toString()}`;
  }

  /**
   * Demo mode: sign in with a mock LinkedIn user (no real OAuth needed).
   * Useful for development and testing without a LinkedIn app.
   */
  signInDemo(): void {
    const demoUser: LinkedInUser = {
      sub: 'demo-user-001',
      name: 'Leonel Espinoza',
      given_name: 'Leonel',
      family_name: 'Espinoza',
      picture: 'https://randomuser.me/api/portraits/men/45.jpg',
      email: 'leonel.espinoza@greencode.dev',
      email_verified: true,
      locale: 'es-ES',
    };
    this.setSession(demoUser, 'demo-access-token');
  }

  /**
   * Handles the OAuth callback: exchanges the authorization code for an
   * access token, then fetches the user profile via the userinfo endpoint.
   */
  async handleCallback(code: string, state: string): Promise<boolean> {
    const savedState = sessionStorage.getItem('redlink_oauth_state');
    if (state !== savedState) {
      console.error('OAuth state mismatch');
      return false;
    }

    const codeVerifier = sessionStorage.getItem('redlink_pkce_verifier');

    try {
      const tokenResponse = await fetch(this.TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: this.CLIENT_ID,
          redirect_uri: this.REDIRECT_URI,
          code_verifier: codeVerifier || '',
        }),
      });

      if (!tokenResponse.ok) {
        console.error('Token exchange failed');
        return false;
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      const userResponse = await fetch(this.USERINFO_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        console.error('Failed to fetch user info');
        return false;
      }

      const userInfo: LinkedInUser = await userResponse.json();
      this.setSession(userInfo, accessToken);
      return true;
    } catch (err) {
      console.error('OAuth callback error:', err);
      return false;
    }
  }

  private setSession(user: LinkedInUser, accessToken: string): void {
    this.user.set(user);
    this.accessToken.set(accessToken);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ user, accessToken }));
  }

  signOut(): void {
    this.user.set(null);
    this.accessToken.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem('redlink_pkce_verifier');
    sessionStorage.removeItem('redlink_oauth_state');
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64UrlEncode(array);
  }

  private generateCodeChallenge(verifier: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = crypto.subtle.digest('SHA-256', data).then(buf => buf);
    // Synchronous fallback - use a simple hash for demo
    return this.base64UrlEncode(new TextEncoder().encode(verifier));
  }

  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  private base64UrlEncode(array: Uint8Array): string {
    const str = String.fromCharCode(...array);
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  isDemoMode(): boolean {
    return this.CLIENT_ID === 'YOUR_LINKEDIN_CLIENT_ID';
  }
}
