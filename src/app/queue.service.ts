import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QueueResponse {
  success: boolean;
  ticket: string;
  index?: number;
}

@Injectable({ providedIn: 'root' })
export class QueueService {
  private readonly http = inject(HttpClient);

  next(): Observable<QueueResponse> {
    return this.http.post<QueueResponse>('/api/queue/next', {});
  }

  reset(): Observable<QueueResponse> {
    return this.http.post<QueueResponse>('/api/queue/reset', {});
  }
}
