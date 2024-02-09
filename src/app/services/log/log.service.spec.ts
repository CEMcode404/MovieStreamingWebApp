import { TestBed } from '@angular/core/testing';

import { LogService } from './log.service';

describe('LogService', () => {
  let service: LogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('error static method should log the error', () => {
    const consoleLog = spyOn(console, 'log');

    LogService.error('An Error ocurred');

    expect(consoleLog).toHaveBeenCalled();
  });

  it('error static method should log default error message if no error message is passed', () => {
    const consoleLog = spyOn(console, 'log');

    LogService.error();

    expect(consoleLog).toHaveBeenCalled();
  });
});
