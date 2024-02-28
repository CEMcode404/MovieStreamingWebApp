import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LogService } from '../../services/log/log.service';

type PageNo = number;
type PageNumberChange = (pageNo: PageNo) => void | undefined;

@Component({
  selector: 'pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent implements AfterViewInit, OnInit {
  @ViewChild('pagination', { static: false }) myElementRef!: ElementRef;
  @Input() totalPages: number = 100;
  @Input() noOfPagesVisible: number = 5;
  @Input() onPageChange!: PageNumberChange;
  currentPage = 1;
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

  setEqualWidthsBasedOnMaxPageNumberWidth(): void {
    const pageNumbers =
      this.myElementRef.nativeElement.querySelectorAll('.page-number');
    let currentBiggestWidth;

    for (let pageNumber of pageNumbers) {
      if (!currentBiggestWidth) currentBiggestWidth = pageNumber.scrolltWidth;
      else if (currentBiggestWidth < pageNumber.scrolltWidth)
        currentBiggestWidth = pageNumber.scrollWidth;
    }

    for (let pageNumber of pageNumbers)
      this.pageNumberWidth = `${pageNumber.scrollWidth}px`;

    this.changeDetector.detectChanges();
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

      if (this.onPageChange) this.onPageChange(nextPage);
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

      if (this.onPageChange) this.onPageChange(previousPage);
    }
  }

  gotoPage(pageNo: PageNo): void {
    this.currentPage = pageNo;
    this.pageNumbers = this.paginate(
      pageNo,
      this.totalPages,
      this.noOfPagesVisible
    );

    if (this.onPageChange) this.onPageChange(pageNo);
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
