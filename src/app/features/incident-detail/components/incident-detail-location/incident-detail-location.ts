import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component, computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  ViewChild
} from '@angular/core';
import type { IncidentDetailLocationVm } from '../../../../shared/models/incident-vm.model';
import {LeafletMapService} from '../../../../shared/services/leaflet-map-service';

@Component({
  selector: 'app-incident-detail-location',
  templateUrl: './incident-detail-location.html',
  styleUrl: './incident-detail-location.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentDetailLocationComponent implements AfterViewInit, OnDestroy{
  readonly location = input.required<IncidentDetailLocationVm>();
  private readonly locationTuple = computed(()=>{
    return [this.location().lat, this.location().lng] as L.LatLngTuple
  })

  private readonly mapService = inject(LeafletMapService);
  private map?: L.Map;

  @ViewChild('mapContainer', { static: true })
  private mapContainer?: ElementRef<HTMLElement>;


  ngAfterViewInit() {
    if(!this.mapContainer){
      return;
    }

    this.map = this.mapService.createMap(this.mapContainer.nativeElement, this.locationTuple(),17, true);
    this.mapService.disableMapInteractions(this.map);
    this.mapService.createMarker(this.map, this.locationTuple())

  }

  ngOnDestroy() {
    if(!this.map){
      return;
    }

    this.mapService.destroyMap(this.map);
  }
}
