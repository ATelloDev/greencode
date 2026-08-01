import { Component, inject, computed } from '@angular/core';
import { DataService } from '../../services/data.service';
import { AppNotification } from '../../models';

@Component({
  selector: 'app-notifications',
  imports: [],
  template: `
    <div class="notifications-page">
      <div class="notifications-container">
        <div class="card notifications-card">
          <div class="notif-header">
            <h2 class="notif-title">Notificaciones</h2>
            <button class="btn btn-ghost btn-sm" (click)="markAllRead()">Marcar todo como leído</button>
          </div>

          <div class="notif-tabs">
            <button class="notif-tab active">Todas</button>
            <button class="notif-tab">Mis publicaciones</button>
            <button class="notif-tab">Menciones</button>
          </div>

          <div class="divider"></div>

          @for (notif of data.notifications(); track notif.id) {
            <div class="notif-item" [class.unread]="!notif.read" (click)="markRead(notif)">
              @if (notif.actorPicture) {
                <img [src]="notif.actorPicture" class="avatar" style="width:48px;height:48px" [alt]="notif.actorName" />
              } @else {
                <div class="avatar-placeholder" style="width:48px;height:48px;font-size:17px;background:var(--red-500)">
                  {{ getInitials(notif.actorName) }}
                </div>
              }
              <div class="notif-content">
                <p class="notif-text">
                  <strong>{{ notif.actorName }}</strong> {{ notif.text }}
                </p>
                <span class="notif-time">{{ timeAgo(notif.timestamp) }}</span>
              </div>
              @if (!notif.read) {
                <span class="notif-unread-dot"></span>
              }
            </div>
          }

          @if (data.notifications().length === 0) {
            <div class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <p>No hay notificaciones aún</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-page { padding: 24px 0; }
    .notifications-container { max-width: 600px; margin: 0 auto; padding: 0 16px; }
    .notifications-card { padding: 0; }
    .notif-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px 12px; }
    .notif-title { font-size: 20px; font-weight: 700; }
    .notif-tabs { display: flex; gap: 8px; padding: 0 24px 12px; }
    .notif-tab { padding: 6px 16px; border-radius: var(--radius-full); font-size: 13px; font-weight: 600; color: var(--text-secondary); }
    .notif-tab.active { background: var(--red-100); color: var(--red-800); }
    .notif-item { display: flex; align-items: center; gap: 12px; padding: 16px 24px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; }
    .notif-item:hover { background: var(--surface-hover); }
    .notif-item.unread { background: var(--red-50); }
    .notif-content { flex: 1; }
    .notif-text { font-size: 14px; line-height: 1.5; }
    .notif-time { font-size: 12px; color: var(--text-muted); margin-top: 4px; display: block; }
    .notif-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red-600); flex-shrink: 0; }
  `]
})
export class NotificationsComponent {
  data = inject(DataService);

  markAllRead(): void {
    this.data.markAllNotificationsRead();
  }

  markRead(notif: AppNotification): void {
    this.data.markNotificationRead(notif.id);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  timeAgo(timestamp: number): string {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return `${Math.floor(days / 7)}sem`;
  }
}
