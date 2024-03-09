import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationComponent } from './pagination.component';
import { By } from '@angular/platform-browser';
import { LogService } from '../../services/log/log.service';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Initialiation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should handle error if pagination fails', () => {
      const logServiceError = spyOn(LogService, 'error');
      spyOn(component, 'paginate').and.throwError(
        new Error('Failed to paginate.')
      );
      component.ngOnInit();

      expect(logServiceError).toHaveBeenCalled();
    });

    it('should define currentPage to defaultCurrentPage', () => {
      const defaultCurrentPage = 1;

      expect(component.currentPage).toBe(defaultCurrentPage);
    });

    it('should define pageNumbers', () => {
      expect(component.pageNumbers.length).toBeDefined;
      expect(Array.isArray(component.pageNumbers)).toBeTruthy();
    });

    it('setEqualWidthsBasedOnMaxPageNumberWidth should make all pageNumbers have the same width', () => {
      component.pageNumbers = [1, 100, 10000];
      component.currentPage = 100;
      component.setEqualWidthsBasedOnMaxPageNumberWidth();
      fixture.detectChanges();

      const pageNumbers = fixture.debugElement.queryAll(By.css('.page-number'));

      let firstPageNumberWidth!: number;
      for (const pageNumber of pageNumbers) {
        if (!firstPageNumberWidth)
          firstPageNumberWidth = pageNumber.nativeElement.scrollWidth;
        else
          expect(pageNumber.nativeElement.scrollWidth).toBe(
            firstPageNumberWidth
          );
      }
    });

    it('should call the setEqualWidthsBasedOnMaxPageNumberWidth', () => {
      const setEqualWidthsBasedOnMaxPageNumberWidth = spyOn(
        component,
        'setEqualWidthsBasedOnMaxPageNumberWidth'
      );
      component.ngAfterViewInit();

      expect(setEqualWidthsBasedOnMaxPageNumberWidth).toHaveBeenCalled();
    });
  });

  describe('Input changes', () => {
    it('should handle error if repagination fails', () => {
      const logServiceError = spyOn(LogService, 'error');
      spyOn(component, 'paginate').and.throwError(
        new Error('Failed to paginate.')
      );
      component.ngOnChanges({});

      expect(logServiceError).toHaveBeenCalled();
    });

    it('should handle error if repagination fails', () => {
      const logServiceError = spyOn(LogService, 'error');
      spyOn(component, 'paginate').and.throwError(
        new Error('Failed to paginate.')
      );
      component.ngOnChanges({});

      expect(logServiceError).toHaveBeenCalled();
    });

    it('should reset pageNumbers', () => {
      component.ngOnChanges({});

      expect(component.pageNumbers.length).toBeDefined;
      expect(Array.isArray(component.pageNumbers)).toBeTruthy();
    });

    it('should call the setEqualWidthsBasedOnMaxPageNumberWidth', () => {
      const setEqualWidthsBasedOnMaxPageNumberWidth = spyOn(
        component,
        'setEqualWidthsBasedOnMaxPageNumberWidth'
      );
      component.ngOnChanges({});

      expect(setEqualWidthsBasedOnMaxPageNumberWidth).toHaveBeenCalled();
    });
  });

  describe('Page change related methods behavior', () => {
    beforeEach(() => {
      component.pageNumbers = [1, 2, 3];
      component.totalPages = 3;
    });

    it('should always have a class current-page', () => {
      component.currentPage = 1;
      fixture.detectChanges();

      const currentPage = fixture.debugElement.query(By.css('.current-page'));

      expect(currentPage).not.toBeNull();
      expect(parseInt(currentPage.nativeElement.textContent)).toBe(
        component.currentPage
      );
    });

    it('gotoNextPage should increment the currentPage', () => {
      component.currentPage = 1;

      component.gotoNextPage();

      expect(component.currentPage).toBe(component.pageNumbers[1]);
    });

    it('gotoNextPage should not increment the page if currentPage is the last page', () => {
      component.currentPage = 3;

      component.gotoNextPage();

      expect(component.currentPage).toBe(component.pageNumbers[2]);
    });

    it('gotoPreviousPage should decrement the currentPage', () => {
      component.currentPage = 2;

      component.gotoPreviousPage();

      expect(component.currentPage).toBe(component.pageNumbers[0]);
    });

    it('gotoPreviousPage should not decrement the currentPage if the currentPage is the first page', () => {
      component.currentPage = 1;

      component.gotoPreviousPage();

      expect(component.currentPage).toBe(component.pageNumbers[0]);
    });

    it('gotoPage should set the currentPage to passed page number', () => {
      component.currentPage = 1;

      component.gotoPage(3);

      expect(component.currentPage).toBe(component.pageNumbers[2]);
    });

    describe('onPageChange event', () => {
      let onPageChange: jasmine.Spy;

      beforeEach(() => {
        onPageChange = spyOn(component.onPageChange, 'emit');
      });

      it('should be called by gotoPreviousPage if it is defined', () => {
        component.currentPage = 2;

        component.gotoPreviousPage();

        expect(onPageChange).toHaveBeenCalled();
      });

      it('should be called by gotoNextPage if it is defined', () => {
        component.currentPage = 1;

        component.gotoNextPage();

        expect(onPageChange).toHaveBeenCalled();
      });

      it('should be called by gotoPage if it is defined', () => {
        component.currentPage = 1;

        component.gotoPage(3);

        expect(onPageChange).toHaveBeenCalled();
      });
    });
  });

  describe('Visibility', () => {
    beforeEach(() => {
      component.totalPages = 1;
      component.currentPage = 1;
    });

    it('should not be visible if there is only a single page', () => {
      component.pageNumbers = [1];
      fixture.detectChanges();

      const paginationComponent = fixture.debugElement.query(
        By.css('.pagination')
      );

      expect(paginationComponent).toBeNull();
    });

    it('should be visible if pages is more than one', () => {
      component.pageNumbers = [1, 2];
      fixture.detectChanges();

      const paginationComponent = fixture.debugElement.query(
        By.css('.pagination')
      );

      expect(paginationComponent).not.toBeNull();
    });
  });

  describe('paginate method behavior', () => {
    let currentPage: number, totalPages: number, noOfPagesVisible: number;

    beforeEach(() => {
      currentPage = 1;
      totalPages = 3;
      noOfPagesVisible = 3;
    });

    it('noOfPageVisible argument should set how many page numbers should be returned', () => {
      const pages = component.paginate(
        currentPage,
        totalPages,
        noOfPagesVisible
      );

      expect(pages.length).toBe(noOfPagesVisible);
    });

    it("noOfPageVisible argument should clamp to minimum if it's set less than the the minimum", () => {
      const minimumNoOfPagesVisible = 3;
      totalPages = 5;
      noOfPagesVisible = 2;

      const pages = component.paginate(
        currentPage,
        totalPages,
        noOfPagesVisible
      );

      expect(pages.length).toBe(minimumNoOfPagesVisible);
    });

    it("noOfPageVisible argument should be clamp to totalPages if it's more than the maximum totalPages argument", () => {
      noOfPagesVisible = 8;

      const pages = component.paginate(
        currentPage,
        totalPages,
        noOfPagesVisible
      );

      expect(pages.length).toBe(totalPages);
    });

    it('should throw an error if currentPage argument is less than minimum 1', () => {
      currentPage = -1;

      try {
        component.paginate(currentPage, totalPages, noOfPagesVisible);
      } catch (error) {
        expect(error).toMatch('out of bounds');
      }
    });

    it('should throw an error if currentPage argument is more than the totalPages argument', () => {
      currentPage = 4;

      try {
        component.paginate(currentPage, totalPages, noOfPagesVisible);
      } catch (error) {
        expect(error).toMatch('out of bounds');
      }
    });

    it('should override totalPages argument to 1 if totalPages is less than 1', () => {
      totalPages = -1;

      expect(
        component.paginate(currentPage, totalPages, noOfPagesVisible).length
      ).toBe(1);
    });

    it('should place currentPage argument at the center of the returned array when noOfPagesVisible is odd and currentPage allows space for adjacent page numbers within the total range', () => {
      currentPage = 5;
      totalPages = 9;
      noOfPagesVisible = 5;

      expect(
        component.paginate(currentPage, totalPages, noOfPagesVisible)[2]
      ).toBe(currentPage);
    });

    it('should place currentPage argument last of the first half of the returned array when noOfPagesVisible is even and currentPage allows space for adjacent page numbers within the total range', () => {
      currentPage = 5;
      totalPages = 9;
      noOfPagesVisible = 4;

      expect(
        component.paginate(currentPage, totalPages, noOfPagesVisible)[1]
      ).toBe(currentPage);
    });

    it('should place currentPage argument at the last index of the array if currentPage is at the last page', () => {
      currentPage = 9;
      totalPages = 9;
      noOfPagesVisible = 5;

      expect(
        component.paginate(currentPage, totalPages, noOfPagesVisible)[
          noOfPagesVisible - 1
        ]
      ).toBe(currentPage);
    });

    it('should place currentPage argument at the first index of the array if currentPage is at the first page ', () => {
      totalPages = 9;
      noOfPagesVisible = 5;

      expect(
        component.paginate(currentPage, totalPages, noOfPagesVisible)[0]
      ).toBe(currentPage);
    });
  });
});
