import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface RandomUser {
  name: { first: string; last: string };
  picture: { large: string; medium: string; thumbnail: string };
  email: string;
  location: { city: string; state: string; country: string };
  login: { uuid: string; username: string };
}

export interface ApiStatus {
  name: string;
  url: string;
  status: 'idle' | 'loading' | 'connected' | 'error';
  description: string;
  lastFetch: number | null;
  recordsFetched: number;
}

@Injectable({ providedIn: 'root' })
export class RealApiService {
  private http = inject(HttpClient);

  readonly apiStatuses = signal<ApiStatus[]>([
    { name: 'randomuser.me', url: 'https://randomuser.me/api', status: 'idle', description: 'User profiles, names & avatars', lastFetch: null, recordsFetched: 0 },
    { name: 'Picsum Photos', url: 'https://picsum.photos', status: 'idle', description: 'Stock photos for posts & covers', lastFetch: null, recordsFetched: 0 },
    { name: 'DiceBear', url: 'https://api.dicebear.com/7.x', status: 'idle', description: 'Fallback avatar generation', lastFetch: null, recordsFetched: 0 },
    { name: 'LinkedIn OIDC', url: 'https://api.linkedin.com/v2/userinfo', status: 'idle', description: 'Sign in with LinkedIn (OpenID Connect)', lastFetch: null, recordsFetched: 0 },
  ]);

  /**
   * Fetches real user data from randomuser.me API.
   * Returns profiles with real names, photos and locations.
   */
  async fetchUsers(count: number = 10): Promise<RandomUser[]> {
    this.updateStatus('randomuser.me', 'loading');

    try {
      const data = await firstValueFrom(
        this.http.get<{ results: RandomUser[]; info: any }>(
          `https://randomuser.me/api/?results=${count}&nat=us,gb,es,de,fr,mx,br,in,jp,ca&inc=name,picture,email,location,login`
        )
      );

      this.updateStatus('randomuser.me', 'connected', data.results.length);
      return data.results;
    } catch (err) {
      console.error('randomuser.me fetch error:', err);
      this.updateStatus('randomuser.me', 'error');
      return this.fallbackUsers(count);
    }
  }

  /**
   * Fetches a single random user from randomuser.me
   */
  async fetchOneUser(): Promise<RandomUser | null> {
    const users = await this.fetchUsers(1);
    return users[0] || null;
  }

  /**
   * Gets a real stock photo URL from Picsum Photos.
   * Uses seed for consistent images per user.
   */
  getStockPhoto(seed: string, width: number = 600, height: number = 400): string {
    this.updateStatus('Picsum Photos', 'connected', 1);
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
  }

  /**
   * Gets a random stock photo URL (different each time)
   */
  getRandomStockPhoto(width: number = 600, height: number = 400): string {
    return `https://picsum.photos/${width}/${height}?random=${Math.floor(Math.random() * 10000)}`;
  }

  /**
   * Gets a cover/banner photo for profiles
   */
  getCoverPhoto(seed: string): string {
    return `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/200`;
  }

  /**
   * Gets a DiceBear avatar as fallback
   */
  getDiceBearAvatar(seed: string): string {
    this.updateStatus('DiceBear', 'connected', 1);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=d1fae5,a7f3d0,6ee7b7,34d399`;
  }

  /**
   * Marks the LinkedIn API status as connected when user signs in
   */
  markLinkedInConnected(): void {
    this.updateStatus('LinkedIn OIDC', 'connected', 1);
  }

  /**
   * Gets current API statuses for display
   */
  getApiStatuses(): ApiStatus[] {
    return this.apiStatuses();
  }

  private updateStatus(name: string, status: ApiStatus['status'], records: number = 0): void {
    const statuses = this.apiStatuses().map(s =>
      s.name === name
        ? {
            ...s,
            status,
            lastFetch: status === 'connected' ? Date.now() : s.lastFetch,
            recordsFetched: s.recordsFetched + records,
          }
        : s
    );
    this.apiStatuses.set(statuses);
  }

  private fallbackUsers(count: number): RandomUser[] {
    const names = [
      ['Sofia', 'Ramirez'], ['James', 'Chen'], ['Maria', 'Gonzalez'],
      ['David', 'Kim'], ['Priya', 'Patel'], ['Oliver', 'Schmidt'],
      ['Aisha', 'Mohammed'], ['Carlos', 'Mendoza'], ['Yuki', 'Tanaka'],
      ['Emma', 'Wilson'],
    ];
    const users: RandomUser[] = [];
    for (let i = 0; i < count; i++) {
      const [first, last] = names[i % names.length];
      users.push({
        name: { first, last },
        picture: {
          large: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'men' : 'women'}/${i + 10}.jpg`,
          medium: `https://randomuser.me/api/portraits/med/${i % 2 === 0 ? 'men' : 'women'}/${i + 10}.jpg`,
          thumbnail: `https://randomuser.me/api/portraits/thumb/${i % 2 === 0 ? 'men' : 'women'}/${i + 10}.jpg`,
        },
        email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
        location: { city: 'San Francisco', state: 'CA', country: 'USA' },
        login: { uuid: `fallback-${i}`, username: `${first.toLowerCase()}${last.toLowerCase()}` },
      });
    }
    return users;
  }
}

