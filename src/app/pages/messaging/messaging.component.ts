import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';
import { Conversation } from '../../models';

@Component({
  selector: 'app-messaging',
  imports: [FormsModule],
  template: `
    <div class="messaging-page">
      <div class="messaging-container">
        <!-- Conversation List -->
        <div class="conv-list-panel">
          <div class="conv-list-header">
            <h2 class="conv-list-title">Mensajes</h2>
            <button class="conv-compose">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          </div>
          <div class="conv-search">
            <input type="text" placeholder="Buscar mensajes" [(ngModel)]="searchQuery" class="conv-search-input" />
          </div>
          <div class="conv-list">
            @for (conv of filteredConversations(); track conv.id) {
              <div
                class="conv-item"
                [class.active]="selectedConv()?.id === conv.id"
                (click)="selectConv(conv)"
              >
                @if (conv.participantPicture) {
                  <img [src]="conv.participantPicture" class="avatar" style="width:48px;height:48px" [alt]="conv.participantName" />
                } @else {
                  <div class="avatar-placeholder" style="width:48px;height:48px;font-size:17px;background:var(--red-500)">
                    {{ getInitials(conv.participantName) }}
                  </div>
                }
                <div class="conv-item-info">
                  <div class="conv-item-top">
                    <span class="conv-item-name">{{ conv.participantName }}</span>
                    @if (conv.unread > 0) {
                      <span class="conv-unread-dot"></span>
                    }
                  </div>
                  <p class="conv-item-preview">{{ getLastMessage(conv) }}</p>
                  <span class="conv-item-time">{{ timeAgo(getLastTimestamp(conv)) }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Chat Panel -->
        <div class="chat-panel">
          @if (selectedConv(); as conv) {
            <div class="chat-header">
              @if (conv.participantPicture) {
                <img [src]="conv.participantPicture" class="avatar" style="width:40px;height:40px" [alt]="conv.participantName" />
              } @else {
                <div class="avatar-placeholder" style="width:40px;height:40px;font-size:15px;background:var(--red-500)">
                  {{ getInitials(conv.participantName) }}
                </div>
              }
              <div class="chat-header-info">
                <span class="chat-header-name">{{ conv.participantName }}</span>
                <span class="chat-header-headline">{{ conv.participantHeadline }}</span>
              </div>
            </div>

            <div class="messages-scroll" #scrollContainer>
              <div class="messages-list">
                @for (msg of conv.messages; track msg.id) {
                  <div class="message-row" [class.mine]="msg.senderId === currentUserId()">
                    <div class="message-bubble" [class.mine]="msg.senderId === currentUserId()">
                      <p>{{ msg.content }}</p>
                      <span class="message-time">{{ timeAgo(msg.timestamp) }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="message-input-bar">
              <button class="msg-attach">😊</button>
              <input
                type="text"
                class="msg-input"
                placeholder="Escribe un mensaje..."
                [(ngModel)]="messageText"
                (keyup.enter)="sendMessage()"
              />
              <button class="msg-send" (click)="sendMessage()">Enviar</button>
            </div>
          } @else {
            <div class="empty-state chat-empty">
              <div class="icon">💬</div>
              <p>Selecciona una conversación para empezar a mensajear</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .messaging-page { height: calc(100vh - 52px); }
    .messaging-container { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: 340px 1fr; height: 100%; }
    .conv-list-panel { border-right: 1px solid var(--border); display: flex; flex-direction: column; background: var(--surface); }
    .conv-list-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; }
    .conv-list-title { font-size: 18px; font-weight: 700; }
    .conv-compose { font-size: 18px; padding: 6px 10px; border-radius: 50%; color: var(--text-secondary); }
    .conv-compose:hover { background: var(--surface-hover); }
    .conv-search { padding: 0 16px 12px; }
    .conv-search-input { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; outline: none; background: var(--bg); }
    .conv-list { flex: 1; overflow-y: auto; }
    .conv-item { display: flex; gap: 12px; padding: 12px 20px; cursor: pointer; border-bottom: 1px solid var(--border); }
    .conv-item:hover { background: var(--surface-hover); }
    .conv-item.active { background: var(--red-50); border-left: 3px solid var(--red-600); }
    .conv-item-info { flex: 1; min-width: 0; }
    .conv-item-top { display: flex; justify-content: space-between; align-items: center; }
    .conv-item-name { font-size: 14px; font-weight: 600; }
    .conv-unread-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red-600); }
    .conv-item-preview { font-size: 12px; color: var(--text-secondary); margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .conv-item-time { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
    .chat-panel { display: flex; flex-direction: column; background: var(--bg); }
    .chat-header { display: flex; align-items: center; gap: 12px; padding: 16px 24px; border-bottom: 1px solid var(--border); background: var(--surface); }
    .chat-header-name { font-size: 15px; font-weight: 600; }
    .chat-header-headline { font-size: 12px; color: var(--text-secondary); }
    .messages-scroll { flex: 1; overflow-y: auto; padding: 20px; }
    .messages-list { display: flex; flex-direction: column; gap: 8px; max-width: 700px; margin: 0 auto; }
    .message-row { display: flex; }
    .message-row.mine { justify-content: flex-end; }
    .message-bubble { max-width: 70%; padding: 10px 14px; border-radius: var(--radius-md); background: var(--surface); border: 1px solid var(--border); }
    .message-bubble.mine { background: var(--red-600); color: #fff; border-color: var(--red-600); }
    .message-bubble p { font-size: 14px; line-height: 1.5; }
    .message-time { font-size: 10px; color: var(--text-muted); display: block; margin-top: 4px; }
    .message-bubble.mine .message-time { color: rgba(255,255,255,0.7); }
    .message-input-bar { display: flex; align-items: center; gap: 8px; padding: 12px 24px; border-top: 1px solid var(--border); background: var(--surface); }
    .msg-attach { font-size: 20px; padding: 6px; border-radius: 50%; }
    .msg-attach:hover { background: var(--surface-hover); }
    .msg-input { flex: 1; padding: 10px 16px; border: 1px solid var(--border); border-radius: var(--radius-full); font-size: 14px; outline: none; }
    .msg-input:focus { border-color: var(--red-400); }
    .msg-send { padding: 8px 20px; border-radius: var(--radius-full); font-weight: 600; font-size: 14px; color: var(--red-600); }
    .msg-send:hover { background: var(--red-50); }
    .chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    @media (max-width: 768px) { .messaging-container { grid-template-columns: 1fr; } .conv-list-panel { display: none; } }
  `]
})
export class MessagingComponent {
  private data = inject(DataService);
  private auth = inject(AuthService);

  selectedConv = signal<Conversation | null>(null);
  messageText = '';
  searchQuery = '';

  currentUserId = computed(() => this.data.currentUserId());

  filteredConversations = computed(() => {
    const q = this.searchQuery.toLowerCase();
    if (!q) return this.data.conversations();
    return this.data.conversations().filter(c =>
      c.participantName.toLowerCase().includes(q)
    );
  });

  constructor() {
    const convs = this.data.conversations();
    if (convs.length > 0) {
      this.selectedConv.set(convs[0]);
    }
  }

  selectConv(conv: Conversation): void {
    this.selectedConv.set(conv);
    this.data.markConversationRead(conv.id);
  }

  sendMessage(): void {
    const conv = this.selectedConv();
    if (!conv || !this.messageText.trim()) return;
    this.data.sendMessage(conv.id, this.messageText.trim(), this.currentUserId());
    this.messageText = '';
  }

  getLastMessage(conv: Conversation): string {
    return conv.messages[conv.messages.length - 1]?.content || '';
  }

  getLastTimestamp(conv: Conversation): number {
    return conv.messages[conv.messages.length - 1]?.timestamp || 0;
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
    return `${days}d`;
  }
}
