import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { RealApiService } from '../../services/real-api.service';
import { Experience, Education } from '../../models';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, NgClass],
  template: `
    <div class="profile-page">
      <div class="profile-container">
        <!-- Profile Header Card -->
        <div class="card profile-header-card">
          <div class="profile-cover" [style.backgroundImage]="coverStyle()" (click)="editCover()">
            <div class="cover-edit-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              <span>Editar foto de portada</span>
            </div>
          </div>
          <div class="profile-header-body">
            <div class="profile-avatar-wrapper" (click)="editAvatar()">
              @if (profile()?.picture) {
                <img [src]="profile()!.picture" class="avatar profile-avatar-lg" style="width:120px;height:120px" alt="Profile" />
              } @else {
                <div class="avatar-placeholder profile-avatar-lg" style="width:120px;height:120px;font-size:42px;background:var(--red-600)">
                  {{ initials() }}
                </div>
              }
              <div class="avatar-edit-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="profile-details">
            <div class="profile-details-top">
              <div>
                <h1 class="profile-full-name">{{ profile()?.name }}</h1>
                @if (editingHeadline()) {
                  <input class="headline-input" [(ngModel)]="headlineDraft" (keyup.enter)="saveHeadline()" placeholder="Titular profesional" />
                } @else {
                  <p class="profile-title" (click)="startEditHeadline()">{{ profile()?.headline }}</p>
                }
                <p class="profile-loc">{{ profile()?.location }} - <span class="contact-info">Info de contacto</span></p>
                <p class="profile-connections">{{ profile()?.connectionsCount }} conexiones</p>
              </div>
              <div class="profile-actions">
                <button class="btn btn-primary" (click)="startEditProfile()">Editar perfil</button>
                <button class="btn btn-outline" (click)="showAddExperience.set(true)">Añadir sección</button>
              </div>
            </div>
            <div class="profile-badges">
              <span class="badge badge-red">Disponible para trabajar</span>
              <span class="badge badge-red">Contratando</span>
              <span class="badge badge-red">Ofreciendo servicios</span>
            </div>
          </div>
        </div>

        <!-- Analytics Card -->
        @if (analytics()) {
          <div class="card section-card analytics-card">
            <div class="section-header">
              <h2>Analíticas</h2>
              <span class="analytics-period">Últimos 7 días</span>
            </div>
            <div class="analytics-grid">
              <div class="analytics-item">
                <span class="analytics-num">{{ analytics()!.profileViews }}</span>
                <span class="analytics-label">Visitas al perfil</span>
              </div>
              <div class="analytics-item">
                <span class="analytics-num">{{ analytics()!.postImpressions }}</span>
                <span class="analytics-label">Impresiones de publicaciones</span>
              </div>
              <div class="analytics-item">
                <span class="analytics-num">{{ analytics()!.searchAppearances }}</span>
                <span class="analytics-label">Apariciones en búsquedas</span>
              </div>
              <div class="analytics-item">
                <span class="analytics-num">{{ analytics()!.viewerCount }}</span>
                <span class="analytics-label">Visitantes únicos</span>
              </div>
            </div>
            <div class="analytics-chart">
              @for (day of analytics()!.weeklyViews; track day.day) {
                <div class="chart-bar-group">
                  <div class="chart-bar" [style.height.px]="day.views * 2"></div>
                  <span class="chart-label">{{ day.day }}</span>
                </div>
              }
            </div>
          </div>
        }

        <!-- Activity Card -->
        @if (activities().length > 0) {
          <div class="card section-card">
            <div class="section-header">
              <h2>Actividad</h2>
            </div>
            <div class="activity-list">
              @for (act of activities().slice(0, 6); track act.id) {
                <div class="activity-item">
                  <div class="activity-icon" [ngClass]="'act-' + act.type">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      @switch (act.type) {
                        @case ('post') { <path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/> }
                        @case ('like') { <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/> }
                        @case ('comment') { <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/> }
                        @case ('job') { <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/> }
                        @case ('connection') { <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/> }
                        @default { <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/> }
                      }
                    </svg>
                  </div>
                  <div class="activity-content">
                    <p class="activity-text">{{ act.text }}</p>
                    <span class="activity-time">{{ timeAgo(act.timestamp) }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- About Section -->
        <div class="card section-card">
          <div class="section-header">
            <h2>Acerca de</h2>
            <button class="section-edit" (click)="startEditAbout()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          </div>
          @if (editSection === 'about') {
            <div class="edit-form">
              <textarea class="edit-textarea" [(ngModel)]="aboutDraft" rows="4" placeholder="Escribe sobre ti..."></textarea>
              <div class="flex gap-2 mt-2">
                <button class="btn btn-primary btn-sm" (click)="saveAbout()">Guardar</button>
                <button class="btn btn-ghost btn-sm" (click)="editSection = ''">Cancelar</button>
              </div>
            </div>
          } @else {
            <p class="about-text">{{ profile()?.about }}</p>
          }
        </div>

        <!-- Experience Section -->
        <div class="card section-card">
          <div class="section-header">
            <h2>Experiencia</h2>
            <button class="section-add" (click)="showAddExperience.set(true); editingExpId.set('')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
          @for (exp of profile()?.experience; track exp.id) {
            <div class="exp-item">
              <div class="exp-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
                </svg>
              </div>
              <div class="exp-content">
                <div class="exp-top">
                  <div>
                    <h3 class="exp-title">{{ exp.title }}</h3>
                    <p class="exp-company">{{ exp.company }}</p>
                    <p class="exp-dates">{{ formatDate(exp.startDate) }} - {{ exp.endDate ? formatDate(exp.endDate) : 'Actualidad' }}</p>
                    <p class="exp-desc">{{ exp.description }}</p>
                  </div>
                  <div class="exp-actions">
                    <button class="exp-edit-btn" (click)="startEditExperience(exp)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </button>
                    <button class="exp-delete-btn" (click)="deleteExperience(exp.id)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Education Section -->
        <div class="card section-card">
          <div class="section-header">
            <h2>Educación</h2>
            <button class="section-add" (click)="showAddEducation.set(true); editingEduId.set('')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
          @for (edu of profile()?.education; track edu.id) {
            <div class="exp-item">
              <div class="exp-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div class="exp-content">
                <div class="exp-top">
                  <div>
                    <h3 class="exp-title">{{ edu.school }}</h3>
                    <p class="exp-company">{{ edu.degree }} en {{ edu.field }}</p>
                    <p class="exp-dates">{{ edu.startYear }} - {{ edu.endYear ? edu.endYear : 'Actualidad' }}</p>
                  </div>
                  <div class="exp-actions">
                    <button class="exp-edit-btn" (click)="startEditEducation(edu)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                      </svg>
                    </button>
                    <button class="exp-delete-btn" (click)="deleteEducation(edu.id)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Skills Section -->
        <div class="card section-card">
          <div class="section-header">
            <h2>Habilidades</h2>
            <button class="section-add" (click)="showAddSkill.set(true)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
          <div class="skills-list">
            @for (skill of profile()?.skills; track skill.name) {
              <div class="skill-item">
                <div class="skill-info">
                  <span class="skill-name">{{ skill.name }}</span>
                  <span class="skill-endorsements">{{ skill.endorsements }} recomendaciones</span>
                </div>
                <div class="skill-actions">
                  <button class="endorse-btn" [class.endorsed]="skill.endorsedByMe" (click)="endorseSkill(skill.name)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                    {{ skill.endorsedByMe ? 'Recomendado' : 'Recomendar' }}
                  </button>
                  <button class="skill-remove" (click)="removeSkill(skill.name)">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- LinkedIn Info -->
        <div class="card section-card linkedin-info-card">
          <div class="section-header">
            <h2>Cuenta de LinkedIn</h2>
          </div>
          <div class="linkedin-info">
            <div class="linkedin-row">
              <span class="linkedin-label">Conectado vía:</span>
              <span class="linkedin-value">Iniciar sesión con LinkedIn (OpenID Connect)</span>
            </div>
            <div class="linkedin-row">
              <span class="linkedin-label">Correo:</span>
              <span class="linkedin-value">{{ profile()?.email }}</span>
            </div>
            <div class="linkedin-row">
              <span class="linkedin-label">Correo verificado:</span>
              <span class="linkedin-value">{{ user()?.email_verified ? 'Sí' : 'No' }}</span>
            </div>
            <div class="linkedin-row">
              <span class="linkedin-label">LinkedIn ID:</span>
              <span class="linkedin-value">{{ user()?.sub }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Cover Photo Modal -->
    @if (showCoverModal()) {
      <div class="modal-overlay" (click)="showCoverModal.set(false)">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Actualizar foto de portada</h3>
            <button class="modal-close" (click)="showCoverModal.set(false)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="divider"></div>
          <div class="modal-body">
            <p class="modal-label">Elige entre fotos de portada predefinidas (de Picsum Photos):</p>
            <div class="cover-options">
              @for (opt of coverOptions; track opt) {
                <div class="cover-option" [class.selected]="coverDraft === opt" (click)="coverDraft = opt">
                  <img [src]="opt" alt="Cover option" />
                </div>
              }
            </div>
            <p class="modal-label mt-3">O pega una URL de imagen personalizada:</p>
            <input class="modal-input" [(ngModel)]="coverDraft" placeholder="https://..." />
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="showCoverModal.set(false)">Cancelar</button>
            <button class="btn btn-primary" (click)="saveCover()">Guardar portada</button>
          </div>
        </div>
      </div>
    }

    <!-- Edit Avatar Modal -->
    @if (showAvatarModal()) {
      <div class="modal-overlay" (click)="showAvatarModal.set(false)">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Actualizar foto de perfil</h3>
            <button class="modal-close" (click)="showAvatarModal.set(false)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="divider"></div>
          <div class="modal-body">
            <div class="avatar-preview">
              @if (avatarDraft) {
                <img [src]="avatarDraft" class="avatar" style="width:120px;height:120px" alt="Preview" />
              } @else {
                <div class="avatar-placeholder" style="width:120px;height:120px;font-size:42px;background:var(--red-600)">{{ initials() }}</div>
              }
            </div>
            <p class="modal-label">Elige entre avatares predefinidos (de DiceBear):</p>
            <div class="avatar-options">
              @for (opt of avatarOptions; track opt) {
                <div class="avatar-option" [class.selected]="avatarDraft === opt" (click)="avatarDraft = opt">
                  <img [src]="opt" alt="Avatar option" />
                </div>
              }
            </div>
            <p class="modal-label mt-3">O pega una URL de imagen personalizada:</p>
            <input class="modal-input" [(ngModel)]="avatarDraft" placeholder="https://..." />
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="showAvatarModal.set(false)">Cancelar</button>
            <button class="btn btn-primary" (click)="saveAvatar()">Guardar foto</button>
          </div>
        </div>
      </div>
    }

    <!-- Add/Edit Experience Modal -->
    @if (showAddExperience()) {
      <div class="modal-overlay" (click)="showAddExperience.set(false)">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingExpId() ? 'Editar' : 'Añadir' }} experiencia</h3>
            <button class="modal-close" (click)="showAddExperience.set(false)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="divider"></div>
          <div class="modal-body">
            <label class="modal-label">Título</label>
            <input class="modal-input" [(ngModel)]="expDraft.title" placeholder="Cargo" />
            <label class="modal-label">Empresa</label>
            <input class="modal-input" [(ngModel)]="expDraft.company" placeholder="Nombre de la empresa" />
            <label class="modal-label">Fecha de inicio</label>
            <input class="modal-input" type="month" [(ngModel)]="expDraft.startDate" />
            <label class="modal-label">Fecha de fin (dejar vacío para actual)</label>
            <input class="modal-input" type="month" [(ngModel)]="expDraft.endDate" />
            <label class="modal-label">Descripción</label>
            <textarea class="modal-textarea" [(ngModel)]="expDraft.description" rows="3" placeholder="¿Qué hiciste?"></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="showAddExperience.set(false)">Cancelar</button>
            <button class="btn btn-primary" (click)="saveExperience()">{{ editingExpId() ? 'Guardar' : 'Añadir' }}</button>
          </div>
        </div>
      </div>
    }

    <!-- Add/Edit Education Modal -->
    @if (showAddEducation()) {
      <div class="modal-overlay" (click)="showAddEducation.set(false)">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingEduId() ? 'Editar' : 'Añadir' }} educación</h3>
            <button class="modal-close" (click)="showAddEducation.set(false)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="divider"></div>
          <div class="modal-body">
            <label class="modal-label">Escuela</label>
            <input class="modal-input" [(ngModel)]="eduDraft.school" placeholder="Nombre de la escuela" />
            <label class="modal-label">Grado</label>
            <input class="modal-input" [(ngModel)]="eduDraft.degree" placeholder="Licenciatura, Máster, etc." />
            <label class="modal-label">Campo de estudio</label>
            <input class="modal-input" [(ngModel)]="eduDraft.field" placeholder="Informática, etc." />
            <label class="modal-label">Año de inicio</label>
            <input class="modal-input" type="number" [(ngModel)]="eduDraft.startYear" placeholder="2015" />
            <label class="modal-label">Año de fin (dejar vacío para actual)</label>
            <input class="modal-input" type="number" [(ngModel)]="eduDraft.endYear" placeholder="2019" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="showAddEducation.set(false)">Cancelar</button>
            <button class="btn btn-primary" (click)="saveEducation()">{{ editingEduId() ? 'Guardar' : 'Añadir' }}</button>
          </div>
        </div>
      </div>
    }

    <!-- Add Skill Modal -->
    @if (showAddSkill()) {
      <div class="modal-overlay" (click)="showAddSkill.set(false)">
        <div class="modal-box" (click)="$event.stopPropagation()" style="max-width:400px">
          <div class="modal-header">
            <h3>Añadir una habilidad</h3>
            <button class="modal-close" (click)="showAddSkill.set(false)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="divider"></div>
          <div class="modal-body">
            <label class="modal-label">Nombre de la habilidad</label>
            <input class="modal-input" [(ngModel)]="newSkillName" placeholder="ej. Python, Docker, Kubernetes" (keyup.enter)="addSkill()" />
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="showAddSkill.set(false)">Cancelar</button>
            <button class="btn btn-primary" (click)="addSkill()">Añadir</button>
          </div>
        </div>
      </div>
    }

    <!-- Edit Profile Modal (headline, about, location) -->
    @if (showEditModal()) {
      <div class="modal-overlay" (click)="showEditModal.set(false)">
        <div class="modal-box" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Editar perfil</h3>
            <button class="modal-close" (click)="showEditModal.set(false)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="divider"></div>
          <div class="modal-body">
            <label class="modal-label">Titular</label>
            <input class="modal-input" [(ngModel)]="editDraft.headline" placeholder="Titular profesional" />
            <label class="modal-label">Ubicación</label>
            <input class="modal-input" [(ngModel)]="editDraft.location" placeholder="Ciudad, Estado" />
            <label class="modal-label">Acerca de</label>
            <textarea class="modal-textarea" [(ngModel)]="editDraft.about" rows="4" placeholder="Escribe sobre ti..."></textarea>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" (click)="showEditModal.set(false)">Cancelar</button>
            <button class="btn btn-primary" (click)="saveProfile()">Guardar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .profile-page { padding: 24px 0; }
    .profile-container { max-width: 800px; margin: 0 auto; padding: 0 16px; display: flex; flex-direction: column; gap: 16px; }
    .profile-header-card { overflow: visible; }
    .profile-cover { height: 200px; background: linear-gradient(135deg, var(--red-500), var(--red-800)); background-size: cover; background-position: center; cursor: pointer; position: relative; }
    .cover-edit-overlay {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      color: #fff; font-size: 14px; font-weight: 600;
      opacity: 0; transition: opacity 0.2s;
      background: rgba(0,0,0,0.3);
    }
    .profile-cover:hover .cover-edit-overlay { opacity: 1; }
    .profile-header-body { position: relative; padding: 0 24px; }
    .profile-avatar-wrapper { position: relative; display: inline-block; cursor: pointer; }
    .profile-avatar-lg { margin-top: -60px; border: 4px solid var(--surface); position: relative; z-index: 1; }
    .avatar-edit-badge {
      position: absolute; bottom: 0; right: 0;
      width: 36px; height: 36px;
      background: var(--red-600); color: #fff;
      border: 3px solid var(--surface);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      z-index: 2;
      margin-bottom: -4px;
    }
    .profile-details { padding: 0 24px 24px; }
    .profile-details-top { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 12px; }
    .profile-full-name { font-size: 24px; font-weight: 700; }
    .profile-title { font-size: 15px; color: var(--text-primary); margin-top: 4px; cursor: pointer; }
    .profile-title:hover { color: var(--red-700); }
    .headline-input { font-size: 15px; padding: 4px 8px; border: 1.5px solid var(--red-400); border-radius: var(--radius-sm); width: 100%; max-width: 400px; outline: none; margin-top: 4px; }
    .profile-loc { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
    .contact-info { color: var(--red-700); font-weight: 600; cursor: pointer; }
    .profile-connections { font-size: 13px; color: var(--red-700); font-weight: 600; margin-top: 4px; }
    .profile-actions { display: flex; gap: 8px; }
    .profile-badges { display: flex; gap: 8px; margin-top: 16px; }
    .section-card { padding: 20px 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2 { font-size: 18px; font-weight: 700; }
    .section-edit, .section-add { padding: 4px 8px; border-radius: 50%; color: var(--text-secondary); display: flex; align-items: center; }
    .section-edit:hover, .section-add:hover { background: var(--surface-hover); color: var(--red-600); }
    .about-text { font-size: 14px; line-height: 1.6; color: var(--text-primary); }
    .edit-textarea { width: 100%; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px; font-size: 14px; resize: vertical; outline: none; }
    .edit-textarea:focus { border-color: var(--red-400); }
    .exp-item { display: flex; gap: 16px; padding: 12px 0; border-bottom: 1px solid var(--border); }
    .exp-item:last-child { border-bottom: none; }
    .exp-icon { flex-shrink: 0; color: var(--text-secondary); }
    .exp-content { flex: 1; }
    .exp-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .exp-title { font-size: 15px; font-weight: 600; }
    .exp-company { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
    .exp-dates { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .exp-desc { font-size: 13px; color: var(--text-secondary); margin-top: 6px; line-height: 1.5; }
    .exp-actions { display: flex; gap: 4px; }
    .exp-edit-btn, .exp-delete-btn { padding: 4px; border-radius: var(--radius-sm); color: var(--text-muted); display: flex; }
    .exp-edit-btn:hover { color: var(--red-600); background: var(--red-50); }
    .exp-delete-btn:hover { color: #ef4444; background: #fef2f2; }
    .skills-list { display: flex; flex-direction: column; gap: 8px; }
    .skill-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); }
    .skill-item:hover { border-color: var(--border-hover); }
    .skill-info { display: flex; flex-direction: column; }
    .skill-name { font-weight: 600; font-size: 14px; }
    .skill-endorsements { font-size: 12px; color: var(--text-muted); }
    .skill-actions { display: flex; align-items: center; gap: 8px; }
    .endorse-btn { display: flex; align-items: center; gap: 4px; padding: 4px 12px; border: 1px solid var(--border); border-radius: var(--radius-full); font-size: 12px; font-weight: 600; color: var(--text-secondary); }
    .endorse-btn:hover { border-color: var(--red-400); color: var(--red-600); }
    .endorse-btn.endorsed { background: var(--red-50); border-color: var(--red-400); color: var(--red-700); }
    .skill-remove { padding: 4px; border-radius: 50%; color: var(--text-muted); display: flex; }
    .skill-remove:hover { color: #ef4444; background: #fef2f2; }
    .linkedin-info-card { border: 2px solid var(--red-200); }
    .linkedin-info { display: flex; flex-direction: column; gap: 8px; }
    .linkedin-row { display: flex; gap: 8px; font-size: 13px; }
    .linkedin-label { font-weight: 600; min-width: 140px; color: var(--text-secondary); }
    .linkedin-value { color: var(--text-primary); }

    .analytics-card { border: 1px solid var(--border); }
    .analytics-period { font-size: 12px; color: var(--text-muted); }
    .analytics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
    .analytics-item { text-align: center; padding: 12px; background: var(--surface-hover); border-radius: var(--radius-sm); }
    .analytics-num { display: block; font-size: 24px; font-weight: 800; color: var(--red-700); }
    .analytics-label { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
    .analytics-chart { display: flex; align-items: flex-end; justify-content: space-between; gap: 8px; height: 100px; padding-top: 12px; border-top: 1px solid var(--border); }
    .chart-bar-group { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; }
    .chart-bar { width: 100%; max-width: 30px; background: linear-gradient(to top, var(--red-600), var(--red-400)); border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.3s; }
    .chart-label { font-size: 11px; color: var(--text-muted); }

    .activity-list { display: flex; flex-direction: column; gap: 4px; }
    .activity-item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
    .activity-item:last-child { border-bottom: none; }
    .activity-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--red-600); background: var(--red-50); }
    .act-like { color: #ef4444; background: #fef2f2; }
    .act-comment { color: #3b82f6; background: #eff6ff; }
    .act-connection { color: #22c55e; background: #f0fdf4; }
    .act-job { color: #f59e0b; background: #fffbeb; }
    .activity-content { flex: 1; }
    .activity-text { font-size: 14px; color: var(--text-primary); }
    .activity-time { font-size: 12px; color: var(--text-muted); }

    .modal-label { display: block; font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-top: 12px; margin-bottom: 4px; }
    .modal-input { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; outline: none; }
    .modal-input:focus { border-color: var(--red-400); }
    .modal-textarea { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; resize: vertical; outline: none; }
    .modal-textarea:focus { border-color: var(--red-400); }
    .modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px; border-top: 1px solid var(--border); }

    .cover-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
    .cover-option { cursor: pointer; border-radius: var(--radius-sm); overflow: hidden; border: 2px solid transparent; }
    .cover-option.selected { border-color: var(--red-600); }
    .cover-option img { width: 100%; height: 80px; object-fit: cover; }
    .avatar-preview { display: flex; justify-content: center; margin-bottom: 16px; }
    .avatar-options { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 8px; }
    .avatar-option { cursor: pointer; border-radius: 50%; overflow: hidden; border: 2px solid transparent; }
    .avatar-option.selected { border-color: var(--red-600); }
    .avatar-option img { width: 100%; aspect-ratio: 1; object-fit: cover; }
  `]
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private data = inject(DataService);
  private api = inject(RealApiService);

  editSection = '';
  aboutDraft = '';
  headlineDraft = '';
  editingHeadline = signal(false);

  showCoverModal = signal(false);
  showAvatarModal = signal(false);
  showAddExperience = signal(false);
  showAddEducation = signal(false);
  showAddSkill = signal(false);
  showEditModal = signal(false);

  coverDraft = '';
  avatarDraft = '';
  newSkillName = '';
  editingExpId = signal('');
  editingEduId = signal('');

  coverOptions: string[] = [];
  avatarOptions: string[] = [];

  expDraft: { title: string; company: string; startDate: string; endDate: string; description: string } = {
    title: '', company: '', startDate: '', endDate: '', description: ''
  };
  eduDraft: { school: string; degree: string; field: string; startYear: number; endYear: number } = {
    school: '', degree: '', field: '', startYear: 0, endYear: 0
  };
  editDraft: { headline: string; about: string; location: string } = {
    headline: '', about: '', location: ''
  };

  user = computed(() => this.auth.user());
  profile = computed(() => this.data.profile());
  activities = computed(() => this.data.activities());
  analytics = computed(() => this.data.analytics());

  initials = computed(() => {
    const u = this.auth.user();
    if (!u) return '?';
    return (u.given_name?.[0] || '') + (u.family_name?.[0] || '');
  });

  coverStyle = computed(() => {
    const p = this.profile();
    return p?.coverPhoto ? `url(${p.coverPhoto})` : 'linear-gradient(135deg, var(--red-500), var(--red-800))';
  });

  constructor() {
    this.coverOptions = [
      this.api.getStockPhoto('cover-1', 1200, 300),
      this.api.getStockPhoto('cover-2', 1200, 300),
      this.api.getStockPhoto('cover-3', 1200, 300),
      this.api.getStockPhoto('cover-4', 1200, 300),
      this.api.getStockPhoto('cover-5', 1200, 300),
      this.api.getStockPhoto('cover-6', 1200, 300),
    ];
    this.avatarOptions = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Bandit',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    ];
  }

  editCover(): void {
    const p = this.profile();
    this.coverDraft = p?.coverPhoto || '';
    this.showCoverModal.set(true);
  }

  saveCover(): void {
    if (this.coverDraft) {
      this.data.updateCoverPhoto(this.coverDraft);
    }
    this.showCoverModal.set(false);
  }

  editAvatar(): void {
    const p = this.profile();
    this.avatarDraft = p?.picture || '';
    this.showAvatarModal.set(true);
  }

  saveAvatar(): void {
    if (this.avatarDraft) {
      this.data.updateProfilePicture(this.avatarDraft);
    }
    this.showAvatarModal.set(false);
  }

  startEditHeadline(): void {
    const p = this.profile();
    this.headlineDraft = p?.headline || '';
    this.editingHeadline.set(true);
  }

  saveHeadline(): void {
    this.data.updateProfile({ headline: this.headlineDraft });
    this.editingHeadline.set(false);
  }

  startEditAbout(): void {
    const p = this.profile();
    this.aboutDraft = p?.about || '';
    this.editSection = 'about';
  }

  saveAbout(): void {
    this.data.updateProfile({ about: this.aboutDraft });
    this.editSection = '';
  }

  saveProfile(): void {
    this.data.updateProfile({
      headline: this.editDraft.headline,
      about: this.editDraft.about,
      location: this.editDraft.location,
    });
    this.showEditModal.set(false);
  }

  startEditProfile(): void {
    const p = this.profile();
    this.editDraft = {
      headline: p?.headline || '',
      about: p?.about || '',
      location: p?.location || '',
    };
    this.showEditModal.set(true);
  }

  startEditExperience(exp: Experience): void {
    this.editingExpId.set(exp.id);
    this.expDraft = { ...exp, endDate: exp.endDate || '' };
    this.showAddExperience.set(true);
  }

  saveExperience(): void {
    const draft = this.expDraft;
    if (!draft.title || !draft.company) return;
    const data = {
      title: draft.title,
      company: draft.company,
      startDate: draft.startDate,
      endDate: draft.endDate || null,
      description: draft.description,
    };
    if (this.editingExpId()) {
      this.data.updateExperience(this.editingExpId(), data);
    } else {
      this.data.addExperience(data);
    }
    this.showAddExperience.set(false);
    this.editingExpId.set('');
    this.expDraft = { title: '', company: '', startDate: '', endDate: '', description: '' };
  }

  deleteExperience(id: string): void {
    this.data.deleteExperience(id);
  }

  startEditEducation(edu: Education): void {
    this.editingEduId.set(edu.id);
    this.eduDraft = { ...edu, endYear: edu.endYear || 0 };
    this.showAddEducation.set(true);
  }

  saveEducation(): void {
    const draft = this.eduDraft;
    if (!draft.school) return;
    const data = {
      school: draft.school,
      degree: draft.degree,
      field: draft.field,
      startYear: Number(draft.startYear),
      endYear: draft.endYear ? Number(draft.endYear) : null,
    };
    if (this.editingEduId()) {
      this.data.updateEducation(this.editingEduId(), data);
    } else {
      this.data.addEducation(data);
    }
    this.showAddEducation.set(false);
    this.editingEduId.set('');
    this.eduDraft = { school: '', degree: '', field: '', startYear: 0, endYear: 0 };
  }

  deleteEducation(id: string): void {
    this.data.deleteEducation(id);
  }

  addSkill(): void {
    if (this.newSkillName.trim()) {
      this.data.addSkill(this.newSkillName.trim());
      this.newSkillName = '';
      this.showAddSkill.set(false);
    }
  }

  removeSkill(name: string): void {
    this.data.removeSkill(name);
  }

  endorseSkill(name: string): void {
    this.data.toggleEndorsement(name);
  }

  formatDate(dateStr: string): string {
    const [year, month] = dateStr.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${months[parseInt(month) - 1]} ${year}`;
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
}

