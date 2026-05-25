import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { IncidentCard } from '../../../../shared/components/incident-card/incident-card';
import { IncidentExplorerMapFacade } from '../../services/incident-explorer-map-facade';
import { IncidentsExplorerStore } from '../../store/incidents-explorer.store';
import { ExplorerFilterBar } from '../../components/explorer-filter-bar/explorer-filter-bar';
import { AppPagination } from '../../../../shared/components/app-pagination/app-pagination';
import { IncidentExplorerPageFacade } from '../../services/incident-explorer-page.facade';

@Component({
  selector: 'app-incident-explorer-page',
  imports: [
    IncidentCard,
    ExplorerFilterBar,
    AppPagination,
  ],
  templateUrl: './incident-explorer-page.html',
  styleUrl: './incident-explorer-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [IncidentExplorerMapFacade, IncidentsExplorerStore, IncidentExplorerPageFacade],
  host: {
    '(window:resize)': 'onViewportResize()',
  },
})
export class IncidentExplorerPage implements AfterViewInit, OnDestroy {
  protected readonly pageFacade = inject(IncidentExplorerPageFacade);
  protected readonly mapFacade = this.pageFacade.mapFacade;
  protected readonly store = this.pageFacade.store;

  @ViewChild('mapContainer', { static: true })
  private mapContainer?: ElementRef<HTMLElement>;

  @ViewChild('incidentsContainer')
  private set incidentsContainer(container: ElementRef<HTMLElement> | undefined) {
    this.pageFacade.setIncidentsContainer(container?.nativeElement ?? null);
  }

  ngAfterViewInit(): void {
    if (!this.mapContainer) return;

    this.pageFacade.initMap(this.mapContainer.nativeElement);
  }

  ngOnDestroy(): void {
    this.pageFacade.destroy();
  }

  protected openMobileMap(): void {
    this.pageFacade.openMobileMap();
  }

  protected closeMobileMap(): void {
    this.pageFacade.closeMobileMap();
  }

  protected onViewportResize(): void {
    this.pageFacade.onViewportResize();
  }

  protected onIncidentCardClick(incidentId: string): void {
    this.pageFacade.onIncidentCardClick(incidentId);
  }

  protected toggleFilters(): void {
    this.pageFacade.toggleFilters();
  }

  protected setFilters(filters: Parameters<IncidentsExplorerStore['setFilters']>[0]): void {
    this.pageFacade.setFilters(filters);
  }

  protected clearFilters(): void {
    this.pageFacade.clearFilters();
  }

  protected setPage(page: number): void {
    this.pageFacade.setPage(page);
  }

  protected setSize(size: number): void {
    this.pageFacade.setSize(size);
  }

  protected isMobileMapOpen(): boolean {
    return this.pageFacade.isMobileMapOpen();
  }

  protected showFilters(): boolean {
    return this.pageFacade.showFilters();
  }

  protected incidentCards() {
    return this.pageFacade.incidentCards();
  }
}
