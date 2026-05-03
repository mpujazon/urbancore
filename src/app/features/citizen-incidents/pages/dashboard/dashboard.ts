import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, type Observable } from 'rxjs';
import type { IncidentCategory, IncidentDto } from '../../../../shared/models/IncidentInterface';
import { IncidentService } from '../../../report-incident/services/incident-service';

type IncidentStatus = 'Resolved' | 'Scheduled' | 'Under Review' | 'In Progress' | 'Rejected' | 'New';

interface IncidentCard {
  id: string;
  category: string;
  icon: string;
  date: string;
  title: string;
  description: string;
  imageUrl: string;
  status: IncidentStatus;
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly incidentService = inject(IncidentService);
  private readonly myIncidents$: Observable<IncidentCard[]> = this.incidentService
    .getSignedInCitizenIncidents()
    .pipe(map((incidents: IncidentDto[]) => incidents.map((incident: IncidentDto) => this.mapIncidentToCard(incident))));

  private readonly incidentsResponse = toSignal(this.myIncidents$, { initialValue: [] as IncidentCard[] });

  protected readonly incidents = computed((): IncidentCard[] => this.incidentsResponse() ?? []);
  protected readonly totalReported = computed(() => this.incidents().length);
  protected readonly totalResolved = computed(() => this.incidents().filter((incident: IncidentCard) => incident.status === 'Resolved').length);

  private mapIncidentToCard(incident: IncidentDto): IncidentCard {
    return {
      id: incident.id,
      category: this.formatCategory(incident.category),
      icon: this.getCategoryIcon(incident.category),
      date: this.formatDate(incident.createdAt),
      title: incident.title,
      description: incident.description,
      imageUrl: incident.images[0]?.thumbnailUrl || incident.images[0]?.url || 'https://via.placeholder.com/640x360?text=Incident',
      status: this.mapStatus(incident.status),
    };
  }

  private mapStatus(status: IncidentDto['status']): IncidentStatus {
    switch (status) {
      case 'RESOLVED':
        return 'Resolved';
      case 'PLANNED':
        return 'Scheduled';
      case 'UNDER_REVIEW':
        return 'Under Review';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'REJECTED':
      case 'CANCELLED':
        return 'Rejected';
      case 'NEW':
      default:
        return 'New';
    }
  }

  private formatCategory(category: IncidentCategory): string {
    return category
      .toLowerCase()
      .split('_')
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(' ');
  }

  private getCategoryIcon(category: IncidentCategory): string {
    switch (category) {
      case 'POTHOLE':
        return 'fa-road';
      case 'LIGHTING':
        return 'fa-lightbulb';
      case 'STREET_FURNITURE':
        return 'fa-city';
      case 'CLEANLINESS':
        return 'fa-trash-can';
      case 'NOISE':
        return 'fa-volume-high';
      case 'GRAFFITI':
        return 'fa-spray-can';
      case 'OTHER':
      default:
        return 'fa-circle-question';
    }
  }

  private formatDate(dateValue: string): string {
    const parsedDate = new Date(dateValue);
    if (Number.isNaN(parsedDate.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(parsedDate);
  }
}
