import { Component, inject, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Job } from '../../models';

@Component({
  selector: 'app-jobs',
  imports: [FormsModule],
  template: `
    <div class="jobs-page">
      <div class="jobs-container">
        <!-- Left: Job List -->
        <div class="jobs-left">
          <div class="card jobs-header-card">
            <h2 class="jobs-header-title">Empleos para ti</h2>
            <p class="jobs-header-sub">{{ filteredJobs().length }} resultados</p>
          </div>

          <div class="search-bar card">
            <div class="search-row">
              <div class="search-field">
                <span class="search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
              </span>
                <input type="text" placeholder="Buscar títulos de empleo" [(ngModel)]="searchQuery" (ngModelChange)="onSearch()" class="search-input-field" />
              </div>
              <div class="search-field">
                <span class="search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </span>
                <input type="text" placeholder="Ubicación" [(ngModel)]="locationQuery" (ngModelChange)="onSearch()" class="search-input-field" />
              </div>
              <button class="btn btn-primary">Buscar</button>
            </div>
          </div>

          <div class="filter-bar">
            <button class="filter-chip" [class.active]="filter() === 'all'" (click)="setFilter('all')">Todos</button>
            <button class="filter-chip" [class.active]="filter() === 'remote'" (click)="setFilter('remote')">Remoto</button>
            <button class="filter-chip" [class.active]="filter() === 'easy'" (click)="setFilter('easy')">Postulación fácil</button>
            <button class="filter-chip" [class.active]="filter() === 'applied'" (click)="setFilter('applied')">Aplicados</button>
            <button class="filter-chip" [class.active]="filter() === 'saved'" (click)="setFilter('saved')">Guardados</button>
          </div>

          @for (job of filteredJobs(); track job.id) {
            <div class="card job-list-item" [class.selected]="selectedJob()?.id === job.id" (click)="selectJob(job)">
              <div class="job-list-top">
                @if (job.companyLogo) {
                  <img [src]="job.companyLogo" class="avatar job-company-logo" style="width:48px;height:48px" [alt]="job.company" />
                } @else {
                  <div class="avatar-placeholder job-company-logo" style="width:48px;height:48px;font-size:18px;background:var(--red-600)">
                    {{ getInitials(job.company) }}
                  </div>
                }
                <div class="job-list-info">
                  <h3 class="job-list-title">{{ job.title }}</h3>
                  <p class="job-list-company">{{ job.company }}</p>
                  <p class="job-list-location">{{ job.location }} • {{ job.workType }}</p>
                </div>
                @if (job.applied) {
                  <span class="applied-badge">Aplicado</span>
                }
              </div>
              <div class="job-list-meta">
                <span>{{ timeAgo(job.postedDate) }}</span>
                <span>•</span>
                <span>{{ job.applicants }} candidatos</span>
                @if (job.easyApply) {
                  <span>•</span>
                  <span class="easy-apply-tag">Postulación fácil</span>
                }
              </div>
            </div>
          }

          @if (filteredJobs().length === 0) {
            <div class="card empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
              </svg>
              <p>No hay empleos que coincidan con tu búsqueda. Prueba con otras palabras clave.</p>
            </div>
          }
        </div>

        <!-- Right: Job Detail -->
        <div class="jobs-right">
          @if (selectedJob(); as job) {
            <div class="card job-detail-card">
              <div class="job-detail-top">
                <div class="job-detail-header">
                  <h1 class="job-detail-title">{{ job.title }}</h1>
                  <p class="job-detail-company">{{ job.company }}</p>
                  <p class="job-detail-location">{{ job.location }} • {{ job.workType }} • {{ job.employmentType }}</p>
                  <p class="job-detail-salary">{{ job.salary }}</p>
                </div>
                @if (job.companyLogo) {
                  <img [src]="job.companyLogo" class="avatar job-detail-logo" style="width:56px;height:56px" [alt]="job.company" />
                } @else {
                  <div class="avatar-placeholder job-detail-logo" style="width:56px;height:56px;font-size:20px;background:var(--red-600)">
                    {{ getInitials(job.company) }}
                  </div>
                }
              </div>

              <div class="job-detail-actions">
                @if (job.easyApply) {
                  <button class="btn btn-primary btn-lg" (click)="apply(job)">
                    @if (job.applied) { Aplicado ✓ } @else { Postulación fácil }
                  </button>
                } @else {
                  <button class="btn btn-primary btn-lg" (click)="apply(job)">
                    @if (job.applied) { Aplicado ✓ } @else { Aplicar }
                  </button>
                }
                <button class="btn btn-outline btn-lg" [class.saved]="job.saved" (click)="toggleSave(job)">{{ job.saved ? 'Guardado' : 'Guardar' }}</button>
              </div>

              <div class="divider"></div>

              <div class="job-detail-section">
                <h3>Sobre el empleo</h3>
                <p class="job-detail-desc">{{ job.description }}</p>
              </div>

              <div class="job-detail-section">
                <h3>Requisitos</h3>
                <ul class="req-list">
                  @for (req of job.requirements; track req) {
                    <li>{{ req }}</li>
                  }
                </ul>
              </div>

              <div class="job-detail-section">
                <h3>Detalles del empleo</h3>
                <div class="job-meta-grid">
                  <div class="job-meta-item">
                    <span class="meta-label">Salario</span>
                    <span class="meta-value">{{ job.salary }}</span>
                  </div>
                  <div class="job-meta-item">
                    <span class="meta-label">Tipo de empleo</span>
                    <span class="meta-value">{{ job.employmentType }}</span>
                  </div>
                  <div class="job-meta-item">
                    <span class="meta-label">Modalidad</span>
                    <span class="meta-value">{{ job.workType }}</span>
                  </div>
                  <div class="job-meta-item">
                    <span class="meta-label">Candidatos</span>
                    <span class="meta-value">{{ job.applicants }}</span>
                  </div>
                </div>
              </div>

              <div class="divider"></div>

              <div class="job-detail-section">
                <h3>Sobre {{ job.company }}</h3>
                <p class="job-detail-desc">{{ job.company }} es una empresa tecnológica líder comprometida con la construcción de soluciones innovadoras. Valoramos la diversidad, la inclusión y el impacto social en todo lo que hacemos.</p>
              </div>
            </div>
          } @else {
            <div class="card empty-state job-detail-empty">
              <div class="icon">📋</div>
              <p>Selecciona un empleo para ver los detalles</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .jobs-page { padding: 24px 0; }
    .jobs-container { max-width: 1100px; margin: 0 auto; padding: 0 16px; display: grid; grid-template-columns: 420px 1fr; gap: 16px; }
    .jobs-header-card { padding: 20px 24px; }
    .jobs-header-title { font-size: 20px; font-weight: 700; }
    .jobs-header-sub { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
    .search-bar { padding: 16px; margin-bottom: 12px; }
    .search-row { display: flex; gap: 8px; }
    .search-field { flex: 1; display: flex; align-items: center; gap: 6px; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 12px; }
    .search-icon { font-size: 14px; }
    .search-input-field { border: none; outline: none; font-size: 13px; width: 100%; background: transparent; }
    .filter-bar { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
    .filter-chip { padding: 6px 16px; border: 1px solid var(--border); border-radius: var(--radius-full); font-size: 13px; font-weight: 500; color: var(--text-secondary); }
    .filter-chip:hover { border-color: var(--red-400); }
    .filter-chip.active { background: var(--red-600); color: #fff; border-color: var(--red-600); }
    .job-list-item { padding: 16px; margin-bottom: 8px; cursor: pointer; transition: all 0.15s; }
    .job-list-item:hover { box-shadow: var(--shadow-md); }
    .job-list-item.selected { border-left: 3px solid var(--red-600); }
    .job-list-top { display: flex; align-items: flex-start; gap: 12px; }
    .job-list-info { flex: 1; }
    .job-list-title { font-size: 15px; font-weight: 600; }
    .job-list-company { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
    .job-list-location { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .applied-badge { background: var(--red-100); color: var(--red-800); padding: 2px 10px; border-radius: var(--radius-full); font-size: 11px; font-weight: 600; }
    .job-list-meta { display: flex; gap: 6px; font-size: 11px; color: var(--text-muted); margin-top: 10px; padding-left: 60px; }
    .easy-apply-tag { color: var(--red-700); font-weight: 600; }
    .job-detail-card { padding: 24px; position: sticky; top: 70px; }
    .job-detail-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .job-detail-title { font-size: 22px; font-weight: 700; }
    .job-detail-company { font-size: 15px; color: var(--text-primary); margin-top: 4px; }
    .job-detail-location { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
    .job-detail-salary { font-size: 14px; color: var(--red-700); font-weight: 600; margin-top: 8px; }
    .job-detail-actions { display: flex; gap: 8px; margin-top: 20px; }
    .btn-outline.saved { background: var(--red-50); border-color: var(--red-400); color: var(--red-700); }
    .job-detail-section { margin-top: 24px; }
    .job-detail-section h3 { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
    .job-detail-desc { font-size: 14px; line-height: 1.6; color: var(--text-primary); }
    .req-list { padding-left: 20px; font-size: 14px; line-height: 2; color: var(--text-primary); }
    .job-meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .job-meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { font-size: 12px; color: var(--text-muted); }
    .meta-value { font-size: 14px; font-weight: 500; }
    .job-detail-empty { min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    @media (max-width: 900px) { .jobs-container { grid-template-columns: 1fr; } .job-detail-card { position: static; } }
  `]
})
export class JobsComponent {
  private data = inject(DataService);

  selectedJob = signal<Job | null>(null);
  searchQuery = '';
  locationQuery = '';
  filter = signal<'all' | 'remote' | 'easy' | 'applied' | 'saved'>('all');

  constructor() {
    const jobs = this.data.jobs();
    if (jobs.length > 0) {
      this.selectedJob.set(jobs[0]);
    }
  }

  filteredJobs = computed(() => {
    let jobs = this.data.jobs();
    const q = this.searchQuery.toLowerCase();
    const loc = this.locationQuery.toLowerCase();

    if (q) {
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      );
    }
    if (loc) {
      jobs = jobs.filter(j => j.location.toLowerCase().includes(loc));
    }

    const f = this.filter();
    if (f === 'remote') jobs = jobs.filter(j => j.workType === 'Remoto' || j.workType === 'Remote');
    if (f === 'easy') jobs = jobs.filter(j => j.easyApply);
    if (f === 'applied') jobs = jobs.filter(j => j.applied);
    if (f === 'saved') jobs = jobs.filter(j => j.saved);

    return jobs;
  });

  setFilter(f: 'all' | 'remote' | 'easy' | 'applied' | 'saved'): void {
    this.filter.set(f);
  }

  selectJob(job: Job): void {
    this.selectedJob.set(job);
  }

  apply(job: Job): void {
    this.data.toggleJobApplied(job.id);
  }

  toggleSave(job: Job): void {
    this.data.toggleSaveJob(job.id);
  }

  onSearch(): void {
    // Computed signal auto-updates
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  timeAgo(timestamp: number): string {
    const days = Math.floor((Date.now() - timestamp) / 86400000);
    if (days < 1) return 'hoy';
    if (days === 1) return 'hace 1 día';
    return `hace ${days} días`;
  }
}
