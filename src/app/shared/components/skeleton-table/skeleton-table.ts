import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: '[app-skeleton-row]',
  imports: [],
  templateUrl: './skeleton-table.html',
  styleUrl: './skeleton-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonTable {

}
