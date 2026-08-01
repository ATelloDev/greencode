import { Injectable, signal, inject } from '@angular/core';
import {
  Post, Comment, Connection, Job, Conversation, AppNotification,
  UserProfile, ChatMessage, Experience, Education, Skill, Activity, ProfileAnalytics
} from '../models';
import { RealApiService, RandomUser } from './real-api.service';

@Injectable({ providedIn: 'root' })
export class DataService {
  private api = inject(RealApiService);

  readonly posts = signal<Post[]>([]);
  readonly connections = signal<Connection[]>([]);
  readonly jobs = signal<Job[]>([]);
  readonly conversations = signal<Conversation[]>([]);
  readonly notifications = signal<AppNotification[]>([]);
  readonly currentUserId = signal<string>('demo-user-001');
  readonly dataReady = signal<boolean>(false);
  readonly profile = signal<UserProfile | null>(null);
  readonly activities = signal<Activity[]>([]);
  readonly analytics = signal<ProfileAnalytics | null>(null);
  readonly darkMode = signal<boolean>(false);

  private readonly POSTS_KEY = 'redlink_posts_v3';
  private readonly CONN_KEY = 'redlink_connections_v3';
  private readonly JOBS_KEY = 'redlink_jobs_v3';
  private readonly CONV_KEY = 'redlink_conversations_v3';
  private readonly NOTIF_KEY = 'redlink_notifications_v3';
  private readonly PROFILE_KEY = 'redlink_profile_v3';
  private readonly ACTIVITY_KEY = 'redlink_activity_v3';
  private readonly ANALYTICS_KEY = 'redlink_analytics_v3';
  private readonly THEME_KEY = 'redlink_dark_mode';

  private realUsers: RandomUser[] = [];

  constructor() {
    this.initData();
  }

  private async initData(): Promise<void> {
    const storedPosts = this.load(this.POSTS_KEY);
    const storedConns = this.load(this.CONN_KEY);
    const storedJobs = this.load(this.JOBS_KEY);
    const storedConvs = this.load(this.CONV_KEY);
    const storedNotifs = this.load(this.NOTIF_KEY);

    if (storedPosts && storedConns) {
      this.posts.set(storedPosts);
      this.connections.set(storedConns);
      this.jobs.set(storedJobs || this.seedJobs());
      this.conversations.set(storedConvs || []);
      this.notifications.set(storedNotifs || []);
      this.dataReady.set(true);
      this.realUsers = await this.api.fetchUsers(24);
      return;
    }

    this.realUsers = await this.api.fetchUsers(24);

    const posts = this.seedPosts();
    const connections = this.seedConnections();
    const jobs = this.seedJobs();
    const conversations = this.seedConversations();
    const notifications = this.seedNotifications();

    this.posts.set(posts);
    this.connections.set(connections);
    this.jobs.set(jobs);
    this.conversations.set(conversations);
    this.notifications.set(notifications);

    this.save(this.POSTS_KEY, posts);
    this.save(this.CONN_KEY, connections);
    this.save(this.JOBS_KEY, jobs);
    this.save(this.CONV_KEY, conversations);
    this.save(this.NOTIF_KEY, notifications);

    this.dataReady.set(true);
  }

  private load(key: string): any[] | null {
    const stored = localStorage.getItem(key);
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  }

  private save(key: string, data: any[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private loadObj(key: string): any | null {
    const stored = localStorage.getItem(key);
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  }

  private saveObj(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private getUser(index: number): RandomUser {
    return this.realUsers[index] || this.fallbackUser(index);
  }

  private getPhoto(index: number, size: 'medium' | 'large' = 'medium'): string {
    return this.getUser(index).picture[size];
  }

  private getName(index: number): string {
    const u = this.getUser(index);
    return `${u.name.first} ${u.name.last}`;
  }

  private getLocation(index: number): string {
    const u = this.getUser(index);
    return `${u.location.city}, ${u.location.country}`;
  }

  private fallbackUser(index: number): RandomUser {
    const names = [
      ['Sofia', 'Ramirez'], ['James', 'Chen'], ['Maria', 'Gonzalez'],
      ['David', 'Kim'], ['Priya', 'Patel'], ['Oliver', 'Schmidt'],
      ['Aisha', 'Mohammed'], ['Carlos', 'Mendoza'], ['Yuki', 'Tanaka'],
      ['Emma', 'Wilson'], ['Lucas', 'Silva'], ['Nora', 'Berg'],
      ['Liam', 'O\'Brien'], ['Zara', 'Khan'], ['Ethan', 'Carter'],
      ['Chiara', 'Rossi'], ['Mateo', 'Lopez'], ['Hana', 'Park'],
      ['Felix', 'Muller'], ['Anika', 'Sharma'], ['Theo', 'Andersen'],
      ['Layla', 'Hassan'], ['Noah', 'Reyes'], ['Isla', 'Murphy'],
    ];
    const [first, last] = names[index % names.length];
    const gender = index % 2 === 0 ? 'women' : 'men';
    const photoId = (index * 7 + 3) % 100;
    return {
      name: { first, last },
      picture: {
        large: `https://randomuser.me/api/portraits/${gender}/${photoId}.jpg`,
        medium: `https://randomuser.me/api/portraits/med/${gender}/${photoId}.jpg`,
        thumbnail: `https://randomuser.me/api/portraits/thumb/${gender}/${photoId}.jpg`,
      },
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      location: { city: 'San Francisco', state: 'CA', country: 'USA' },
      login: { uuid: `fallback-${index}`, username: `${first.toLowerCase()}${last.toLowerCase()}` },
    };
  }

  // ===== Posts =====
  addPost(content: string, image: string | null, author: UserProfile): void {
    const post: Post = {
      id: this.genId('post'),
      authorId: author.id,
      authorName: author.name,
      authorPicture: author.picture,
      authorHeadline: author.headline,
      content,
      image,
      timestamp: Date.now(),
      likes: [],
      comments: [],
      shares: 0,
      saved: false,
    };
    const updated = [post, ...this.posts()];
    this.posts.set(updated);
    this.save(this.POSTS_KEY, updated);
  }

  toggleLike(postId: string, userId: string): void {
    const updated = this.posts().map(p => {
      if (p.id === postId) {
        const likes = p.likes.includes(userId)
          ? p.likes.filter(id => id !== userId)
          : [...p.likes, userId];
        return { ...p, likes };
      }
      return p;
    });
    this.posts.set(updated);
    this.save(this.POSTS_KEY, updated);
  }

  addComment(postId: string, content: string, user: UserProfile): void {
    const comment: Comment = {
      id: this.genId('comment'),
      authorId: user.id,
      authorName: user.name,
      authorPicture: user.picture,
      authorHeadline: user.headline,
      content,
      timestamp: Date.now(),
    };
    const updated = this.posts().map(p =>
      p.id === postId ? { ...p, comments: [...p.comments, comment] } : p
    );
    this.posts.set(updated);
    this.save(this.POSTS_KEY, updated);
  }

  sharePost(postId: string): void {
    const updated = this.posts().map(p =>
      p.id === postId ? { ...p, shares: p.shares + 1 } : p
    );
    this.posts.set(updated);
    this.save(this.POSTS_KEY, updated);
  }

  deletePost(postId: string): void {
    const updated = this.posts().filter(p => p.id !== postId);
    this.posts.set(updated);
    this.save(this.POSTS_KEY, updated);
  }

  // ===== Connections =====
  sendConnectRequest(connId: string): void {
    const updated = this.connections().map(c =>
      c.id === connId ? { ...c, pendingSent: true } : c
    );
    this.connections.set(updated);
    this.save(this.CONN_KEY, updated);
  }

  acceptConnectRequest(connId: string): void {
    const updated = this.connections().map(c =>
      c.id === connId ? { ...c, connected: true, pendingReceived: false } : c
    );
    this.connections.set(updated);
    this.save(this.CONN_KEY, updated);
  }

  removeConnection(connId: string): void {
    const updated = this.connections().map(c =>
      c.id === connId ? { ...c, connected: false, pendingSent: false, pendingReceived: false } : c
    );
    this.connections.set(updated);
    this.save(this.CONN_KEY, updated);
  }

  // ===== Jobs =====
  toggleJobApplied(jobId: string): void {
    const updated = this.jobs().map(j =>
      j.id === jobId
        ? { ...j, applied: !j.applied, applicants: j.applied ? j.applicants - 1 : j.applicants + 1 }
        : j
    );
    this.jobs.set(updated);
    this.save(this.JOBS_KEY, updated);
  }

  // ===== Conversations =====
  sendMessage(convId: string, content: string, senderId: string): void {
    const msg: ChatMessage = {
      id: this.genId('msg'),
      senderId,
      content,
      timestamp: Date.now(),
    };
    const updated = this.conversations().map(c =>
      c.id === convId ? { ...c, messages: [...c.messages, msg] } : c
    );
    this.conversations.set(updated);
    this.save(this.CONV_KEY, updated);

    // Simulate a reply after 2 seconds
    setTimeout(() => {
      const reply: ChatMessage = {
        id: this.genId('msg'),
        senderId: 'bot',
        content: this.getAutoReply(),
        timestamp: Date.now(),
      };
      const updated2 = this.conversations().map(c =>
        c.id === convId ? { ...c, messages: [...c.messages, reply] } : c
      );
      this.conversations.set(updated2);
      this.save(this.CONV_KEY, updated2);
    }, 2000);
  }

  markConversationRead(convId: string): void {
    const updated = this.conversations().map(c =>
      c.id === convId ? { ...c, unread: 0 } : c
    );
    this.conversations.set(updated);
    this.save(this.CONV_KEY, updated);
  }

  // ===== Notifications =====
  markAllNotificationsRead(): void {
    const updated = this.notifications().map(n => ({ ...n, read: true }));
    this.notifications.set(updated);
    this.save(this.NOTIF_KEY, updated);
  }

  markNotificationRead(id: string): void {
    const updated = this.notifications().map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notifications.set(updated);
    this.save(this.NOTIF_KEY, updated);
  }

  getUnreadNotificationsCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }

  getUnreadMessagesCount(): number {
    return this.conversations().reduce((sum, c) => sum + c.unread, 0);
  }

  getPendingInvitationsCount(): number {
    return this.connections().filter(c => c.pendingReceived).length;
  }

  // ===== Save/Bookmark Posts =====
  toggleSavePost(postId: string): void {
    const updated = this.posts().map(p =>
      p.id === postId ? { ...p, saved: !p.saved } : p
    );
    this.posts.set(updated);
    this.save(this.POSTS_KEY, updated);
  }

  getSavedPosts(): Post[] {
    return this.posts().filter(p => p.saved);
  }

  // ===== Save Jobs =====
  toggleSaveJob(jobId: string): void {
    const updated = this.jobs().map(j =>
      j.id === jobId ? { ...j, saved: !j.saved } : j
    );
    this.jobs.set(updated);
    this.save(this.JOBS_KEY, updated);
  }

  getSavedJobs(): Job[] {
    return this.jobs().filter(j => j.saved);
  }

  // ===== Profile Management =====
  initProfile(user: { sub: string; name: string; given_name: string; family_name: string; picture: string; email: string }): void {
    const stored = this.loadObj(this.PROFILE_KEY);
    if (stored) {
      this.profile.set(stored);
      return;
    }
    const p: UserProfile = {
      id: user.sub,
      name: user.name,
      givenName: user.given_name,
      familyName: user.family_name,
      picture: user.picture,
      coverPhoto: this.api.getStockPhoto('cover-' + user.sub, 1200, 300),
      email: user.email,
      headline: 'Ingeniero de Software | Entusiasta de Angular | Construyendo para Impacto Social',
      about: 'Desarrollador apasionado enfocado en construir aplicaciones web que marcan la diferencia. Actualmente explorando signals de Angular y arquitectura web moderna. Creo que la tecnología debe servir a la sociedad, no al revés.',
      location: 'Área de la Bahía de San Francisco',
      industry: 'Tecnología',
      experience: [
        { id: 'e1', title: 'Ingeniero Frontend Senior', company: 'TechFlow Inc.', startDate: '2022-01', endDate: null, description: 'Liderando el desarrollo con Angular para productos SaaS empresariales. Migré el código legacy a Angular 19 con componentes standalone y signals.' },
        { id: 'e2', title: 'Desarrollador Frontend', company: 'StartupHub', startDate: '2020-03', endDate: '2021-12', description: 'Construí y mantuve aplicaciones Angular para clientes startup en diversas industrias.' },
        { id: 'e3', title: 'Desarrollador Junior', company: 'WebAgency', startDate: '2019-06', endDate: '2020-02', description: 'Desarrollé sitios web responsivos y aplicaciones web usando Angular y TypeScript.' },
      ],
      education: [
        { id: 'ed1', school: 'Universidad de California, Berkeley', degree: 'Licenciatura', field: 'Informática', startYear: 2015, endYear: 2019 },
      ],
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
    this.profile.set(p);
    this.saveObj(this.PROFILE_KEY, p);
    this.initAnalytics();
    this.initActivities();
  }

  updateProfile(updates: Partial<UserProfile>): void {
    const current = this.profile();
    if (!current) return;
    const updated = { ...current, ...updates };
    this.profile.set(updated);
    this.saveObj(this.PROFILE_KEY, updated);
    this.addActivity('profile_edit', 'Actualizó la información del perfil');
  }

  updateCoverPhoto(url: string): void {
    this.updateProfile({ coverPhoto: url });
  }

  updateProfilePicture(url: string): void {
    this.updateProfile({ picture: url });
  }

  // ===== Experience CRUD =====
  addExperience(exp: Omit<Experience, 'id'>): void {
    const current = this.profile();
    if (!current) return;
    const newExp: Experience = { ...exp, id: this.genId('exp') };
    const updated = { ...current, experience: [...current.experience, newExp] };
    this.profile.set(updated);
    this.saveObj(this.PROFILE_KEY, updated);
    this.addActivity('profile_edit', `Añadió experiencia: ${exp.title} en ${exp.company}`);
  }

  updateExperience(id: string, updates: Partial<Experience>): void {
    const current = this.profile();
    if (!current) return;
    const updated = {
      ...current,
      experience: current.experience.map(e => e.id === id ? { ...e, ...updates } : e),
    };
    this.profile.set(updated);
    this.saveObj(this.PROFILE_KEY, updated);
  }

  deleteExperience(id: string): void {
    const current = this.profile();
    if (!current) return;
    const updated = { ...current, experience: current.experience.filter(e => e.id !== id) };
    this.profile.set(updated);
    this.saveObj(this.PROFILE_KEY, updated);
  }

  // ===== Education CRUD =====
  addEducation(edu: Omit<Education, 'id'>): void {
    const current = this.profile();
    if (!current) return;
    const newEdu: Education = { ...edu, id: this.genId('edu') };
    const updated = { ...current, education: [...current.education, newEdu] };
    this.profile.set(updated);
    this.saveObj(this.PROFILE_KEY, updated);
    this.addActivity('profile_edit', `Añadió educación: ${edu.school}`);
  }

  updateEducation(id: string, updates: Partial<Education>): void {
    const current = this.profile();
    if (!current) return;
    const updated = {
      ...current,
      education: current.education.map(e => e.id === id ? { ...e, ...updates } : e),
    };
    this.profile.set(updated);
    this.saveObj(this.PROFILE_KEY, updated);
  }

  deleteEducation(id: string): void {
    const current = this.profile();
    if (!current) return;
    const updated = { ...current, education: current.education.filter(e => e.id !== id) };
    this.profile.set(updated);
    this.saveObj(this.PROFILE_KEY, updated);
  }

  // ===== Skills CRUD =====
  addSkill(name: string): void {
    const current = this.profile();
    if (!current) return;
    if (current.skills.some(s => s.name.toLowerCase() === name.toLowerCase())) return;
    const updated = { ...current, skills: [...current.skills, { name, endorsements: 0, endorsedByMe: false }] };
    this.profile.set(updated);
    this.saveObj(this.PROFILE_KEY, updated);
  }

  removeSkill(name: string): void {
    const current = this.profile();
    if (!current) return;
    const updated = { ...current, skills: current.skills.filter(s => s.name !== name) };
    this.profile.set(updated);
    this.saveObj(this.PROFILE_KEY, updated);
  }

  toggleEndorsement(skillName: string): void {
    const current = this.profile();
    if (!current) return;
    const updated = {
      ...current,
      skills: current.skills.map(s => {
        if (s.name === skillName) {
          return {
            ...s,
            endorsements: s.endorsedByMe ? s.endorsements - 1 : s.endorsements + 1,
            endorsedByMe: !s.endorsedByMe,
          };
        }
        return s;
      }),
    };
    this.profile.set(updated);
    this.saveObj(this.PROFILE_KEY, updated);
  }

  // ===== Activity =====
  private initActivities(): void {
    const stored = this.load(this.ACTIVITY_KEY);
    if (stored) {
      this.activities.set(stored);
      return;
    }
    const now = Date.now();
    const acts: Activity[] = [
      { id: 'a1', type: 'post', text: 'Compartió una publicación sobre migración a signals de Angular', timestamp: now - 3600000 },
      { id: 'a2', type: 'like', text: 'Le dio me gusta a una publicación sobre TypeScript strict mode', timestamp: now - 7200000 },
      { id: 'a3', type: 'connection', text: 'Se conectó con Sofia Ramirez', timestamp: now - 86400000 },
      { id: 'a4', type: 'job', text: 'Aplicó a Desarrollador Angular Senior en TechFlow Inc.', timestamp: now - 172800000 },
      { id: 'a5', type: 'comment', text: 'Comentó en una publicación sobre mentoría', timestamp: now - 259200000 },
    ];
    this.activities.set(acts);
    this.save(this.ACTIVITY_KEY, acts);
  }

  addActivity(type: Activity['type'], text: string): void {
    const act: Activity = { id: this.genId('act'), type, text, timestamp: Date.now() };
    const updated = [act, ...this.activities()];
    this.activities.set(updated);
    this.save(this.ACTIVITY_KEY, updated);
  }

  // ===== Analytics =====
  private initAnalytics(): void {
    const stored = this.loadObj(this.ANALYTICS_KEY);
    if (stored) {
      this.analytics.set(stored);
      return;
    }
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const analytics: ProfileAnalytics = {
      profileViews: 142,
      postImpressions: 3284,
      searchAppearances: 89,
      viewerCount: 67,
      weeklyViews: days.map(d => ({ day: d, views: Math.floor(Math.random() * 40) + 10 })),
    };
    this.analytics.set(analytics);
    this.saveObj(this.ANALYTICS_KEY, analytics);
  }

  // ===== Dark Mode (Always On) =====
  initDarkMode(): void {
    this.darkMode.set(true);
    this.applyDarkMode(true);
  }

  toggleDarkMode(): void {
    this.darkMode.set(true);
    this.applyDarkMode(true);
  }

  private applyDarkMode(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }

  // ===== Global Search =====
  search(query: string): { people: Connection[]; jobs: Job[]; posts: Post[] } {
    const q = query.toLowerCase();
    return {
      people: this.connections().filter(c => c.name.toLowerCase().includes(q) || c.headline.toLowerCase().includes(q)),
      jobs: this.jobs().filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q)),
      posts: this.posts().filter(p => p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q)),
    };
  }

  // ===== Helpers =====
  private genId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAutoReply(): string {
    const replies = [
      '¡Eso suena genial! Hablemos más.',
      'Gracias por contactarme. Te responderé pronto.',
      '¡Interesante! Me encantaría saber más sobre esto.',
      'Por supuesto, programemos una llamada.',
      'Agradezco tu mensaje. ¡Espero con ansias conectar!',
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }

  // ===== Seed Data with Real API Photos =====
  private seedPosts(): Post[] {
    const now = Date.now();
    return [
      {
        id: 'post_1',
        authorId: 'conn_1',
        authorName: this.getName(0),
        authorPicture: this.getPhoto(0),
        authorHeadline: 'Ingeniero de Software Senior en TechFlow | Experto en Angular',
        content: 'Acabo de completar una migración masiva de Angular 16 a Angular 19 con componentes standalone y signals. Las mejoras de rendimiento son increíbles: nuestro bundle se redujo 40% y la carga inicial es 60% más rápida. La nueva sintaxis de control de flujo hace las plantillas mucho más limpias. #Angular #WebDev #Frontend',
        image: this.api.getStockPhoto('angular-migration', 600, 350),
        timestamp: now - 3600000,
        likes: ['conn_2', 'conn_3', 'conn_5', 'demo-user-001'],
        comments: [
          {
            id: 'c1', authorId: 'conn_2', authorName: this.getName(1), authorPicture: this.getPhoto(1),
            authorHeadline: 'Arquitecto Frontend en CloudSystems',
            content: '¡Esto es inspirador! ¿Enfrentaste algún desafío con la migración a signals?',
            timestamp: now - 3000000,
          },
          {
            id: 'c2', authorId: 'conn_1', authorName: this.getName(0), authorPicture: this.getPhoto(0),
            authorHeadline: 'Ingeniero de Software Senior en TechFlow',
            content: '¡Algunos! El mayor fue convertir todos nuestros stores de NgRx a signals. Pero valió la pena.',
            timestamp: now - 2500000,
          },
        ],
        shares: 12,
        saved: false,
      },
      {
        id: 'post_2',
        authorId: 'conn_3',
        authorName: this.getName(2),
        authorPicture: this.getPhoto(2),
        authorHeadline: 'Gerente de Producto en InnovateLab | Construyendo el futuro del trabajo',
        content: '¡Estamos contratando! Buscamos desarrolladores Angular apasionados para unirse a nuestro equipo construyendo herramientas que ayudan a ONG a gestionar sus operaciones. 100% remoto, salario competitivo y una cultura con propósito. Si quieres que tu código tenga un impacto social real, este es el lugar. ¡Escríbeme por DM para más detalles! #Contratando #EmpleosAngular #ImpactoSocial',
        image: this.api.getStockPhoto('team-meeting', 600, 350),
        timestamp: now - 7200000,
        likes: ['conn_1', 'conn_4', 'demo-user-001', 'conn_6', 'conn_7'],
        comments: [
          {
            id: 'c3', authorId: 'conn_4', authorName: this.getName(3), authorPicture: this.getPhoto(3),
            authorHeadline: 'Desarrollador Full-Stack | Angular y Node.js',
            content: '¡Suena increíble! Acabo de postularme a través de la página de empleos.',
            timestamp: now - 6000000,
          },
        ],
        shares: 34,
        saved: false,
      },
      {
        id: 'post_3',
        authorId: 'conn_5',
        authorName: this.getName(4),
        authorPicture: this.getPhoto(4),
        authorHeadline: 'Tech Lead | Contribuidor Open Source | Mentor',
        content: 'Después de 3 años como mentor de desarrolladores junior, he aprendido que la habilidad más importante no es conocer cada framework, sino saber cómo aprender. El panorama tecnológico cambia constantemente. Lo que permanece es la curiosidad, la persistencia y la disposición a preguntar.\n\nPara cada dev junior que siente el síndrome del impostor: perteneces aquí. Sigue construyendo, sigue aprendiendo, sigue lanzando.',
        image: this.api.getStockPhoto('mentorship-coding', 600, 350),
        timestamp: now - 14400000,
        likes: ['conn_1', 'conn_2', 'conn_3', 'conn_6', 'demo-user-001', 'conn_7', 'conn_8'],
        comments: [],
        shares: 56,
        saved: false,
      },
      {
        id: 'post_4',
        authorId: 'conn_2',
        authorName: this.getName(1),
        authorPicture: this.getPhoto(1),
        authorHeadline: 'Arquitecto Frontend en CloudSystems | Entusiasta de TypeScript',
        content: 'Opinión polémica: TypeScript strict mode debería ser el predeterminado en cada nuevo proyecto. Sí, toma más tiempo al principio. Pero la cantidad de bugs que previene, el código autodocumentado que produce y la experiencia de desarrollador que habilita valen la pena 10x.\n\n¿Cuál es tu opinión? ¿Activas strict mode?',
        image: null,
        timestamp: now - 28800000,
        likes: ['conn_5', 'demo-user-001', 'conn_3'],
        comments: [
          {
            id: 'c4', authorId: 'conn_5', authorName: this.getName(4), authorPicture: this.getPhoto(4),
            authorHeadline: 'Tech Lead | Contribuidor Open Source',
            content: '100% de acuerdo. strict mode detecta muchísimos problemas en tiempo de compilación.',
            timestamp: now - 27000000,
          },
        ],
        shares: 8,
        saved: false,
      },
      {
        id: 'post_5',
        authorId: 'conn_6',
        authorName: this.getName(5),
        authorPicture: this.getPhoto(5),
        authorHeadline: 'CTO en StartupHub | Inversor Ángel',
        content: 'Acabamos de cerrar nuestra Serie A — $12M para construir la plataforma que conecta voluntarios capacitados con ONG que los necesitan. Nuestra app en Angular será la columna vertebral. Si eres desarrollador y quieres construir algo que importe, quiero hablar contigo.\n\nEsto no es solo otro SaaS. Estamos construyendo infraestructura para el sector de impacto social. Cada línea de código ayuda a una ONG a servir a más personas. Eso es lo que me motiva cada mañana.',
        image: this.api.getStockPhoto('startup-funding', 600, 350),
        timestamp: now - 43200000,
        likes: ['conn_1', 'conn_3', 'conn_5', 'conn_7', 'demo-user-001', 'conn_8'],
        comments: [
          {
            id: 'c5', authorId: 'conn_3', authorName: this.getName(2), authorPicture: this.getPhoto(2),
            authorHeadline: 'Gerente de Producto en InnovateLab',
            content: '¡Felicidades! Esto es exactamente el tipo de plataforma que necesitamos.',
            timestamp: now - 40000000,
          },
          {
            id: 'c6', authorId: 'conn_7', authorName: this.getName(6), authorPicture: this.getPhoto(6),
            authorHeadline: 'Consultor de Tecnología para ONG',
            content: '¡Esto es una noticia increíble! El sector de ONG necesita desesperadamente mejores herramientas tecnológicas.',
            timestamp: now - 38000000,
          },
        ],
        shares: 89,
        saved: false,
      },
      {
        id: 'post_6',
        authorId: 'conn_7',
        authorName: this.getName(6),
        authorPicture: this.getPhoto(6),
        authorHeadline: 'Consultor de Tecnología para ONG | Defensor del Impacto Social',
        content: 'Acabo de terminar una consultoría ayudando a un banco de alimentos local a digitalizar su sistema de inventario con Angular. Pasaron de registros en papel a seguimiento en tiempo real en 6 semanas. El personal ahora puede ver exactamente qué tienen, qué necesitan y cuándo pedir. Por eso amo la tecnología: no se trata del framework, se trata del impacto.',
        image: this.api.getStockPhoto('food-bank-tech', 600, 350),
        timestamp: now - 86400000,
        likes: ['conn_1', 'conn_3', 'conn_5', 'demo-user-001', 'conn_8', 'conn_9'],
        comments: [
          {
            id: 'c7', authorId: 'conn_5', authorName: this.getName(4), authorPicture: this.getPhoto(4),
            authorHeadline: 'Tech Lead | Contribuidor Open Source',
            content: 'Este es exactamente el tipo de proyecto que le da sentido a la tecnología. ¡Bien hecho!',
            timestamp: now - 80000000,
          },
        ],
        shares: 45,
        saved: false,
      },
      {
        id: 'post_7',
        authorId: 'conn_8',
        authorName: this.getName(7),
        authorPicture: this.getPhoto(7),
        authorHeadline: 'Ingeniero DevOps | Infraestructura Cloud | Experto en K8s',
        content: 'Consejo: Si estás desplegando apps de Angular, asegúrate de usar los budget warnings correctamente. He visto demasiados equipos enviar bundles de 5MB porque no configuraron presupuestos de estilos de componentes. Configúralos temprano, mantenlos ajustados, y tus usuarios te lo agradecerán.\n\ncomponentStyleBudget: 4kb es un buen punto de partida. ¿Lo excedes? Refactoriza.',
        image: null,
        timestamp: now - 100000000,
        likes: ['conn_1', 'conn_2', 'demo-user-001', 'conn_4'],
        comments: [],
        shares: 23,
        saved: false,
      },
      {
        id: 'post_8',
        authorId: 'conn_9',
        authorName: this.getName(8),
        authorPicture: this.getPhoto(8),
        authorHeadline: 'Diseñador UX | Defensor de Design Systems | Experto en Accesibilidad',
        content: 'La accesibilidad no es opcional. No es un "nice to have". Es un requisito.\n\nAcabo de auditar 10 apps de Angular y 8 tenían violaciones críticas de WCAG. Etiquetas aria faltantes, sin navegación por teclado, fallos de contraste de color. Podemos hacerlo mejor.\n\nAquí está mi checklist para componentes Angular accesibles (hilo):',
        image: this.api.getStockPhoto('accessibility-audit', 600, 350),
        timestamp: now - 120000000,
        likes: ['conn_1', 'conn_3', 'conn_5', 'conn_7', 'demo-user-001', 'conn_10', 'conn_11'],
        comments: [
          {
            id: 'c8', authorId: 'conn_1', authorName: this.getName(0), authorPicture: this.getPhoto(0),
            authorHeadline: 'Ingeniero de Software Senior en TechFlow',
            content: 'Esto es muy importante. Empezamos a hacer auditorías de accesibilidad y encontramos muchos problemas que no conocíamos.',
            timestamp: now - 115000000,
          },
          {
            id: 'c9', authorId: 'conn_10', authorName: this.getName(9), authorPicture: this.getPhoto(9),
            authorHeadline: 'Gerente de Ingeniería en DataCorp',
            content: 'Compartiendo esto con mi equipo. La accesibilidad debe integrarse, no añadirse al final.',
            timestamp: now - 110000000,
          },
        ],
        shares: 67,
        saved: false,
      },
      {
        id: 'post_9',
        authorId: 'conn_10',
        authorName: this.getName(9),
        authorPicture: this.getPhoto(9),
        authorHeadline: 'Gerente de Ingeniería en DataCorp | Construyendo equipos de datos',
        content: '¡Estamos ampliando nuestro equipo! Buscamos 3 desarrolladores Angular para unirse a DataCorp. Construimos herramientas de visualización de datos usadas por empresas Fortune 500. Gran compensación, excelente equilibrio trabajo-vida y una cultura que valora el aprendizaje.\n\nSi estás cansado de construir apps CRUD y quieres trabajar en visualización de datos compleja con Angular + D3.js, esta es tu oportunidad. ¡Enlace en los comentarios!',
        image: this.api.getStockPhoto('data-team-hiring', 600, 350),
        timestamp: now - 144000000,
        likes: ['conn_2', 'conn_4', 'demo-user-001', 'conn_6'],
        comments: [],
        shares: 19,
        saved: false,
      },
      {
        id: 'post_10',
        authorId: 'conn_11',
        authorName: this.getName(10),
        authorPicture: this.getPhoto(10),
        authorHeadline: 'Científico de Datos | Ingeniero ML | Python + TypeScript',
        content: 'Acabo de publicar una librería open-source que conecta Angular y modelos de ML. Ahora puedes ejecutar modelos de TensorFlow.js directamente dentro de componentes Angular con signals reactivas. No más carga imperativa de modelos — todo basado en signals.\n\nLa librería se llama ng-ml y está en npm. ¡Me encantaría recibir feedback de la comunidad!',
        image: this.api.getStockPhoto('ml-angular', 600, 350),
        timestamp: now - 172800000,
        likes: ['conn_1', 'conn_3', 'conn_5', 'conn_7', 'demo-user-001', 'conn_8', 'conn_12'],
        comments: [
          {
            id: 'c10', authorId: 'conn_2', authorName: this.getName(1), authorPicture: this.getPhoto(1),
            authorHeadline: 'Arquitecto Frontend en CloudSystems',
            content: '¡Esto es brillante! ¿Puede manejar inferencia en tiempo real con transmisiones de video?',
            timestamp: now - 170000000,
          },
        ],
        shares: 102,
        saved: false,
      },
      {
        id: 'post_11',
        authorId: 'conn_12',
        authorName: this.getName(11),
        authorPicture: this.getPhoto(11),
        authorHeadline: 'Diseñador de Producto | Investigador UX | DesignOps',
        content: 'Los design systems no son solo sobre componentes. Son sobre comunicación.\n\nEl mejor design system en el que trabajé no era el que tenía más componentes, sino el donde diseñadores y desarrolladores hablaban el mismo idioma. Vocabulario compartido, librerías de Figma compartidas, especificaciones de componentes Angular compartidas.\n\nCuando diseño e ingeniería se alinean, todo avanza más rápido.',
        image: null,
        timestamp: now - 200000000,
        likes: ['conn_3', 'conn_5', 'demo-user-001', 'conn_9', 'conn_10'],
        comments: [],
        shares: 34,
        saved: false,
      },
      {
        id: 'post_12',
        authorId: 'conn_4',
        authorName: this.getName(3),
        authorPicture: this.getPhoto(3),
        authorHeadline: 'Desarrollador Full-Stack | Angular y Node.js | Open Source',
        content: '¡Mi librería de componentes Angular open source acaba de alcanzar 10.000 estrellas en GitHub! Empezó como un proyecto personal hace 2 años y ahora la usan empresas de todo el mundo.\n\nPara cualquiera pensando en open source: solo empieza. Elige un problema que hayas resuelto, empaquétalo y compártelo. La comunidad te sorprenderá.\n\nGracias a todos los que contribuyeron, reportaron issues y compartieron la palabra. Esto es solo el comienzo.',
        image: this.api.getStockPhoto('opensource-stars', 600, 350),
        timestamp: now - 259200000,
        likes: ['conn_1', 'conn_2', 'conn_3', 'conn_5', 'conn_6', 'conn_7', 'demo-user-001', 'conn_8', 'conn_10'],
        comments: [
          {
            id: 'c11', authorId: 'conn_6', authorName: this.getName(5), authorPicture: this.getPhoto(5),
            authorHeadline: 'CTO en StartupHub | Inversor Ángel',
            content: '¡Felicidades! 10k estrellas es un hito enorme. ¡Usamos tu librería en StartupHub!',
            timestamp: now - 256000000,
          },
        ],
        shares: 78,
        saved: false,
      },
      {
        id: 'post_13',
        authorId: 'conn_13',
        authorName: this.getName(12),
        authorPicture: this.getPhoto(12),
        authorHeadline: 'Desarrollador Mobile | React Native y Angular',
        content: 'El cross-platform es el futuro. Acabo de construir la misma app en Angular y React Native compartiendo 80% de la lógica de negocio. ¿La clave? Arquitectura limpia e inyección de dependencias. El sistema de DI de Angular hace trivial intercambiar implementaciones entre web y móvil.',
        image: null,
        timestamp: now - 300000000,
        likes: ['conn_1', 'conn_5', 'demo-user-001'],
        comments: [],
        shares: 14,
        saved: false,
      },
      {
        id: 'post_14',
        authorId: 'conn_14',
        authorName: this.getName(13),
        authorPicture: this.getPhoto(13),
        authorHeadline: 'Ingeniero de Seguridad | Especialista AppSec',
        content: 'Recordatorio: la sanitización integrada de Angular es excelente, pero no es una bala de plata. Si estás usando innerHTML en algún lugar, necesitas entender los riesgos. He visto 3 apps en producción este mes con vulnerabilidades XSS a través de bypassSecurityTrustHtml.\n\nMantente seguro. Sanea tus entradas, valida tus salidas y nunca confíes en los datos del usuario.',
        image: this.api.getStockPhoto('security-angular', 600, 350),
        timestamp: now - 340000000,
        likes: ['conn_2', 'conn_4', 'conn_8', 'demo-user-001'],
        comments: [
          {
            id: 'c12', authorId: 'conn_2', authorName: this.getName(1), authorPicture: this.getPhoto(1),
            authorHeadline: 'Arquitecto Frontend en CloudSystems',
            content: 'Esto necesita hablarse más. La seguridad es responsabilidad de todos.',
            timestamp: now - 335000000,
          },
        ],
        shares: 41,
        saved: false,
      },
      {
        id: 'post_15',
        authorId: 'conn_15',
        authorName: this.getName(14),
        authorPicture: this.getPhoto(14),
        authorHeadline: 'Arquitecto Cloud | AWS Solutions Architect',
        content: 'Acabo de migrar nuestro SPA de Angular de EC2 a AWS Amplify Hosting. CI/CD sin configuración, SSL automático y CDN global listos para usar. El tiempo de despliegue pasó de 15 minutos a 90 segundos. Si todavía despliegas apps Angular manualmente, lo estás haciendo de la manera difícil.',
        image: this.api.getStockPhoto('aws-amplify-deploy', 600, 350),
        timestamp: now - 380000000,
        likes: ['conn_1', 'conn_3', 'conn_7', 'demo-user-001', 'conn_10'],
        comments: [],
        shares: 28,
        saved: false,
      },
      {
        id: 'post_16',
        authorId: 'conn_16',
        authorName: this.getName(15),
        authorPicture: this.getPhoto(15),
        authorHeadline: 'Ingeniero QA | Experto en Automatización de Pruebas',
        content: 'Consejo de testing en Angular: deja de probar detalles de implementación. Prueba comportamiento, no internos. Si tus pruebas se rompen cuando refactorizas pero el resultado es el mismo, tus pruebas están demasiado acopladas.\n\nUsa component harnesses, prueba lo que el usuario ve, y tu suite de pruebas se convierte en una red de seguridad en lugar de una pesadilla de mantenimiento.',
        image: null,
        timestamp: now - 420000000,
        likes: ['conn_2', 'conn_5', 'demo-user-001', 'conn_8'],
        comments: [],
        shares: 22,
        saved: false,
      },
      {
        id: 'post_17',
        authorId: 'conn_17',
        authorName: this.getName(16),
        authorPicture: this.getPhoto(16),
        authorHeadline: 'Escritor Técnico | Developer Advocate',
        content: 'Escribí documentación para 3 librerías de Angular este mes. Esto es lo que aprendí:\n\n1. Ejemplos de código > muros de texto\n2. Demos interactivas de StackBlitz aumentan la adopción un 40%\n3. Un buen README vale 10 blog posts\n4. La documentación de API debe ser auto-generada, no escrita a mano\n5. Las guías de migración son el tipo de doc #1 más solicitado\n\nLa buena documentación no es opcional. Es tu mejor marketing.',
        image: null,
        timestamp: now - 460000000,
        likes: ['conn_1', 'conn_3', 'conn_5', 'conn_9', 'demo-user-001', 'conn_11'],
        comments: [],
        shares: 55,
        saved: false,
      },
      {
        id: 'post_18',
        authorId: 'conn_18',
        authorName: this.getName(17),
        authorPicture: this.getPhoto(17),
        authorHeadline: 'Ingeniero de Soluciones | Pre-Sales | Angular',
        content: 'Acabo de terminar un proyecto de 6 meses ayudando a una empresa Fortune 500 a adoptar Angular en 12 equipos. El mayor desafío no fue técnico, fue organizacional. Lograr que los equipos se pusieran de acuerdo en convenciones, librerías compartidas y una estrategia de monorepo tomó más tiempo que la migración real.\n\nLa deuda técnica es fácil. La deuda organizacional es difícil.',
        image: this.api.getStockPhoto('enterprise-angular', 600, 350),
        timestamp: now - 500000000,
        likes: ['conn_2', 'conn_4', 'conn_6', 'demo-user-001'],
        comments: [],
        shares: 33,
        saved: false,
      },
      {
        id: 'post_19',
        authorId: 'conn_19',
        authorName: this.getName(18),
        authorPicture: this.getPhoto(18),
        authorHeadline: 'Investigador de IA | NLP y Computer Vision',
        content: 'Acabamos de publicar un paper sobre el uso de modelos transformer para generar código de componentes Angular a partir de diseños de Figma. El 73% de los componentes generados pasaron pruebas automatizadas sin modificación. El futuro del desarrollo frontend es asistido por IA, no reemplazado por IA.\n\nLos desarrolladores que aprendan a trabajar con IA superarán a los que no lo hagan. La herramienta está aquí para aumentarte, no para reemplazarte.',
        image: this.api.getStockPhoto('ai-codegen', 600, 350),
        timestamp: now - 540000000,
        likes: ['conn_1', 'conn_3', 'conn_5', 'conn_7', 'conn_11', 'demo-user-001', 'conn_12'],
        comments: [
          {
            id: 'c13', authorId: 'conn_11', authorName: this.getName(10), authorPicture: this.getPhoto(10),
            authorHeadline: 'Científico de Datos | Ingeniero ML',
            content: '¡Esto es fascinante! Me encantaría ver el paper. ¿Está en arXiv?',
            timestamp: now - 538000000,
          },
        ],
        shares: 89,
        saved: false,
      },
      {
        id: 'post_20',
        authorId: 'conn_20',
        authorName: this.getName(19),
        authorPicture: this.getPhoto(19),
        authorHeadline: 'Fundador de Startup | Pionero en EdTech',
        content: 'Acabamos de lanzar nuestra plataforma EdTech construida totalmente con Angular. Atendiendo a 50.000 estudiantes en 12 países. El SSR con Angular Universal fue un cambio radical para SEO y rendimiento de carga inicial.\n\nSi estás construyendo una plataforma educativa, enfócate en accesibilidad y soporte offline. Los estudiantes en zonas rurales necesitan apps que funcionen con conexiones lentas.',
        image: this.api.getStockPhoto('edtech-platform', 600, 350),
        timestamp: now - 580000000,
        likes: ['conn_1', 'conn_3', 'conn_5', 'conn_7', 'conn_9', 'demo-user-001', 'conn_10'],
        comments: [],
        shares: 47,
        saved: false,
      },
      {
        id: 'post_21',
        authorId: 'conn_21',
        authorName: this.getName(20),
        authorPicture: this.getPhoto(20),
        authorHeadline: 'Ingeniero Backend | Go y Node.js | Microservicios',
        content: 'Angular + Go es la combinación full-stack más infravalorada. Go maneja el backend con un rendimiento deslumbrante, Angular maneja el frontend con elegancia. Ambos tienen excelente tooling, tipado fuerte y grandes comunidades.\n\nLlevo 3 años usando esta combinación y nunca volveré a Node.js para servicios en producción.',
        image: null,
        timestamp: now - 620000000,
        likes: ['conn_2', 'conn_4', 'demo-user-001', 'conn_8'],
        comments: [],
        shares: 18,
        saved: false,
      },
      {
        id: 'post_22',
        authorId: 'conn_22',
        authorName: this.getName(21),
        authorPicture: this.getPhoto(21),
        authorHeadline: 'Desarrollador Frontend | Angular y Vue | Design Systems',
        content: 'Uso tanto Angular como Vue a diario. Aquí está mi comparación honesta:\n\nAngular: Mejor para equipos grandes, apps empresariales, necesidades complejas. La estructura opinionada mantiene a todos alineados.\nVue: Mejor para prototipos rápidos, equipos pequeños, y cuando quieres máxima flexibilidad.\n\nAmbos son excelentes. La "guerra de frameworks" es absurda. Usa la herramienta correcta para el trabajo.',
        image: null,
        timestamp: now - 660000000,
        likes: ['conn_1', 'conn_3', 'conn_5', 'conn_7', 'demo-user-001', 'conn_9', 'conn_11', 'conn_13'],
        comments: [
          {
            id: 'c14', authorId: 'conn_1', authorName: this.getName(0), authorPicture: this.getPhoto(0),
            authorHeadline: 'Ingeniero de Software Senior en TechFlow',
            content: 'Por fin, una opinión equilibrada. Ambos frameworks tienen su lugar.',
            timestamp: now - 658000000,
          },
          {
            id: 'c15', authorId: 'conn_13', authorName: this.getName(12), authorPicture: this.getPhoto(12),
            authorHeadline: 'Desarrollador Mobile | React Native y Angular',
            content: '100%. Uso React Native, Angular y Vue dependiendo del proyecto. Cada herramienta para su caso.',
            timestamp: now - 655000000,
          },
        ],
        shares: 63,
        saved: false,
      },
      {
        id: 'post_23',
        authorId: 'conn_23',
        authorName: this.getName(22),
        authorPicture: this.getPhoto(22),
        authorHeadline: 'Gerente de Producto | Fintech y HealthTech',
        content: 'Lección de producto: A tus usuarios no les importa tu stack tecnológico. Les importa la velocidad, la confiabilidad y que resuelvas su problema.\n\nCambiamos nuestro dashboard fintech de una app lenta en React a Angular con SSR. La satisfacción del usuario subió 45%. No porque Angular sea mejor, sino porque tomamos la migración como oportunidad para arreglar nuestra arquitectura.\n\nEl framework importa menos que la disciplina de ingeniería detrás de él.',
        image: this.api.getStockPhoto('product-lesson', 600, 350),
        timestamp: now - 700000000,
        likes: ['conn_1', 'conn_2', 'conn_4', 'conn_6', 'demo-user-001', 'conn_10'],
        comments: [],
        shares: 38,
        saved: false,
      },
      {
        id: 'post_24',
        authorId: 'conn_24',
        authorName: this.getName(23),
        authorPicture: this.getPhoto(23),
        authorHeadline: 'Arquitecto de Software | Microservicios y Angular',
        content: 'Micro-frontends con Angular Module Federation: lo bueno, lo malo y lo feo.\n\nLo bueno: Despliegues independientes, autonomía del equipo.\nLo malo: La gestión de dependencias compartidas es una pesadilla.\nLo feo: Cuando 3 equipos usan diferentes versiones de Angular.\n\n¿Lo recomendaría? Solo si tienes 5+ equipos. De lo contrario, un monorepo bien estructurado es más simple y rápido.',
        image: null,
        timestamp: now - 740000000,
        likes: ['conn_2', 'conn_4', 'conn_8', 'demo-user-001'],
        comments: [],
        shares: 29,
        saved: false,
      },
      {
        id: 'post_25',
        authorId: 'conn_1',
        authorName: this.getName(0),
        authorPicture: this.getPhoto(0),
        authorHeadline: 'Ingeniero de Software Senior en TechFlow | Experto en Angular',
        content: 'Resumen del año: 2025 fue el año en que Angular apostó totalmente por signals. Migramos 200+ componentes, eliminamos 15.000 líneas de boilerplate de RxJS y reducimos nuestro tiempo promedio de compilación un 60%. La experiencia de desarrollador es de otro mundo.\n\nSi todavía dudas sobre signals, solo empieza. Convierte un componente. Nunca volverás atrás.',
        image: this.api.getStockPhoto('year-review-angular', 600, 350),
        timestamp: now - 780000000,
        likes: ['conn_2', 'conn_3', 'conn_4', 'conn_5', 'conn_6', 'conn_7', 'demo-user-001', 'conn_8', 'conn_9', 'conn_10'],
        comments: [
          {
            id: 'c16', authorId: 'conn_5', authorName: this.getName(4), authorPicture: this.getPhoto(4),
            authorHeadline: 'Tech Lead | Contribuidor Open Source',
            content: 'La migración de RxJS a signals es lo mejor que hicimos este año. Mucho más simple.',
            timestamp: now - 778000000,
          },
        ],
        shares: 112,
        saved: false,
      },
      {
        id: 'post_26',
        authorId: 'conn_3',
        authorName: this.getName(2),
        authorPicture: this.getPhoto(2),
        authorHeadline: 'Gerente de Producto en InnovateLab | Construyendo el futuro del trabajo',
        content: 'Estamos organizando un webinar gratuito la próxima semana: "Construyendo Apps Angular Accesibles Que Todos Puedan Usar". Cubriremos cumplimiento WCAG, pruebas con lectores de pantalla, navegación por teclado y las funciones de accesibilidad integradas de Angular.\n\nLa accesibilidad no es solo sobre cumplimiento, es sobre llegar a las 1.000 millones de personas con discapacidades en todo el mundo. Esa es una audiencia enorme que muchas apps ignoran completamente.',
        image: this.api.getStockPhoto('accessibility-webinar', 600, 350),
        timestamp: now - 820000000,
        likes: ['conn_1', 'conn_5', 'conn_7', 'conn_9', 'demo-user-001'],
        comments: [],
        shares: 76,
        saved: false,
      },
      {
        id: 'post_27',
        authorId: 'conn_6',
        authorName: this.getName(5),
        authorPicture: this.getPhoto(5),
        authorHeadline: 'CTO en StartupHub | Inversor Ángel',
        content: 'Invertí en 3 startups basadas en Angular este trimestre. Esto es lo que todas tienen en común:\n\n1. Fuerte cultura de ingeniería\n2. Enfoque en experiencia del desarrollador\n3. Usan todo el ecosistema de Angular (CLI, Material, CDK)\n4. Despliegan rápido con CI/CD\n5. Se preocupan por los presupuestos de rendimiento\n\nEl framework no hace exitosa a la startup. El equipo sí. Pero una base sólida ayuda.',
        image: null,
        timestamp: now - 860000000,
        likes: ['conn_1', 'conn_2', 'conn_3', 'conn_4', 'conn_5', 'demo-user-001', 'conn_7', 'conn_10'],
        comments: [],
        shares: 94,
        saved: false,
      },
      {
        id: 'post_28',
        authorId: 'conn_9',
        authorName: this.getName(8),
        authorPicture: this.getPhoto(8),
        authorHeadline: 'Diseñador UX | Defensor de Design Systems | Experto en Accesibilidad',
        content: 'Acabo de completar una auditoría de design system para una empresa de 200 personas. Hallazgos:\n\n- 47 variantes de botones en toda la app\n- 12 colores primarios diferentes\n- 5 implementaciones diferentes de selector de fecha\n- 0 pruebas de accesibilidad aprobando\n\nAhora estamos consolidando en un único design system basado en Angular CDK. 6 meses de trabajo, pero ahorrará años de deuda técnica. Invierte en design systems temprano.',
        image: this.api.getStockPhoto('design-system-audit', 600, 350),
        timestamp: now - 900000000,
        likes: ['conn_1', 'conn_3', 'conn_5', 'conn_7', 'conn_11', 'demo-user-001', 'conn_12', 'conn_22'],
        comments: [
          {
            id: 'c17', authorId: 'conn_22', authorName: this.getName(21), authorPicture: this.getPhoto(21),
            authorHeadline: 'Desarrollador Frontend | Angular y Vue',
            content: '47 variantes de botones... me siento identificado. Tenemos 31 en mi empresa.',
            timestamp: now - 898000000,
          },
        ],
        shares: 51,
        saved: false,
      },
      {
        id: 'post_29',
        authorId: 'conn_11',
        authorName: this.getName(10),
        authorPicture: this.getPhoto(10),
        authorHeadline: 'Científico de Datos | Ingeniero ML | Python + TypeScript',
        content: '¡ng-ml acaba de recibir su primera actualización importante! Nuevas funciones:\n\n- Inferencia en streaming para video en tiempo real\n- Soporte de Web Workers para modelos pesados\n- Carga de modelos basada en signals (no más async pipes)\n- Visualización integrada con D3.js\n- Bundle 40% más pequeño\n\nGracias a los más de 50 contribuidores que hicieron esto posible. El open source es un deporte de equipo.',
        image: this.api.getStockPhoto('ngml-update', 600, 350),
        timestamp: now - 940000000,
        likes: ['conn_1', 'conn_2', 'conn_3', 'conn_5', 'conn_7', 'demo-user-001', 'conn_8', 'conn_19'],
        comments: [],
        shares: 67,
        saved: false,
      },
      {
        id: 'post_30',
        authorId: 'conn_5',
        authorName: this.getName(4),
        authorPicture: this.getPhoto(4),
        authorHeadline: 'Tech Lead | Contribuidor Open Source | Mentor',
        content: 'Después de 15 años en tecnología, estas son las 5 cosas que ojalá supiera el día uno:\n\n1. Las habilidades blandas importan más que las técnicas. La comunicación, la empatía y la colaboración te llevarán más lejos que cualquier framework.\n2. El código es un pasivo, no un activo. Menos código = menos bugs.\n3. Las pruebas son documentación que no puede mentir. Escríbelas.\n4. La senioridad es sobre impacto, no conocimiento. Se trata de hacer mejores a todos a tu alrededor.\n5. El burnout es real. Toma tus vacaciones. Establece límites. Tu carrera es un maratón, no un sprint.\n\nComparte esto con alguien que necesite escucharlo.',
        image: null,
        timestamp: now - 1000000000,
        likes: ['conn_1', 'conn_2', 'conn_3', 'conn_4', 'conn_6', 'conn_7', 'conn_8', 'conn_9', 'conn_10', 'demo-user-001', 'conn_11', 'conn_12', 'conn_13', 'conn_20'],
        comments: [
          {
            id: 'c18', authorId: 'conn_10', authorName: this.getName(9), authorPicture: this.getPhoto(9),
            authorHeadline: 'Gerente de Ingeniería en DataCorp',
            content: 'Esto debería ser lectura obligatoria para cada nuevo ingeniero. Guardándolo.',
            timestamp: now - 998000000,
          },
          {
            id: 'c19', authorId: 'conn_20', authorName: this.getName(19), authorPicture: this.getPhoto(19),
            authorHeadline: 'Fundador de Startup | Pionero en EdTech',
            content: 'El #4 me impactó. Los mejores líderes con los que he trabajado hicieron mejores a los demás, no solo a sí mismos.',
            timestamp: now - 995000000,
          },
        ],
        shares: 145,
        saved: false,
      },
    ];
  }

  private seedConnections(): Connection[] {
    const headlines = [
      'Ingeniero de Software Senior en TechFlow | Experto en Angular',
      'Arquitecto Frontend en CloudSystems',
      'Gerente de Producto en InnovateLab | Construyendo el futuro del trabajo',
      'Desarrollador Full-Stack | Angular y Node.js',
      'Tech Lead | Contribuidor Open Source | Mentor',
      'CTO en StartupHub | Inversor Ángel',
      'Consultor de Tecnología para ONG',
      'Ingeniero DevOps | Infraestructura Cloud',
      'Diseñador UX | Defensor de Design Systems',
      'Gerente de Ingeniería en DataCorp',
      'Científico de Datos | Ingeniero ML',
      'Diseñador de Producto | Investigador UX',
      'Desarrollador Mobile | React Native y Angular',
      'Ingeniero de Seguridad | Especialista AppSec',
      'Arquitecto Cloud | AWS Solutions Architect',
      'Ingeniero QA | Experto en Automatización de Pruebas',
      'Escritor Técnico | Developer Advocate',
      'Ingeniero de Soluciones | Pre-Sales | Angular',
      'Investigador de IA | NLP y Computer Vision',
      'Fundador de Startup | Pionero en EdTech',
      'Ingeniero Backend | Go y Node.js',
      'Desarrollador Frontend | Angular y Vue',
      'Gerente de Producto | Fintech y HealthTech',
      'Arquitecto de Software | Microservicios y Angular',
    ];

    return Array.from({ length: 24 }, (_, i) => ({
      id: `conn_${i + 1}`,
      name: this.getName(i),
      picture: this.getPhoto(i),
      headline: headlines[i],
      location: this.getLocation(i),
      mutualConnections: Math.floor(Math.random() * 50) + 3,
      connected: i < 5,
      pendingSent: i === 10 || i === 14,
      pendingReceived: i === 3 || i === 9 || i === 15 || i === 20,
    }));
  }

  private seedJobs(): Job[] {
    const now = Date.now();
    return [
      {
        id: 'job_1', title: 'Desarrollador Angular Senior', company: 'TechFlow Inc.', companyLogo: this.api.getStockPhoto('techflow-logo', 200, 200),
        location: 'San Francisco, CA', workType: 'Remoto', employmentType: 'Tiempo completo',
        description: 'Buscamos un Desarrollador Angular Senior para liderar nuestro equipo frontend en la construcción de productos SaaS de nueva generación. Arquitectarás soluciones escalables, mentorearás desarrolladores junior y promoverás mejores prácticas en toda la organización.',
        requirements: ['5+ años de experiencia con Angular', 'Sólidas habilidades en TypeScript', 'Experiencia con RxJS y signals', 'Conocimiento de pipelines CI/CD', 'Experiencia en liderazgo'],
        salary: '$140,000 - $180,000', postedDate: now - 86400000, applicants: 47, easyApply: true, applied: false, saved: false,
      },
      {
        id: 'job_2', title: 'Ingeniero Frontend (Angular)', company: 'InnovateLab', companyLogo: this.api.getStockPhoto('innovatelab-logo', 200, 200),
        location: 'Austin, TX', workType: 'Híbrido', employmentType: 'Tiempo completo',
        description: 'Únete a nuestro equipo con propósito construyendo herramientas para ONG. Trabajarás en productos que impactan directamente a organizaciones de bienestar social en todo el mundo.',
        requirements: ['3+ años de experiencia con Angular', 'Dominio de TypeScript', 'Experiencia con CSS/Tailwind', 'Pasión por el impacto social'],
        salary: '$95,000 - $130,000', postedDate: now - 172800000, applicants: 32, easyApply: true, applied: false, saved: false,
      },
      {
        id: 'job_3', title: 'Desarrollador Full-Stack', company: 'StartupHub', companyLogo: this.api.getStockPhoto('startuphub-logo', 200, 200),
        location: 'Remoto (Mundial)', workType: 'Remoto', employmentType: 'Tiempo completo',
        description: 'Construye la plataforma que conecta voluntarios capacitados con ONG. Frontend en Angular, backend en Node.js. Startup Serie A con fuerte financiación.',
        requirements: ['Angular + Node.js', 'Experiencia con PostgreSQL', 'Conocimiento de AWS/GCP', 'Mentalidad startup'],
        salary: '$110,000 - $150,000', postedDate: now - 259200000, applicants: 89, easyApply: false, applied: false, saved: false,
      },
      {
        id: 'job_4', title: 'Tech Lead Angular', company: 'CloudSystems', companyLogo: this.api.getStockPhoto('cloudsystems-logo', 200, 200),
        location: 'Seattle, WA', workType: 'Presencial', employmentType: 'Tiempo completo',
        description: 'Lidera un equipo de 8 ingenieros construyendo dashboards de gestión cloud. Define arquitectura, estándares de revisión de código y roadmap técnico.',
        requirements: ['7+ años de experiencia frontend', 'Experiencia experta en Angular', 'Liderazgo de equipos', 'Habilidades de diseño de sistemas'],
        salary: '$160,000 - $210,000', postedDate: now - 345600000, applicants: 23, easyApply: false, applied: false, saved: false,
      },
      {
        id: 'job_5', title: 'Desarrollador Angular Junior', company: 'DataCorp', companyLogo: this.api.getStockPhoto('datacorp-logo', 200, 200),
        location: 'Toronto, Canadá', workType: 'Híbrido', employmentType: 'Tiempo completo',
        description: 'Gran oportunidad para un desarrollador junior para crecer. Trabajarás junto a ingenieros senior en herramientas de visualización de datos usadas por miles de empresas.',
        requirements: ['1+ año de experiencia con Angular', 'TypeScript básico', 'Ganas de aprender', 'Titulo en CS o equivalente'],
        salary: '$70,000 - $90,000', postedDate: now - 432000000, applicants: 156, easyApply: true, applied: false, saved: false,
      },
      {
        id: 'job_6', title: 'Ingeniero UI (Angular + Design Systems)', company: 'DesignFirst', companyLogo: this.api.getStockPhoto('designfirst-logo', 200, 200),
        location: 'Remoto (EE.UU.)', workType: 'Remoto', employmentType: 'Contrato',
        description: 'Contrato de 6 meses con posibilidad de tiempo completo. Construye y mantén un design system completo en Angular usado en 12+ productos.',
        requirements: ['Librerías de componentes Angular', 'Flujo de Figma a código', 'Accesibilidad (WCAG)', 'Experiencia con Storybook'],
        salary: '$90 - $120/hora', postedDate: now - 518400000, applicants: 41, easyApply: true, applied: false, saved: false,
      },
      {
        id: 'job_7', title: 'Desarrollador Angular (Intermedio)', company: 'FinTech Solutions', companyLogo: this.api.getStockPhoto('fintech-logo', 200, 200),
        location: 'Nueva York, NY', workType: 'Híbrido', employmentType: 'Tiempo completo',
        description: 'Únete a una empresa fintech de rápido crecimiento construyendo la próxima generación de herramientas bancarias. Trabajarás en aplicaciones Angular orientadas al cliente usadas por millones de usuarios diariamente.',
        requirements: ['3+ años con Angular', 'TypeScript', 'Experiencia con RxJS', 'Conocimiento del dominio financiero es un plus'],
        salary: '$100,000 - $135,000', postedDate: now - 600000000, applicants: 64, easyApply: true, applied: false, saved: false,
      },
      {
        id: 'job_8', title: 'Ingeniero Frontend Senior', company: 'HealthTech AI', companyLogo: this.api.getStockPhoto('healthtech-logo', 200, 200),
        location: 'Boston, MA', workType: 'Remoto', employmentType: 'Tiempo completo',
        description: 'Construye aplicaciones de salud potenciadas por IA con Angular. Trabaja en herramientas de diagnóstico, portales de pacientes e interfaces basadas en ML que ayudan a los médicos a tomar mejores decisiones.',
        requirements: ['5+ años con Angular', 'TypeScript sólido', 'Experiencia con visualización de datos', 'Conocimiento del dominio salud preferible'],
        salary: '$130,000 - $170,000', postedDate: now - 691200000, applicants: 38, easyApply: false, applied: false, saved: false,
      },
      {
        id: 'job_9', title: 'Consultor Angular', company: 'Digital Transform Co.', companyLogo: this.api.getStockPhoto('digitaltransform-logo', 200, 200),
        location: 'Remoto (EU)', workType: 'Remoto', employmentType: 'Contrato',
        description: 'Contrato de consultoría de 6 meses ayudando a una gran empresa a migrar de AngularJS a Angular 19. Lidera la estrategia de migración, capacita al equipo y garantiza una transición fluida.',
        requirements: ['Experiencia en migración de Angular', 'Consultoría a nivel empresarial', 'Sólidas habilidades de comunicación', 'Conocimiento de AngularJS'],
        salary: '$120 - $150/hora', postedDate: now - 777600000, applicants: 12, easyApply: false, applied: false, saved: false,
      },
      {
        id: 'job_10', title: 'Staff Software Engineer (Angular)', company: 'CloudNative Labs', companyLogo: this.api.getStockPhoto('cloudnative-logo', 200, 200),
        location: 'Denver, CO', workType: 'Híbrido', employmentType: 'Tiempo completo',
        description: 'Rol de nivel Staff liderando la arquitectura Angular en múltiples equipos de producto. Define estándares, impulsa la innovación y mentorea ingenieros senior.',
        requirements: ['8+ años frontend', 'Experiencia profunda en Angular', 'Experiencia en arquitectura', 'Liderazgo entre equipos'],
        salary: '$180,000 - $230,000', postedDate: now - 864000000, applicants: 19, easyApply: false, applied: false, saved: false,
      },
      {
        id: 'job_11', title: 'Desarrollador Frontend (Angular + Vue)', company: 'MultiStack Inc.', companyLogo: this.api.getStockPhoto('multistack-logo', 200, 200),
        location: 'Berlín, Alemania', workType: 'Remoto', employmentType: 'Tiempo completo',
        description: 'Trabaja en una plataforma multi-framework usando Angular y Vue. Gran oportunidad para expandir tus habilidades y trabajar con un equipo internacional diverso.',
        requirements: ['Experiencia con Angular', 'Conocimiento de Vue.js', 'TypeScript', 'Fluidez en inglés'],
        salary: '€70,000 - €95,000', postedDate: now - 950400000, applicants: 27, easyApply: true, applied: false, saved: false,
      },
      {
        id: 'job_12', title: 'Desarrollador Angular (Practicante)', company: 'TechFlow Inc.', companyLogo: this.api.getStockPhoto('techflow-logo', 200, 200),
        location: 'San Francisco, CA', workType: 'Presencial', employmentType: 'Pasantía',
        description: 'Pasantía de verano en TechFlow. Trabaja junto a ingenieros senior en proyectos reales de Angular. Mentoría, sesiones de aprendizaje y un camino hacia tiempo completo.',
        requirements: ['Conocimiento básico de Angular', 'HTML/CSS/JS', 'Actualmente cursando CS', 'Ganas de aprender'],
        salary: '$4,000/mes', postedDate: now - 1036800000, applicants: 203, easyApply: true, applied: false, saved: false,
      },
    ];
  }

  private seedConversations(): Conversation[] {
    const now = Date.now();
    return [
      {
        id: 'conv_1', participantId: 'conn_1', participantName: this.getName(0), participantPicture: this.getPhoto(0),
        participantHeadline: 'Ingeniero de Software Senior en TechFlow',
        unread: 2,
        messages: [
          { id: 'm1', senderId: 'conn_1', content: '¡Hola! Vi tu perfil y noté que estás trabajando con signals de Angular. ¿Cómo va eso?', timestamp: now - 7200000 },
          { id: 'm2', senderId: 'demo-user-001', content: '¡Hola! Va genial. La migración fue fluida y el modelo de reactividad es mucho más limpio.', timestamp: now - 7000000 },
          { id: 'm3', senderId: 'conn_1', content: '¡Eso es genial! ¿Te interesaría compartir tu experiencia en nuestro próximo meetup de Angular?', timestamp: now - 6800000 },
          { id: 'm4', senderId: 'conn_1', content: 'Estamos buscando ponentes para el próximo mes.', timestamp: now - 6700000 },
        ],
      },
      {
        id: 'conv_2', participantId: 'conn_3', participantName: this.getName(2), participantPicture: this.getPhoto(2),
        participantHeadline: 'Gerente de Producto en InnovateLab',
        unread: 0,
        messages: [
          { id: 'm5', senderId: 'conn_3', content: '¡Gracias por conectar! Vi que te apasiona la tecnología de impacto social.', timestamp: now - 86400000 },
          { id: 'm6', senderId: 'demo-user-001', content: '¡Absolutamente! Creo que la tecnología puede ser una fuerza poderosa para el bien.', timestamp: now - 86000000 },
          { id: 'm7', senderId: 'conn_3', content: 'Compartimos esa visión. Deberíamos hablar sobre una posible colaboración.', timestamp: now - 85000000 },
        ],
      },
      {
        id: 'conv_3', participantId: 'conn_5', participantName: this.getName(4), participantPicture: this.getPhoto(4),
        participantHeadline: 'Tech Lead | Mentor',
        unread: 1,
        messages: [
          { id: 'm8', senderId: 'conn_5', content: 'Estoy organizando un programa de mentoría para devs junior. ¿Te gustaría ser mentor?', timestamp: now - 172800000 },
          { id: 'm9', senderId: 'demo-user-001', content: '¡Me encantaría! Cuéntame más sobre el programa.', timestamp: now - 170000000 },
          { id: 'm10', senderId: 'conn_5', content: 'Es un programa de 12 semanas. Serías mentor de 2-3 juniors. Te envío los detalles.', timestamp: now - 169000000 },
        ],
      },
      {
        id: 'conv_4', participantId: 'conn_8', participantName: this.getName(7), participantPicture: this.getPhoto(7),
        participantHeadline: 'Ingeniero DevOps | Infraestructura Cloud',
        unread: 0,
        messages: [
          { id: 'm11', senderId: 'conn_8', content: 'Hola, vi tu publicación sobre presupuestos de bundle. Estamos luchando con eso en CloudSystems. ¿Podemos hacer una llamada?', timestamp: now - 259200000 },
          { id: 'm12', senderId: 'demo-user-001', content: '¡Claro! Encantado de compartir lo que hicimos. Envíame tu enlace de calendario.', timestamp: now - 258000000 },
          { id: 'm13', senderId: 'conn_8', content: '¡Enviado! Muchas gracias, de verdad lo aprecio.', timestamp: now - 257000000 },
        ],
      },
      {
        id: 'conv_5', participantId: 'conn_11', participantName: this.getName(10), participantPicture: this.getPhoto(10),
        participantHeadline: 'Científico de Datos | Ingeniero ML',
        unread: 3,
        messages: [
          { id: 'm14', senderId: 'conn_11', content: 'Acabo de lanzar ng-ml — la librería de Angular + TensorFlow.js. ¡Me encantaría tu feedback!', timestamp: now - 345600000 },
          { id: 'm15', senderId: 'demo-user-001', content: '¡Esto parece increíble! La API basada en signals es exactamente lo que necesitábamos. La probaré esta semana.', timestamp: now - 344000000 },
          { id: 'm16', senderId: 'conn_11', content: 'Avísame si tienes algún problema. La estoy manteniendo activamente.', timestamp: now - 343000000 },
          { id: 'm17', senderId: 'conn_11', content: 'Además, ¿te interesaría contribuir? Necesitamos ayuda con la integración de D3.js.', timestamp: now - 342000000 },
        ],
      },
    ];
  }

  private seedNotifications(): AppNotification[] {
    const now = Date.now();
    return [
      { id: 'n1', type: 'like', actorName: this.getName(0), actorPicture: this.getPhoto(0), text: 'le dio me gusta a tu publicación sobre signals de Angular', timestamp: now - 1800000, read: false },
      { id: 'n2', type: 'comment', actorName: this.getName(1), actorPicture: this.getPhoto(1), text: 'comentó en tu publicación: "¡Excelentes ideas sobre TypeScript strict mode!"', timestamp: now - 3600000, read: false },
      { id: 'n3', type: 'connection', actorName: this.getName(3), actorPicture: this.getPhoto(3), text: 'quiere conectarse contigo', timestamp: now - 7200000, read: false },
      { id: 'n4', type: 'job', actorName: 'TechFlow Inc.', actorPicture: '', text: 'publicó un empleo que coincide con tu perfil: Desarrollador Angular Senior', timestamp: now - 86400000, read: true },
      { id: 'n5', type: 'mention', actorName: this.getName(2), actorPicture: this.getPhoto(2), text: 'te mencionó en una publicación sobre tecnología de impacto social', timestamp: now - 172800000, read: true },
      { id: 'n6', type: 'connection', actorName: this.getName(9), actorPicture: this.getPhoto(9), text: 'quiere conectarse contigo', timestamp: now - 259200000, read: true },
      { id: 'n7', type: 'like', actorName: this.getName(7), actorPicture: this.getPhoto(7), text: 'le dio me gusta a tu publicación sobre presupuestos de bundle y rendimiento de Angular', timestamp: now - 345600000, read: true },
      { id: 'n8', type: 'connection', actorName: this.getName(15), actorPicture: this.getPhoto(15), text: 'quiere conectarse contigo', timestamp: now - 432000000, read: true },
      { id: 'n9', type: 'mention', actorName: this.getName(10), actorPicture: this.getPhoto(10), text: 'te mencionó en una publicación sobre integración de ML + Angular', timestamp: now - 518400000, read: true },
      { id: 'n10', type: 'job', actorName: 'FinTech Solutions', actorPicture: '', text: 'publicó un empleo que coincide con tu perfil: Desarrollador Angular (Intermedio)', timestamp: now - 604800000, read: true },
    ];
  }
}
