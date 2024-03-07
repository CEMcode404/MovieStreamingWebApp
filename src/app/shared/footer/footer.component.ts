import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements AfterViewInit, OnInit, OnDestroy {
  height!: string;
  @ViewChild('footer', { static: false }) myElementRef!: ElementRef;
  private _resize$ = new Subject<void>();
  private _destroy$ = new Subject<void>();

  constructor(private changeDetection: ChangeDetectorRef) {}

  ngOnInit(): void {
    this._resize$
      .pipe(debounceTime(100), takeUntil(this._destroy$))
      .subscribe(() => {
        this.resizeFooterHeighBaseOnContent();
      });
  }

  ngAfterViewInit(): void {
    this.resizeFooterHeighBaseOnContent();
    this.changeDetection.detectChanges();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  private resizeFooterHeighBaseOnContent() {
    const footerBox =
      this.myElementRef.nativeElement.querySelector('.footer-box');
    this.height = `${footerBox.scrollHeight * 1.5}px`;
  }

  onResize() {
    this._resize$.next();
  }
}
