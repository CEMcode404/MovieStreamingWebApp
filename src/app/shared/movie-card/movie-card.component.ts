import {
  AfterViewInit,
  Component,
  ChangeDetectorRef,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Movie } from '../../services/movies/movies.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'movie-card',
  standalone: true,
  imports: [],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() movieCardData!: Movie;
  @ViewChild('movieCard', { static: false }) myElementRef!: ElementRef;
  private resize$ = new Subject<void>();
  private destroy$ = new Subject<void>();
  isTitleOverflowing = false;

  constructor(private changeRef: ChangeDetectorRef) {}
  ngOnInit(): void {
    this.resize$
      .pipe(debounceTime(200), takeUntil(this.destroy$))
      .subscribe(() => {
        this.evaluateTitleWidthAndSetIsTitleOverflowingFlag();
      });
  }

  ngAfterViewInit(): void {
    this.evaluateTitleWidthAndSetIsTitleOverflowingFlag();
    this.changeRef.detectChanges();
  }

  private evaluateTitleWidthAndSetIsTitleOverflowingFlag(): void {
    const parentElement = this.myElementRef.nativeElement;
    const childElement = parentElement.querySelector('a');
    if (!this.isTitleWidthFitWithinParentWidth(parentElement, childElement))
      this.isTitleOverflowing = true;
    else this.isTitleOverflowing = false;
  }

  private isTitleWidthFitWithinParentWidth(
    parentElement: HTMLElement,
    childElement: HTMLElement
  ): boolean {
    return parentElement.offsetWidth >= childElement.scrollWidth;
  }

  onResize(): void {
    this.resize$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
