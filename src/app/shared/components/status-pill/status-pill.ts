import {ChangeDetectionStrategy, Component, input} from '@angular/core';

@Component({
  selector: 'app-status-pill',
  imports: [],
  templateUrl: './status-pill.html',
  styleUrl: './status-pill.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusPill {
  statusName = input.required<string>();
  classStyle = input.required<string>();
}
