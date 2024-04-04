import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoPlayerComponent } from './video-player.component';
import movies from '../../../assets/mock-data/movies.json';
import { By } from '@angular/platform-browser';

describe('VideoPlayerComponent', () => {
  let component: VideoPlayerComponent;
  let fixture: ComponentFixture<VideoPlayerComponent>;
  const videoSrcs = movies[0].videoSrc;
  let document: jasmine.SpyObj<Document>;

  beforeEach(async () => {
    document = jasmine.createSpyObj('Document', ['exitFullscreen']);

    await TestBed.configureTestingModule({
      imports: [VideoPlayerComponent],
      providers: [{ provide: Document, useValue: document }],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('updateTimeDisplay', () => {
    it('should update the display time equivalent to video current time', () => {
      const startCurrentTime = component.timeDisplay.slice(0, 5);
      expect(startCurrentTime).toBe('00:00');

      (
        fixture.debugElement.query(By.css('video'))
          .nativeElement as HTMLVideoElement
      ).currentTime = 3599;

      component.updateTimeDisplay();
      fixture.detectChanges();

      const newCurrentTime = component.timeDisplay.slice(0, 5);
      expect(newCurrentTime).toBe('59:59');
    });

    it('should make the single digit into two digits format', () => {
      const startCurrentTime = component.timeDisplay.slice(0, 5);
      expect(startCurrentTime).toBe('00:00');

      (
        fixture.debugElement.query(By.css('video'))
          .nativeElement as HTMLVideoElement
      ).currentTime = 61;

      component.updateTimeDisplay();
      fixture.detectChanges();

      const newCurrentTime = component.timeDisplay.slice(0, 5);
      expect(newCurrentTime).toBe('01:01');
    });

    it('should display the hour if hour is not zero', () => {
      const startCurrentTime = component.timeDisplay.slice(0, 5);
      expect(startCurrentTime).toBe('00:00');

      (
        fixture.debugElement.query(By.css('video'))
          .nativeElement as HTMLVideoElement
      ).currentTime = 3600;

      component.updateTimeDisplay();
      fixture.detectChanges();

      const newCurrentTime = component.timeDisplay.slice(0, 8);
      expect(newCurrentTime).toBe('01:00:00');
    });

    //find a way to test duration
    // it('should update video duration', () => {
    //   component.videos = videoSrcs;
    //   component.defaultVideoIndex = 0;

    //   fixture.detectChanges();
    //   component.updateTimeDisplay();
    //   fixture.detectChanges();

    //   console.log(component.timeDisplay);
    // });
  });

  describe('updateProgressBar', () => {
    it('should update progress bar value to match the current time', () => {
      const durationInMillisec = 3600;
      const halfOfDurationInMin = 1800 / 1000;
      component.duration = durationInMillisec;

      expect(
        parseInt(
          (
            fixture.debugElement.query(By.css('.progress-bar'))
              .nativeElement as HTMLInputElement
          ).value
        )
      ).toBe(0);

      (
        fixture.debugElement.query(By.css('video'))
          .nativeElement as HTMLVideoElement
      ).currentTime = halfOfDurationInMin;
      component.updateProgressBar();
      fixture.detectChanges();

      expect(
        parseInt(
          (
            fixture.debugElement.query(By.css('.progress-bar'))
              .nativeElement as HTMLInputElement
          ).value
        )
      ).toBe(component.currentTime);

      //result is nan becuse video.duration is undefined , find a way to set duration
      // expect(component.currentTimeInPercentage).toBe(
      //   (component.currentTime / component.duration) * 100
      // );
    });
  });

  describe('toggleFullScreen', () => {
    // it('should exit fullscreen mode if on fullscreen', async () => {
    //   spyOn(component.videoPlayer.nativeElement, 'requestFullscreen');
    //   //fix this
    //   await component.toggleFullScreen();
    //   fixture.detectChanges();
    //   await component.toggleFullScreen();

    //   expect(document.exitFullscreen).toHaveBeenCalled();
    // });

    it('should enter fullscreen mode if not on fullscreen', async () => {
      spyOn(component.videoPlayer.nativeElement, 'requestFullscreen');
      await component.toggleFullScreen();

      expect(
        component.videoPlayer.nativeElement.requestFullscreen
      ).toHaveBeenCalled();
    });
  });

  // describe('togglePlayPause', () => {
  //   it('should play video if video is on not playing', () => {});
  //   it('should pause video if video is  playing', () => {});
  // });

  // describe('togglePlayPause', () => {
  //   it('should play video if video is on not playing', () => {});
  //   it('should pause video if video is  playing', () => {});
  //   it('should focus play button', () => {});
  // });

  // describe('onVideoEnd', () => {
  //   it('should reset the video variables', () => {});
  // });

  // describe('toggleMuteUnmute', () => {
  //   it('should mute video video if it is unmute', () => {});

  //   it('should unmute video if video mute', () => {});
  // });

  // describe('onVolumeChange', () => {
  //   it('should adjust volume base on volume slider', () => {});
  // });

  // describe('onVideoQualityChange', () => {
  //   it('should change videoQuality', () => {});
  // });

  // describe('onDurationChange', () => {
  //   it('should set the total duration of a video', () => {});
  // });

  // describe('onBufferProgressUpdate', () => {
  //   it('should set the buffer progress', () => {});
  //   it('should buffer progress display width should be 100% by default', () => {});
  // });

  // describe('onProgressBarValueChange', () => {
  //   it('should update time display', () => {});
  //   it('should call update progress bar', () => {});
  //   it('shoud match the current time value of progress bar and video', () => {});
  // });

  // describe('onFullScreenChange', () => {
  //   it('should hide the controller on fullscreen', () => {});
  //   it('should show the controller if not on fullscreen', () => {});
  // });

  // describe('onMouseMove', () => {
  //   it('should show the controller on mousemove on fullscreen', () => {});
  //   it('should hide the controller after mousemove on fullscreen after debounce time', () => {});
  // });

  // describe('onVideoSrcChange', () => {
  //   it('should stop the video', () => {});
  //   it('should reset time display', () => {});
  //   it('should reset progressbar', () => {});
  //   it('should maintain the playbackrate', () => {});
  // });

  // describe('video-settings', () => {
  //   it('openSettings should open the main settings and close other settings menu', () => {});
  //   it('closeSettings should close all the menu settings', () => {});
  //   it('openPlayback should open the playbackrate menu and close other settings menu', () => {});
  //   it('openQualityMenu should open the quality menu and close other settings menu', () => {});
  // });

  // describe('setPlaybackRate', () => {
  //   it('should set the playback rate of the video', () => {});
  // });
});
