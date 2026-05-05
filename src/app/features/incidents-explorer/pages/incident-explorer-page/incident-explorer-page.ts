import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSliders } from '@fortawesome/free-solid-svg-icons';

type Severity = 'critical' | 'planned' | 'resolved';

interface Incident {
  title: string;
  location: string;
  time: string;
  category: string;
  image: string;
  imageAlt: string;
  severity: Severity;
}

@Component({
  selector: 'app-incident-explorer-page',
  imports: [NgOptimizedImage, FontAwesomeModule],
  templateUrl: './incident-explorer-page.html',
  styleUrl: './incident-explorer-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentExplorerPage {
  protected readonly faSliders = faSliders;
  protected readonly categories = ['All Categories', 'Infrastructure', 'Public Safety', 'Maintenance'];
  protected readonly selectedCategory = signal('All Categories');

  protected readonly incidents: Incident[] = [
    {
      title: 'Water Main Break',
      location: 'North Avenue & 4th St',
      time: '12m ago',
      category: 'Infrastructure',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDgywlvaTYbbH8DEV0BiRqR1m2wRJvrhkFH1Jq7ArRH2IaP-AN_H77XKiVbVVefyGUMbjTt5HqiafSPlZx05SDCF-C2LDLpYgxXoyEljJcuPPHm88pCUMg0hdMnysnByCm92HKSZ4EJ61xV6rMnAc6Ss3XGgD5mVdcfv1vGekI3ckh_ryYrs6h_5yNEe3CfSJ8POJN2Hg3dgh8iD6Q8BYuvvI0vO34_g51uOelBSdIUWnubFqP00aUBPfvtua5weiFfVeyQ8l6H1uI',
      imageAlt: 'Broken water main flooding urban street intersection',
      severity: 'critical',
    },
    {
      title: 'Road Resurfacing',
      location: 'West End Boulevard',
      time: 'Oct 24',
      category: 'Maintenance',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDsr2EuURP3ck2Tb0t_FJOROeK-WyQyz6XwwR5OjU3NisQjDjXWGf9h-lJEzmZkf9TUVZRTN9uvshL0VMZd20WIAAGwsE_R8gUfHnLOKBGuOG_H7RitfUGwBIcmqJeUy9QSdXWvugx2aj_mSQFwmHhEORnjIJ6zoC6JAbKtFEPwn2uN71oJcTYS9h_WObQQvIB7nw8MdnozpyTaBoGGMcNAsTT5mThYg1lNdK0LJwUxo8lEuypGDUivW6rHkH0Lbf3arp4e0C2E9MU',
      imageAlt: 'Construction equipment repaving a city road section',
      severity: 'planned',
    },
    {
      title: 'Traffic Collision',
      location: 'Downtown Interchange',
      time: '2h ago',
      category: 'Public Safety',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBj-PRvL0EbuZLvq3qmnSr7cy3pLPlq8MPO0kI5SLow7svxkBSI_7Ocq80f3FchAtlkrKQjBY46GSoJiSYNzDaYpx98HEIUTAmPhP8-IKMYq-q7hEJfQbyKa7HpWNUEBMtaNjI471W9LPRpCofsCG3buM-3waVtg-YjBiSRWsXrBug5lM2h9K7z_XOTuJwB2KDXFjZ4OxqQapjxSnX21Ubt-ekJo7Mf3oFWoYe-NkzeJQIGFvlrWH_FPi-1TfhVRPbBnCmgQWtCX_k',
      imageAlt: 'Cleared intersection after a minor traffic collision',
      severity: 'resolved',
    },
  ];

  protected readonly filteredIncidents = computed(() => {
    const category = this.selectedCategory();
    return category === 'All Categories'
      ? this.incidents
      : this.incidents.filter((incident) => incident.category === category);
  });

  protected selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  protected severityLabel(severity: Severity): string {
    return severity[0].toUpperCase() + severity.slice(1);
  }

  protected severityClass(severity: Severity): string {
    return `severity-${severity}`;
  }
}
