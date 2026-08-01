import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [],
  template: `
    <div class="login-page">
      <div class="login-hero">
        <div class="hero-bg"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="logo">
            <span class="logo-icon">G</span>
            <span class="logo-text">GreenCode</span>
          </div>
          <h1>Conecta. Crece. Haz un Impacto.</h1>
          <p class="hero-subtitle">
            La red profesional hecha para creadores. Impulsada por Angular,
            integrada con LinkedIn. Encuentra oportunidades, comparte conocimiento y
            haz crecer tu carrera en una comunidad que valora lo que creas.
          </p>
          <div class="hero-features">
            <div class="feature">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              <span>Conecta con profesionales de todo el mundo</span>
            </div>
            <div class="feature">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
              </svg>
              <span>Descubre trabajos que coincidan con tus habilidades</span>
            </div>
            <div class="feature">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 11l18-5v12L3 14v-3z"/>
                <path d="M11.6 16.8a3 3 0 11-5.8-1.6"/>
              </svg>
              <span>Comparte tu experiencia con la comunidad</span>
            </div>
            <div class="feature">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
              <span>Mentor y sé mentorizado</span>
            </div>
          </div>
          <div class="hero-stats">
            <div class="stat">
              <span class="stat-num">2M+</span>
              <span class="stat-label">Profesionales</span>
            </div>
            <div class="stat">
              <span class="stat-num">50K+</span>
              <span class="stat-label">Ofertas de empleo</span>
            </div>
            <div class="stat">
              <span class="stat-num">190+</span>
              <span class="stat-label">Países</span>
            </div>
          </div>
        </div>
      </div>

      <div class="login-panel">
        <div class="login-card">
          <div class="logo mobile-logo">
            <span class="logo-icon">G</span>
            <span class="logo-text">GreenCode</span>
          </div>
          <h2>Bienvenido a GreenCode</h2>
          <p class="login-subtitle">Inicia sesión para unirte a la comunidad profesional</p>

          <button class="btn btn-primary btn-lg btn-block linkedin-btn" (click)="signInWithLinkedIn()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
            </svg>
            {{ auth.isDemoMode() ? 'Iniciar sesión con LinkedIn (Demo)' : 'Iniciar sesión con LinkedIn' }}
          </button>

          <div class="divider-text">
            <span>o</span>
          </div>

          <button class="btn btn-outline btn-lg btn-block" (click)="signInDemo()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            Probar modo Demo
          </button>

          <p class="demo-note">
            {{ auth.isDemoMode() ? 'El modo demo está activo. Ambos botones te iniciarán sesión con una cuenta demo. Para habilitar el inicio de sesión real con LinkedIn, añade tu Client ID en' : 'Para usar el inicio de sesión real con LinkedIn, añade tu Client ID en' }}
            <code>auth.service.ts</code>.
          </p>

          <div class="login-footer">
            <p>Al iniciar sesión, aceptas los Términos de Servicio y la Política de Privacidad de GreenCode.</p>
          </div>
        </div>

        <div class="signup-prompt">
          ¿Nuevo en GreenCode? <a (click)="signInDemo()">Únete ahora</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex;
      min-height: 100vh;
      background: var(--bg);
    }
    .login-hero {
      flex: 1;
      position: relative;
      display: flex;
      align-items: center;
      padding: 48px;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      background-image: url('https://picsum.photos/seed/greencode-network/1200/900');
      background-size: cover;
      background-position: center;
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(22, 163, 74, 0.92) 0%, rgba(21, 128, 61, 0.95) 60%, rgba(5, 46, 22, 0.98) 100%);
    }
    .hero-content { position: relative; z-index: 1; max-width: 480px; color: #fff; }
    .logo { display: flex; align-items: center; gap: 10px; margin-bottom: 48px; }
    .logo-icon {
      width: 44px; height: 44px;
      background: #fff; color: var(--red-700);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 24px;
    }
    .logo-text { font-size: 24px; font-weight: 700; }
    .hero-content h1 {
      font-size: 42px; font-weight: 800; line-height: 1.2;
      margin-bottom: 20px;
    }
    .hero-subtitle {
      font-size: 16px; line-height: 1.6; opacity: 0.9;
      margin-bottom: 36px;
    }
    .hero-features { display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px; }
    .feature {
      display: flex; align-items: center; gap: 14px;
      font-size: 15px; opacity: 0.95;
    }
    .feature svg {
      flex-shrink: 0;
      opacity: 0.9;
    }
    .hero-stats {
      display: flex;
      gap: 40px;
      padding-top: 32px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
    }
    .stat { display: flex; flex-direction: column; gap: 2px; }
    .stat-num { font-size: 28px; font-weight: 800; }
    .stat-label { font-size: 13px; opacity: 0.8; }
    .login-panel {
      width: 480px;
      display: flex;
      flex-direction: column;
      align-items: center; justify-content: center;
      padding: 48px;
    }
    .login-card {
      background: var(--surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 40px;
      width: 100%;
      max-width: 400px;
    }
    .mobile-logo { display: none; margin-bottom: 24px; }
    .login-card h2 { font-size: 24px; font-weight: 700; margin-bottom: 6px; }
    .login-subtitle { color: var(--text-secondary); margin-bottom: 28px; }
    .linkedin-btn { margin-bottom: 16px; }
    .btn-outline { display: flex; align-items: center; justify-content: center; gap: 8px; }
    .divider-text {
      text-align: center; margin: 16px 0;
      color: var(--text-muted); font-size: 13px;
      position: relative;
    }
    .divider-text::before, .divider-text::after {
      content: ''; position: absolute; top: 50%;
      width: 40%; height: 1px; background: var(--border);
    }
    .divider-text::before { left: 0; }
    .divider-text::after { right: 0; }
    .demo-note {
      font-size: 12px; color: var(--text-muted);
      margin-top: 16px; line-height: 1.5;
    }
    .demo-note code {
      background: var(--red-50); padding: 1px 4px;
      border-radius: 4px; font-size: 11px;
    }
    .login-footer {
      margin-top: 24px; padding-top: 20px;
      border-top: 1px solid var(--border);
    }
    .login-footer p { font-size: 11px; color: var(--text-muted); line-height: 1.5; }
    .signup-prompt {
      margin-top: 24px; font-size: 14px; color: var(--text-secondary);
    }
    .signup-prompt a { cursor: pointer; font-weight: 600; }

    @media (max-width: 900px) {
      .login-hero { display: none; }
      .login-panel { width: 100%; flex: 1; }
      .mobile-logo { display: flex; }
    }
  `]
})
export class LoginComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  signInWithLinkedIn(): void {
    this.auth.signInWithLinkedIn();
    if (this.auth.isDemoMode()) {
      this.router.navigate(['/']);
    }
  }

  signInDemo(): void {
    this.auth.signInDemo();
    this.router.navigate(['/']);
  }
}
