import { Component, inject } from '@angular/core';
import { QueueService, QueueResponse } from './queue.service';

type Page = 'home' | 'ticket' | 'reset';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly queueService = inject(QueueService);

  page: Page = 'home';
  ticket = '00';
  ticketDate = '';
  loading = false;
  error = '';

  takeTicket(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = '';

    this.queueService.next().subscribe({
      next: (result: QueueResponse) => {
        this.ticket = result.ticket;
        this.ticketDate = this.formatThaiDate();
        this.page = 'ticket';
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message || 'ไม่สามารถรับบัตรคิวได้';
        this.loading = false;
      }
    });
  }

  resetQueue(): void {
    if (this.loading) return;

    this.loading = true;
    this.error = '';

    this.queueService.reset().subscribe({
      next: () => {
        this.ticket = '00';
        this.page = 'reset';
        this.loading = false;
      },
      error: (err: Error) => {
        this.error = err.message || 'ไม่สามารถล้างคิวได้';
        this.loading = false;
      }
    });
  }

  showResetPage(): void {
    this.error = '';
    this.page = 'reset';
  }

  backHome(): void {
    this.error = '';
    this.page = 'home';
  }

  private formatThaiDate(): string {
    const now = new Date();
    return `วันที่ : ${now.toLocaleDateString('th-TH')} เวลา ${now.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    })} น.`;
  }
}
