import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { RealApiService } from '../../services/real-api.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <header class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-logo">
          <span class="logo-icon">G</span>
          <span class="logo-text">GreenCode</span>
        </a>

        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-7H9v7H4a1 1 0 01-1-1V9.5z"/>
            </svg>
            <span class="nav-label">Inicio</span>
          </a>

          <a routerLink="/network" routerLinkActive="active" class="nav-item nav-item-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="7" r="4"/>
              <path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
              <path d="M16 3.13a4 4 0 010 7.75M21 21v-2a4 4 0 00-3-3.87"/>
            </svg>
            <span class="nav-label">Mi Red</span>
            @if (pendingInvites() > 0) {
              <span class="nav-badge">{{ pendingInvites() }}</span>
            }
          </a>

          <a routerLink="/jobs" routerLinkActive="active" class="nav-item">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
            </svg>
            <span class="nav-label">Empleos</span>
          </a>

          <a routerLink="/messaging" routerLinkActive="active" class="nav-item nav-item-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <span class="nav-label">Mensajes</span>
            @if (unreadMessages() > 0) {
              <span class="nav-badge">{{ unreadMessages() }}</span>
            }
          </a>

          <a routerLink="/notifications" routerLinkActive="active" class="nav-item nav-item-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
            <span class="nav-label">Notificaciones</span>
            @if (unreadNotifs() > 0) {
              <span class="nav-badge">{{ unreadNotifs() }}</span>
            }
          </a>
        </nav>

        <div class="nav-right">
          <div class="search-box" (click)="searchInput?.focus()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input #searchInput type="text" placeholder="Buscar" class="search-input" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" (focus)="showSearchResults.set(true)" (blur)="hideSearchResults()" />
            @if (showSearchResults() && searchQuery.trim()) {
              <div class="search-dropdown" (mousedown)="$event.preventDefault()">
                @if (searchResults().people.length > 0) {
                  <div class="search-group">
                    <span class="search-group-label">Personas</span>
                    @for (p of searchResults().people.slice(0, 3); track p.id) {
                      <div class="search-item">
                        @if (p.picture) {
                          <img [src]="p.picture" class="avatar" style="width:32px;height:32px" [alt]="p.name" />
                        } @else {
                          <div class="avatar-placeholder" style="width:32px;height:32px;font-size:12px;background:var(--red-600)">{{ p.name.charAt(0) }}</div>
                        }
                        <div>
                          <span class="search-item-name">{{ p.name }}</span>
                          <span class="search-item-sub">{{ p.headline }}</span>
                        </div>
                      </div>
                    }
                  </div>
                }
                @if (searchResults().jobs.length > 0) {
                  <div class="search-group">
                    <span class="search-group-label">Empleos</span>
                    @for (j of searchResults().jobs.slice(0, 3); track j.id) {
                      <div class="search-item">
                        <div class="search-item-icon" style="width:32px;height:32px;background:var(--red-100);border-radius:6px;display:flex;align-items:center;justify-content:center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red-600)" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                        </div>
                        <div>
                          <span class="search-item-name">{{ j.title }}</span>
                          <span class="search-item-sub">{{ j.company }} - {{ j.location }}</span>
                        </div>
                      </div>
                    }
                  </div>
                }
                @if (searchResults().posts.length > 0) {
                  <div class="search-group">
                    <span class="search-group-label">Publicaciones</span>
                    @for (p of searchResults().posts.slice(0, 3); track p.id) {
                      <div class="search-item">
                        <div class="search-item-icon" style="width:32px;height:32px;background:var(--red-100);border-radius:6px;display:flex;align-items:center;justify-content:center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red-600)" stroke-width="2"><path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>
                        </div>
                        <div>
                          <span class="search-item-name">{{ p.authorName }}</span>
                          <span class="search-item-sub">{{ p.content.substring(0, 60) }}...</span>
                        </div>
                      </div>
                    }
                  </div>
                }
                @if (searchResults().people.length === 0 && searchResults().jobs.length === 0 && searchResults().posts.length === 0) {
                  <div class="search-empty">No se encontraron resultados</div>
                }
              </div>
            }
          </div>

          <button class="nav-theme-toggle" (click)="toggleDarkMode()" title="Cambiar modo oscuro">
            @if (isDark()) {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            }
          </button>

          <a routerLink="/profile" routerLinkActive="active" class="nav-profile">
            @if (user()?.picture) {
              <img [src]="user()!.picture" class="avatar" style="width:32px;height:32px" alt="Me" />
            } @else {
              <div class="avatar-placeholder" style="width:32px;height:32px;font-size:14px;background:var(--red-600)">
                {{ initials() }}
              </div>
            }
            <span class="nav-label">Yo</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </a>

          <button class="nav-signout" (click)="signOut()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="main-content">
      <router-outlet />
    </main>

    <!-- API Status Widget -->
    <div class="api-status-widget" (click)="toggleApiPanel()">
      <div class="api-status-icon">
        <span class="api-pulse" [class.active]="apiConnected()"></span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      @if (showApiPanel()) {
        <div class="api-panel" (click)="$event.stopPropagation()">
          <div class="api-panel-header">
            <span class="api-panel-title">Conexiones API en vivo</span>
            <span class="api-panel-badge">{{ connectedCount() }} activas</span>
          </div>
          <div class="divider"></div>
          @for (api of apiStatuses(); track api.name) {
            <div class="api-row">
              <span class="api-dot" [class.connected]="api.status === 'connected'" [class.loading]="api.status === 'loading'" [class.error]="api.status === 'error'"></span>
              <div class="api-info">
                <span class="api-name">{{ api.name }}</span>
                <span class="api-desc">{{ api.description }}</span>
                @if (api.recordsFetched > 0) {
                  <span class="api-records">{{ api.recordsFetched }} registros obtenidos</span>
                }
              </div>
              <a [href]="api.url" target="_blank" class="api-link">↗</a>
            </div>
          }
          <div class="divider"></div>
          <p class="api-footer">GreenCode usa APIs reales para datos de usuarios, fotos y autenticación</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      box-shadow: var(--shadow-sm);
    }
    .nav-container {
      max-width: 1128px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      height: 52px;
      padding: 0 16px;
      gap: 16px;
    }
    .nav-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-icon {
      width: 32px; height: 32px;
      background: var(--red-600);
      color: #fff;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 18px;
    }
    .logo-text {
      font-size: 20px; font-weight: 700;
      color: var(--red-700);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
      justify-content: center;
    }
    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 8px 16px;
      color: var(--text-secondary);
      text-decoration: none;
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
      position: relative;
      min-width: 72px;
    }
    .nav-item:hover { color: var(--text-primary); }
    .nav-item.active { color: var(--text-primary); border-bottom-color: var(--red-600); }
    .nav-label { font-size: 11px; font-weight: 500; }
    .nav-item-badge { position: relative; }
    .nav-badge {
      position: absolute;
      top: 2px;
      right: 8px;
      background: var(--red-600);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      min-width: 16px;
      height: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    .nav-right {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 6px 10px;
      width: 220px;
    }
    .search-box svg { color: var(--text-muted); flex-shrink: 0; }
    .search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 13px;
      width: 100%;
      color: var(--text-primary);
    }
    .nav-profile {
      display: flex;
      align-items: center;
      gap: 4px;
      text-decoration: none;
      color: var(--text-secondary);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      cursor: pointer;
    }
    .nav-profile:hover { color: var(--text-primary); background: var(--surface-hover); }
    .nav-signout {
      color: var(--text-secondary);
      padding: 6px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
    }
    .nav-signout:hover { color: var(--red-600); background: var(--red-50); }
    .nav-theme-toggle {
      color: var(--text-secondary);
      padding: 6px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }
    .nav-theme-toggle:hover { color: var(--red-600); background: var(--surface-hover); }
    .search-box { position: relative; }
    .search-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      width: 360px;
      max-height: 400px;
      overflow-y: auto;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      z-index: 500;
      padding: 8px;
    }
    .search-group { padding: 4px 0; }
    .search-group-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 12px;
    }
    .search-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      cursor: pointer;
    }
    .search-item:hover { background: var(--surface-hover); }
    .search-item-name { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .search-item-sub { display: block; font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 280px; }
    .search-empty { padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px; }
    .main-content {
      min-height: calc(100vh - 52px);
    }
    @media (max-width: 768px) {
      .search-box { display: none; }
      .nav-label { display: none; }
      .nav-item { min-width: 48px; padding: 8px 10px; }
      .logo-text { display: none; }
    }

    .api-status-widget {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 200;
      cursor: pointer;
    }
    .api-status-icon {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--surface);
      border: 1px solid var(--border);
      box-shadow: var(--shadow-md);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      color: var(--red-600);
      transition: transform 0.2s;
    }
    .api-status-widget:hover .api-status-icon { transform: scale(1.1); }
    .api-pulse {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--gray-400);
    }
    .api-pulse.active {
      background: #22c55e;
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
      animation: api-pulse 2s infinite;
    }
    @keyframes api-pulse {
      0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
      100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
    }
    .api-panel {
      position: absolute;
      bottom: 52px;
      right: 0;
      width: 320px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      box-shadow: var(--shadow-lg);
      padding: 16px;
      animation: api-fade-in 0.2s ease;
    }
    @keyframes api-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .api-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .api-panel-title {
      font-weight: 700;
      font-size: 15px;
      color: var(--text);
    }
    .api-panel-badge {
      background: #22c55e;
      color: white;
      font-size: 11px;
      font-weight: 600;
      padding: 2px 10px;
      border-radius: 20px;
    }
    .api-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 0;
      border-bottom: 1px solid var(--border-light);
    }
    .api-row:last-child { border-bottom: none; }
    .api-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--gray-400);
      flex-shrink: 0;
      margin-top: 4px;
    }
    .api-dot.connected { background: #22c55e; }
    .api-dot.loading { background: #f59e0b; animation: api-pulse 1s infinite; }
    .api-dot.error { background: #ef4444; }
    .api-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .api-name { font-weight: 600; font-size: 13px; color: var(--text); }
    .api-desc { font-size: 12px; color: var(--text-secondary); }
    .api-records { font-size: 11px; color: var(--red-600); font-weight: 500; }
    .api-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 16px;
      padding: 4px;
    }
    .api-link:hover { color: var(--red-600); }
    .api-footer {
      font-size: 11px;
      color: var(--text-tertiary);
      text-align: center;
      margin-top: 8px;
    }
  `]
})
export class LayoutComponent {
  private auth = inject(AuthService);
  private data = inject(DataService);
  private router = inject(Router);
  private realApi = inject(RealApiService);

  pendingInvites = computed(() => this.data.getPendingInvitationsCount());
  unreadMessages = computed(() => this.data.getUnreadMessagesCount());
  unreadNotifs = computed(() => this.data.getUnreadNotificationsCount());

  user = computed(() => this.auth.user());

  apiStatuses = computed(() => this.realApi.apiStatuses());
  showApiPanel = signal(false);
  connectedCount = computed(() => this.apiStatuses().filter(a => a.status === 'connected').length);
  apiConnected = computed(() => this.connectedCount() > 0);

  searchQuery = '';
  showSearchResults = signal(false);
  searchResults = signal<{ people: any[]; jobs: any[]; posts: any[] }>({ people: [], jobs: [], posts: [] });

  isDark = computed(() => this.data.darkMode());

  initials = computed(() => {
    const user = this.auth.user();
    if (!user) return '?';
    return (user.given_name?.[0] || '') + (user.family_name?.[0] || '');
  });

  constructor() {
    this.data.initDarkMode();
    const u = this.auth.user();
    if (u) {
      this.data.initProfile({
        sub: u.sub,
        name: u.name,
        given_name: u.given_name,
        family_name: u.family_name,
        picture: u.picture,
        email: u.email,
      });
    }
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults.set({ people: [], jobs: [], posts: [] });
      return;
    }
    this.searchResults.set(this.data.search(this.searchQuery));
  }

  hideSearchResults(): void {
    setTimeout(() => this.showSearchResults.set(false), 200);
  }

  toggleDarkMode(): void {
    this.data.toggleDarkMode();
  }

  signOut(): void {
    this.auth.signOut();
    this.router.navigate(['/login']);
  }

  toggleApiPanel(): void {
    this.showApiPanel.set(!this.showApiPanel());
  }
}
