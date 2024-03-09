import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { LogService } from '../../services/log/log.service';

export type PageNo = number;

@Component({
  selector: 'pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent implements AfterViewInit, OnInit, OnChanges {
  @ViewChild('pagination', { static: false }) myElementRef!: ElementRef;
  @Input() totalPages: number = 100;
  @Input() currentPage: number = 1;
  @Input() noOfPagesVisible: number = 5;
  @Output() onPageChange = new EventEmitter<PageNo>();

  pageNumbers!: PageNo[];
  pageNumberWidth!: string;

  constructor(private changeDetector: ChangeDetectorRef) {}
  ngOnInit(): void {
    try {
      this.pageNumbers = this.paginate(
        this.currentPage,
        this.totalPages,
        this.noOfPagesVisible
      );
    } catch (error) {
      LogService.error(error);
    }
  }

  ngAfterViewInit(): void {
    this.setEqualWidthsBasedOnMaxPageNumberWidth();
  }

  ngOnChanges(changes: SimpleChanges): void {
    try {
      this.pageNumbers = this.paginate(
        this.currentPage,
        this.totalPages,
        this.noOfPagesVisible
      );
      this.setEqualWidthsBasedOnMaxPageNumberWidth();
    } catch (error) {
      LogService.error(error);
    }
  }

  setEqualWidthsBasedOnMaxPageNumberWidth(): void {
    const isPaginationRendered = this.myElementRef?.nativeElement;

    if (isPaginationRendered) {
      this.pageNumberWidth = 'auto';
      this.changeDetector.detectChanges();

      const pageNumbers = isPaginationRendered.querySelectorAll('.page-number');
      let currentBiggestWidth = 0;

      for (let pageNumber of pageNumbers) {
        if (currentBiggestWidth < pageNumber.scrollWidth)
          currentBiggestWidth = pageNumber.scrollWidth;
      }
      this.pageNumberWidth = `${currentBiggestWidth}px`;
      this.changeDetector.detectChanges();
    }
  }

  gotoNextPage(): void {
    const nextPage = this.currentPage + 1;
    const pageNoLowerLimit = 1;
    if (
      this.isInclusivelyWithinRange(nextPage, this.totalPages, pageNoLowerLimit)
    ) {
      this.currentPage = nextPage;
      this.pageNumbers = this.paginate(
        nextPage,
        this.totalPages,
        this.noOfPagesVisible
      );

      if (this.onPageChange) this.onPageChange.emit(nextPage);
    }
  }

  gotoPreviousPage(): void {
    const previousPage = this.currentPage - 1;
    const pageNoLowerLimit = 1;
    if (
      this.isInclusivelyWithinRange(
        previousPage,
        this.totalPages,
        pageNoLowerLimit
      )
    ) {
      this.currentPage = previousPage;
      this.pageNumbers = this.paginate(
        previousPage,
        this.totalPages,
        this.noOfPagesVisible
      );

      if (this.onPageChange) this.onPageChange.emit(previousPage);
    }
  }

  gotoPage(pageNo: PageNo): void {
    this.currentPage = pageNo;
    this.pageNumbers = this.paginate(
      pageNo,
      this.totalPages,
      this.noOfPagesVisible
    );

    if (this.onPageChange) this.onPageChange.emit(pageNo);
  }

  paginate(
    currentPage: number,
    totalPages: number,
    noOfPageVisible: number
  ): PageNo[] {
    if (totalPages < 1) totalPages = 1;
    const pageNoLowerLimit = 1;

    if (
      !this.isInclusivelyWithinRange(currentPage, totalPages, pageNoLowerLimit)
    )
      throw Error("'currentPage' is out of bounds.'");

    if (totalPages === 1) return [1];
    if (totalPages === 2) return [1, 2];

    //prevent noOfPageVisible from going out of bounds
    //min is 3 because 1 and 2 will result in navigational problem navigational problems
    noOfPageVisible = this.clamp(noOfPageVisible, totalPages, 3);

    let pageNums = [];
    let rightCounter = currentPage + 1;
    let leftCounter = currentPage;

    while (true) {
      if (pageNums.length >= noOfPageVisible) break;
      if (leftCounter >= pageNoLowerLimit) pageNums.unshift(leftCounter--);
      if (pageNums.length >= noOfPageVisible) break;
      if (rightCounter <= totalPages) pageNums.push(rightCounter++);
    }

    return pageNums;
  }

  private clamp(entry: number, max: number, min: number): number {
    for (let argument of arguments)
      if (!Number.isInteger(argument))
        throw Error('Arguments must be an integer.');

    return Math.max(min, Math.min(entry, max));
  }

  private isInclusivelyWithinRange(
    entry: number,
    max: number,
    min: number
  ): boolean {
    return entry <= max && entry >= min;
  }
}
