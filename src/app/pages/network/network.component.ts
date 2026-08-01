import { Component, inject, computed, signal } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Connection } from '../../models';

@Component({
  selector: 'app-network',
  imports: [],
  template: `
    <div class="network-page">
      <div class="network-container">
        <!-- Left: Invitations & Connections -->
        <div class="network-left">
          <div class="card network-section-card">
            <h3 class="section-title">Invitaciones</h3>
            <p class="section-count">{{ pendingInvitations().length }}</p>
            @if (pendingInvitations().length === 0) {
              <p class="empty-text">No hay invitaciones pendientes</p>
            }
            @for (conn of pendingInvitations(); track conn.id) {
              <div class="invite-item">
                @if (conn.picture) {
                  <img [src]="conn.picture" class="avatar" style="width:56px;height:56px" [alt]="conn.name" />
                } @else {
                  <div class="avatar-placeholder" style="width:56px;height:56px;font-size:20px;background:var(--red-500)">
                    {{ getInitials(conn.name) }}
                  </div>
                }
                <div class="invite-info">
                  <span class="invite-name">{{ conn.name }}</span>
                  <span class="invite-headline">{{ conn.headline }}</span>
                  <span class="invite-mutual">{{ conn.mutualConnections }} conexiones en común</span>
                </div>
                <div class="invite-actions">
                  <button class="btn btn-primary btn-sm" (click)="accept(conn.id)">Aceptar</button>
                  <button class="btn btn-ghost btn-sm" (click)="ignore(conn.id)">Ignorar</button>
                </div>
              </div>
            }
          </div>

          <div class="card network-section-card">
            <h3 class="section-title">Conexiones</h3>
            <p class="section-count">{{ myConnections().length }}</p>
            @if (myConnections().length === 0) {
              <p class="empty-text">Aún no tienes conexiones</p>
            }
            @for (conn of myConnections(); track conn.id) {
              <div class="conn-item">
                @if (conn.picture) {
                  <img [src]="conn.picture" class="avatar" style="width:48px;height:48px" [alt]="conn.name" />
                } @else {
                  <div class="avatar-placeholder" style="width:48px;height:48px;font-size:17px;background:var(--red-500)">
                    {{ getInitials(conn.name) }}
                  </div>
                }
                <div class="conn-info">
                  <span class="conn-name">{{ conn.name }}</span>
                  <span class="conn-headline">{{ conn.headline }}</span>
                  <span class="conn-mutual">{{ conn.mutualConnections }} conexiones en común</span>
                </div>
                <button class="btn btn-ghost btn-sm" (click)="remove(conn.id)">Eliminar</button>
              </div>
            }
          </div>
        </div>

        <!-- Right: People You May Know -->
        <div class="network-right">
          <div class="card network-section-card">
            <h3 class="section-title">Personas que quizás conozcas</h3>
            <div class="suggestions-grid">
              @for (conn of suggestions(); track conn.id) {
                <div class="suggestion-card">
                  <div class="suggestion-banner"></div>
                  <div class="suggestion-body">
                    @if (conn.picture) {
                      <img [src]="conn.picture" class="avatar suggestion-avatar" style="width:64px;height:64px" [alt]="conn.name" />
                    } @else {
                      <div class="avatar-placeholder suggestion-avatar" style="width:64px;height:64px;font-size:22px;background:var(--red-500)">
                        {{ getInitials(conn.name) }}
                      </div>
                    }
                    <span class="suggestion-name">{{ conn.name }}</span>
                    <span class="suggestion-headline">{{ conn.headline }}</span>
                    <span class="suggestion-mutual">{{ conn.mutualConnections }} conexiones en común</span>
                    <button class="btn btn-outline btn-sm btn-block" (click)="connect(conn.id)">
                      @if (conn.pendingSent) {
                        Pendiente
                      } @else {
                        + Conectar
                      }
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .network-page { padding: 24px 0; }
    .network-container { max-width: 1000px; margin: 0 auto; padding: 0 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .network-left, .network-right { display: flex; flex-direction: column; gap: 16px; }
    .network-section-card { padding: 20px 24px; }
    .section-title { font-size: 18px; font-weight: 700; }
    .section-count { font-size: 13px; color: var(--red-700); font-weight: 600; margin-bottom: 16px; }
    .empty-text { font-size: 13px; color: var(--text-muted); padding: 16px 0; }
    .invite-item { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
    .invite-item:last-child { border-bottom: none; }
    .invite-info, .conn-info { display: flex; flex-direction: column; flex: 1; }
    .invite-name, .conn-name { font-size: 14px; font-weight: 600; }
    .invite-headline, .conn-headline { font-size: 12px; color: var(--text-secondary); }
    .invite-mutual, .conn-mutual { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
    .invite-actions { display: flex; gap: 8px; }
    .conn-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .conn-item:last-child { border-bottom: none; }
    .suggestions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .suggestion-card { border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; text-align: center; }
    .suggestion-card:hover { box-shadow: var(--shadow-md); }
    .suggestion-banner { height: 40px; background: linear-gradient(135deg, var(--red-400), var(--red-600)); }
    .suggestion-body { padding: 0 12px 16px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .suggestion-avatar { margin-top: -20px; border: 3px solid var(--surface); }
    .suggestion-name { font-size: 14px; font-weight: 600; margin-top: 4px; }
    .suggestion-headline { font-size: 11px; color: var(--text-secondary); text-align: center; }
    .suggestion-mutual { font-size: 11px; color: var(--text-muted); margin-bottom: 8px; }
    @media (max-width: 768px) { .network-container { grid-template-columns: 1fr; } .suggestions-grid { grid-template-columns: 1fr; } }
  `]
})
export class NetworkComponent {
  private data = inject(DataService);

  pendingInvitations = computed(() => this.data.connections().filter(c => c.pendingReceived));
  myConnections = computed(() => this.data.connections().filter(c => c.connected));
  suggestions = computed(() => this.data.connections().filter(c => !c.connected && !c.pendingReceived));

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  accept(id: string): void {
    this.data.acceptConnectRequest(id);
  }

  ignore(id: string): void {
    this.data.removeConnection(id);
  }

  remove(id: string): void {
    this.data.removeConnection(id);
  }

  connect(id: string): void {
    this.data.sendConnectRequest(id);
  }
}
