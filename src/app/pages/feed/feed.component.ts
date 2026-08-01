import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { Post, UserProfile } from '../../models';

@Component({
  selector: 'app-feed',
  imports: [RouterLink, FormsModule],
  template: `
    <div class="feed-layout">
      <!-- Left Sidebar -->
      <aside class="sidebar-left">
        <div class="card profile-card">
          <div class="profile-banner"></div>
          <div class="profile-info">
            @if (user()?.picture) {
              <img [src]="user()!.picture" class="avatar profile-avatar" style="width:72px;height:72px" alt="Profile" />
            } @else {
              <div class="avatar-placeholder profile-avatar" style="width:72px;height:72px;font-size:28px;background:var(--red-600)">
                {{ initials() }}
              </div>
            }
            <h3 class="profile-name">{{ user()?.name }}</h3>
            <p class="profile-headline">{{ profile().headline }}</p>
            <p class="profile-location">{{ profile().location }}</p>
          </div>
          <div class="divider"></div>
          <div class="profile-stats">
            <div class="stat-row">
              <span class="stat-label">Visitantes del perfil</span>
              <span class="stat-value">142</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Conexiones</span>
              <span class="stat-value">{{ profile().connectionsCount }}</span>
            </div>
          </div>
          <div class="divider"></div>
          <div class="profile-items">
            <p class="item-label">Elementos</p>
            <div class="item-row">
              <span class="item-icon">🔖</span>
              <span>Publicaciones guardadas</span>
            </div>
          </div>
        </div>

        <div class="card recent-card">
          <p class="recent-title">Reciente</p>
          <div class="recent-item">
            <span class="recent-icon">#</span>
            <span>angular</span>
          </div>
          <div class="recent-item">
            <span class="recent-icon">#</span>
            <span>typescript</span>
          </div>
          <div class="recent-item">
            <span class="recent-icon">#</span>
            <span>socialimpact</span>
          </div>
          <div class="recent-item">
            <span class="recent-icon">#</span>
            <span>frontend</span>
          </div>
          <div class="recent-item">
            <span class="recent-icon">#</span>
            <span>opentowork</span>
          </div>
        </div>
      </aside>

      <!-- Center Feed -->
      <div class="feed-center">
        <!-- Create Post -->
        <div class="card create-post-card">
          <div class="create-post-top">
            @if (user()?.picture) {
              <img [src]="user()!.picture" class="avatar" style="width:48px;height:48px" alt="Me" />
            } @else {
              <div class="avatar-placeholder" style="width:48px;height:48px;font-size:18px;background:var(--red-600)">
                {{ initials() }}
              </div>
            }
            <button class="create-post-input" (click)="showCreateModal = true">
              Comienza una publicación, {{ user()?.given_name }}...
            </button>
          </div>
          <div class="create-post-actions">
            <button class="post-action-btn" (click)="showCreateModal = true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              Foto
            </button>
            <button class="post-action-btn" (click)="showCreateModal = true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"/>
                <rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
              Video
            </button>
            <button class="post-action-btn" (click)="showCreateModal = true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Evento
            </button>
            <button class="post-action-btn" (click)="showCreateModal = true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Escribir artículo
            </button>
          </div>
        </div>

        <!-- Sort divider -->
        <div class="sort-divider">
          <hr class="sort-line" />
          <span class="sort-text">Ordenar por: <strong>Destacadas</strong></span>
        </div>

        <!-- Posts -->
        @for (post of data.posts(); track post.id) {
          <article class="card post-card">
            <div class="post-header">
              @if (post.authorPicture) {
                <img [src]="post.authorPicture" class="avatar" style="width:48px;height:48px" [alt]="post.authorName" />
              } @else {
                <div class="avatar-placeholder" style="width:48px;height:48px;font-size:18px;background:var(--red-500)">
                  {{ getInitials(post.authorName) }}
                </div>
              }
              <div class="post-author">
                <span class="post-author-name">{{ post.authorName }}</span>
                <span class="post-author-headline">{{ post.authorHeadline }}</span>
                <span class="post-time">{{ timeAgo(post.timestamp) }}</span>
              </div>
              <button class="post-more">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
              </button>
            </div>

            <div class="post-content">
              <p>{{ post.content }}</p>
            </div>

            @if (post.image) {
              <div class="post-image">
                <img [src]="post.image" alt="Post image" />
              </div>
            }

            <div class="post-stats">
              <span class="post-reactions">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--red-600)" stroke="var(--red-600)" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                {{ post.likes.length }}
              </span>
              <span class="post-meta-right">
                <span>{{ post.comments.length }} comentarios</span>
                <span>{{ post.shares }} compartidos</span>
              </span>
            </div>

            <div class="divider"></div>

            <div class="post-actions">
              <button class="post-action" [class.liked]="post.likes.includes(currentUserId())" (click)="toggleLike(post)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                Me gusta
              </button>
              <button class="post-action" (click)="toggleComments(post)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
                Comentar
              </button>
              <button class="post-action" (click)="sharePost(post)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <path d="M8.59 13.51l6.83 3.07M15.41 6.49l-6.82 3.07"/>
                </svg>
                Compartir
              </button>
              <button class="post-action" [class.saved]="post.saved" (click)="toggleSave(post)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                </svg>
                {{ post.saved ? 'Guardado' : 'Guardar' }}
              </button>
            </div>

            @if (expandedComments()[post.id]) {
              <div class="divider"></div>
              <div class="comments-section">
                <div class="comment-input-row">
                  @if (user()?.picture) {
                    <img [src]="user()!.picture" class="avatar" style="width:32px;height:32px" alt="Me" />
                  } @else {
                    <div class="avatar-placeholder" style="width:32px;height:32px;font-size:13px;background:var(--red-600)">
                      {{ initials() }}
                    </div>
                  }
                  <div class="comment-input-wrap">
                    <input
                      type="text"
                      class="comment-input"
                      placeholder="Añade un comentario..."
                      [(ngModel)]="commentInputs()[post.id]"
                      (keyup.enter)="addComment(post)"
                    />
                    <button class="comment-submit" (click)="addComment(post)">Publicar</button>
                  </div>
                </div>

                @for (comment of post.comments; track comment.id) {
                  <div class="comment-item">
                    @if (comment.authorPicture) {
                      <img [src]="comment.authorPicture" class="avatar" style="width:32px;height:32px" [alt]="comment.authorName" />
                    } @else {
                      <div class="avatar-placeholder" style="width:32px;height:32px;font-size:13px;background:var(--red-400)">
                        {{ getInitials(comment.authorName) }}
                      </div>
                    }
                    <div class="comment-body">
                      <div class="comment-bubble">
                        <span class="comment-author">{{ comment.authorName }}</span>
                        <p>{{ comment.content }}</p>
                      </div>
                      <div class="comment-meta">
                        <span>{{ timeAgo(comment.timestamp) }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </article>
        }
      </div>

      <!-- Right Sidebar -->
      <aside class="sidebar-right">
        <div class="card news-card">
          <p class="news-title">Noticias</p>
          <div class="news-item">
            <span class="news-dot"></span>
            <div>
              <p class="news-headline">Angular 19 trae las signals a la corriente principal</p>
              <p class="news-time">Hace 3h • 4,210 lectores</p>
            </div>
          </div>
          <div class="news-item">
            <span class="news-dot"></span>
            <div>
              <p class="news-headline">Tecnología para el bien: las ONG adoptan stacks web modernos</p>
              <p class="news-time">Hace 8h • 1,830 lectores</p>
            </div>
          </div>
          <div class="news-item">
            <span class="news-dot"></span>
            <div>
              <p class="news-headline">Tendencias de trabajo remoto: 60% de devs prefieren híbrido</p>
              <p class="news-time">Hace 1d • 9,540 lectores</p>
            </div>
          </div>
        </div>

        <div class="card suggestions-card">
          <p class="suggestions-title">Añade a tu feed</p>
          @for (conn of suggestedConnections(); track conn.id) {
            <div class="suggestion-item">
              @if (conn.picture) {
                <img [src]="conn.picture" class="avatar" style="width:40px;height:40px" [alt]="conn.name" />
              } @else {
                <div class="avatar-placeholder" style="width:40px;height:40px;font-size:15px;background:var(--red-500)">
                  {{ getInitials(conn.name) }}
                </div>
              }
              <div class="suggestion-info">
                <span class="suggestion-name">{{ conn.name }}</span>
                <span class="suggestion-headline">{{ conn.headline }}</span>
                <button class="btn btn-outline btn-sm mt-2" (click)="connect(conn.id)">
                  + Conectar
                </button>
              </div>
            </div>
          }
          <div class="divider"></div>
          <a class="view-all" routerLink="/network">Ver todas las recomendaciones →</a>
        </div>

        <div class="footer-links">
          <span>Acerca de</span> · <span>Accesibilidad</span> · <span>Centro de ayuda</span>
          <br />
          <span>Privacidad y Términos</span> · <span>Opciones de anuncios</span> · <span>Publicidad</span>
          <br />
          <span>Servicios empresariales</span> · <span>Obtén la app</span>
          <br />
          <span>Más</span>
          <p class="footer-copy">GreenCode Corporation © 2025</p>
        </div>
      </aside>
    </div>

    <!-- Create Post Modal -->
    @if (showCreateModal) {
      <div class="modal-overlay" (click)="showCreateModal = false">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Crear una publicación</h3>
            <button class="modal-close" (click)="showCreateModal = false">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="divider"></div>
          <div class="modal-body">
            <div class="modal-user">
              @if (user()?.picture) {
                <img [src]="user()!.picture" class="avatar" style="width:48px;height:48px" alt="Me" />
              } @else {
                <div class="avatar-placeholder" style="width:48px;height:48px;font-size:18px;background:var(--red-600)">
                  {{ initials() }}
                </div>
              }
              <div>
                <p class="modal-user-name">{{ user()?.name }}</p>
                <p class="modal-user-headline">{{ profile().headline }}</p>
              </div>
            </div>
            <textarea
              class="modal-textarea"
              placeholder="¿De qué quieres hablar?"
              [(ngModel)]="newPostContent"
              rows="6"
            ></textarea>
          </div>
          <div class="modal-footer">
            <button class="modal-attach">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </button>
            <button class="btn btn-primary" [disabled]="!newPostContent.trim()" (click)="createPost()">
              Publicar
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .feed-layout {
      display: grid;
      grid-template-columns: 240px 1fr 300px;
      gap: 24px;
      max-width: 1128px;
      margin: 0 auto;
      padding: 24px 16px;
    }
    .sidebar-left, .sidebar-right {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .profile-card { text-align: center; }
    .profile-banner {
      height: 56px;
      background: linear-gradient(135deg, var(--red-500), var(--red-700));
    }
    .profile-info { padding: 0 16px 12px; }
    .profile-avatar {
      margin: -36px auto 8px;
      border: 3px solid var(--surface);
    }
    .profile-name { font-size: 16px; font-weight: 700; }
    .profile-headline { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
    .profile-location { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
    .profile-stats { padding: 12px 16px; text-align: left; }
    .stat-row { display: flex; justify-content: space-between; padding: 4px 0; }
    .stat-label { font-size: 12px; color: var(--text-secondary); }
    .stat-value { font-size: 12px; font-weight: 700; color: var(--red-700); }
    .profile-items { padding: 12px 16px; text-align: left; }
    .item-label { font-size: 11px; color: var(--text-muted); margin-bottom: 8px; }
    .item-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
    .item-icon { font-size: 14px; }
    .recent-card { padding: 12px 16px; }
    .recent-title { font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
    .recent-item { display: flex; align-items: center; gap: 8px; padding: 4px 0; font-size: 13px; color: var(--text-primary); cursor: pointer; }
    .recent-item:hover { color: var(--red-700); }
    .recent-icon { color: var(--text-muted); }

    .create-post-card { padding: 16px; }
    .create-post-top { display: flex; align-items: center; gap: 12px; }
    .create-post-input {
      flex: 1;
      text-align: left;
      padding: 12px 16px;
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
      background: var(--bg);
    }
    .create-post-input:hover { background: var(--surface-hover); }
    .create-post-actions { display: flex; justify-content: space-around; margin-top: 12px; }
    .post-action-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600;
      color: var(--text-secondary);
    }
    .post-action-btn:hover { background: var(--surface-hover); }
    .action-icon { font-size: 16px; }

    .sort-divider { display: flex; align-items: center; gap: 12px; margin: 8px 0; }
    .sort-line { flex: 1; border: none; border-top: 1px solid var(--border); }
    .sort-text { font-size: 12px; color: var(--text-muted); }

    .post-card { margin-bottom: 16px; }
    .post-header { display: flex; align-items: flex-start; gap: 12px; padding: 16px 16px 8px; }
    .post-author { display: flex; flex-direction: column; flex: 1; }
    .post-author-name { font-size: 14px; font-weight: 600; }
    .post-author-headline { font-size: 12px; color: var(--text-secondary); }
    .post-time { font-size: 11px; color: var(--text-muted); }
    .post-more { color: var(--text-muted); padding: 4px; border-radius: 50%; }
    .post-more:hover { background: var(--surface-hover); }
    .post-content { padding: 0 16px 12px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .post-image img { width: 100%; display: block; }
    .post-stats { display: flex; justify-content: space-between; padding: 8px 16px; font-size: 12px; color: var(--text-muted); }
    .post-reactions { display: flex; align-items: center; gap: 4px; }
    .reaction-icon { font-size: 14px; }
    .post-meta-right { display: flex; gap: 12px; }
    .post-actions { display: flex; justify-content: space-around; padding: 8px 8px; }
    .post-action {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px;
      border-radius: var(--radius-sm);
      font-size: 13px; font-weight: 600;
      color: var(--text-secondary);
    }
    .post-action:hover { background: var(--surface-hover); color: var(--text-primary); }
    .post-action.liked { color: var(--red-600); }
    .post-action.saved { color: var(--red-600); }
    .comments-section { padding: 0 16px 16px; }
    .comment-input-row { display: flex; gap: 8px; margin-bottom: 12px; }
    .comment-input-wrap { flex: 1; display: flex; align-items: center; gap: 4px; border: 1px solid var(--border); border-radius: var(--radius-full); padding: 0 4px 0 16px; }
    .comment-input { flex: 1; border: none; outline: none; padding: 8px 0; font-size: 13px; background: transparent; }
    .comment-submit { padding: 6px 16px; border-radius: var(--radius-full); font-weight: 600; font-size: 13px; color: var(--red-600); }
    .comment-submit:hover { background: var(--red-50); }
    .comment-item { display: flex; gap: 8px; margin-bottom: 12px; }
    .comment-body { flex: 1; }
    .comment-bubble { background: var(--bg); border-radius: var(--radius-md); padding: 8px 12px; }
    .comment-author { font-size: 13px; font-weight: 600; }
    .comment-bubble p { font-size: 13px; margin-top: 2px; }
    .comment-meta { font-size: 11px; color: var(--text-muted); padding: 4px 12px; display: flex; gap: 12px; }

    .news-card { padding: 12px 16px; }
    .news-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
    .news-item { display: flex; gap: 8px; padding: 6px 0; cursor: pointer; }
    .news-item:hover .news-headline { color: var(--red-700); }
    .news-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red-500); flex-shrink: 0; margin-top: 5px; }
    .news-headline { font-size: 13px; font-weight: 600; line-height: 1.4; }
    .news-time { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

    .suggestions-card { padding: 12px 16px; }
    .suggestions-title { font-size: 13px; font-weight: 700; margin-bottom: 12px; }
    .suggestion-item { display: flex; gap: 10px; padding: 8px 0; }
    .suggestion-info { display: flex; flex-direction: column; }
    .suggestion-name { font-size: 13px; font-weight: 600; }
    .suggestion-headline { font-size: 11px; color: var(--text-secondary); }
    .view-all { display: block; text-align: center; padding: 8px 0; font-size: 12px; font-weight: 600; }

    .footer-links { padding: 12px 16px; font-size: 11px; color: var(--text-muted); line-height: 2; }
    .footer-copy { margin-top: 8px; font-weight: 600; }

    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; }
    .modal-header h3 { font-size: 16px; font-weight: 700; }
    .modal-close { font-size: 18px; color: var(--text-secondary); padding: 4px 8px; border-radius: 50%; }
    .modal-close:hover { background: var(--surface-hover); }
    .modal-body { padding: 16px 20px; }
    .modal-user { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .modal-user-name { font-size: 14px; font-weight: 600; }
    .modal-user-headline { font-size: 12px; color: var(--text-secondary); }
    .modal-textarea { width: 100%; border: none; outline: none; resize: none; font-size: 15px; line-height: 1.6; }
    .modal-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px 16px; }
    .modal-attach { font-size: 20px; padding: 4px 8px; border-radius: var(--radius-sm); }
    .modal-attach:hover { background: var(--surface-hover); }

    @media (max-width: 1000px) {
      .feed-layout { grid-template-columns: 1fr; }
      .sidebar-left, .sidebar-right { display: none; }
    }
  `]
})
export class FeedComponent {
  private auth = inject(AuthService);
  data = inject(DataService);

  showCreateModal = false;
  newPostContent = '';
  commentInputs = signal<Record<string, string>>({});
  expandedComments = signal<Record<string, boolean>>({});

  user = computed(() => this.auth.user());
  currentUserId = computed(() => this.data.currentUserId());

  profile = computed<UserProfile>(() => this.buildProfile());

  suggestedConnections = computed(() =>
    this.data.connections().filter(c => !c.connected && !c.pendingSent).slice(0, 3)
  );

  initials = computed(() => {
    const u = this.auth.user();
    if (!u) return '?';
    return (u.given_name?.[0] || '') + (u.family_name?.[0] || '');
  });

  private buildProfile(): UserProfile {
    const u = this.auth.user();
    return {
      id: u?.sub || 'demo-user-001',
      name: u?.name || 'Demo User',
      givenName: u?.given_name || 'Demo',
      familyName: u?.family_name || 'User',
      picture: u?.picture || '',
      email: u?.email || '',
      headline: 'Software Engineer | Angular Enthusiast | Building for Social Impact',
      about: 'Passionate developer focused on building web applications that make a difference. Currently exploring Angular signals and modern web architecture.',
      location: 'San Francisco Bay Area',
      industry: 'Technology',
      experience: [
        { id: 'e1', title: 'Senior Frontend Engineer', company: 'TechFlow Inc.', startDate: '2022-01', endDate: null, description: 'Leading Angular development for enterprise SaaS products.' },
        { id: 'e2', title: 'Frontend Developer', company: 'StartupHub', startDate: '2020-03', endDate: '2021-12', description: 'Built and maintained Angular applications for startup clients.' },
      ],
      education: [
        { id: 'ed1', school: 'University of California, Berkeley', degree: 'B.S.', field: 'Computer Science', startYear: 2015, endYear: 2019 },
      ],
      coverPhoto: '',
      skills: [
        { name: 'Angular', endorsements: 12, endorsedByMe: false },
        { name: 'TypeScript', endorsements: 8, endorsedByMe: false },
        { name: 'RxJS', endorsements: 5, endorsedByMe: false },
        { name: 'CSS', endorsements: 3, endorsedByMe: false },
        { name: 'Node.js', endorsements: 6, endorsedByMe: false },
        { name: 'GraphQL', endorsements: 2, endorsedByMe: false },
        { name: 'Jest', endorsements: 1, endorsedByMe: false },
        { name: 'CI/CD', endorsements: 4, endorsedByMe: false },
      ],
      connectionsCount: 547,
      isCurrentUser: true,
    };
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
    const weeks = Math.floor(days / 7);
    return `${weeks}sem`;
  }

  createPost(): void {
    if (!this.newPostContent.trim()) return;
    this.data.addPost(this.newPostContent.trim(), null, this.profile());
    this.newPostContent = '';
    this.showCreateModal = false;
  }

  toggleLike(post: Post): void {
    this.data.toggleLike(post.id, this.currentUserId());
  }

  toggleComments(post: Post): void {
    const expanded = { ...this.expandedComments() };
    expanded[post.id] = !expanded[post.id];
    this.expandedComments.set(expanded);
  }

  addComment(post: Post): void {
    const text = this.commentInputs()[post.id] || '';
    if (!text.trim()) return;
    this.data.addComment(post.id, text.trim(), this.profile());
    const inputs = { ...this.commentInputs() };
    inputs[post.id] = '';
    this.commentInputs.set(inputs);
  }

  sharePost(post: Post): void {
    this.data.sharePost(post.id);
  }

  toggleSave(post: Post): void {
    this.data.toggleSavePost(post.id);
  }

  connect(connId: string): void {
    this.data.sendConnectRequest(connId);
  }
}
