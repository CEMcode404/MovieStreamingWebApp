import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';

import { VideoPlayerComponent } from './video-player.component';
import movies from '../../../assets/mock-data/movies.json';
import { By } from '@angular/platform-browser';

describe('VideoPlayerComponent', () => {
  let component: VideoPlayerComponent;
  let fixture: ComponentFixture<VideoPlayerComponent>;
  const videoSrcs = movies[0].videoSrc;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoPlayerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function getVideoElement(): HTMLVideoElement {
    return fixture.debugElement.query(By.css('video')).nativeElement;
  }

  describe('updateTimeDisplay', () => {
    it('should update the display time equivalent to video current time', () => {
      const startCurrentTime = component.timeDisplay.slice(0, 5);
      expect(startCurrentTime).toBe('00:00');

      getVideoElement().currentTime = 3599;

      component.updateTimeDisplay();
      fixture.detectChanges();

      const newCurrentTime = component.timeDisplay.slice(0, 5);
      expect(newCurrentTime).toBe('59:59');
    });

    it('should make the single digit into two digits format', () => {
      const startCurrentTime = component.timeDisplay.slice(0, 5);
      expect(startCurrentTime).toBe('00:00');

      getVideoElement().currentTime = 61;

      component.updateTimeDisplay();
      fixture.detectChanges();

      const newCurrentTime = component.timeDisplay.slice(0, 5);
      expect(newCurrentTime).toBe('01:01');
    });

    it('should display the hour if hour is not zero', () => {
      const startCurrentTime = component.timeDisplay.slice(0, 5);
      expect(startCurrentTime).toBe('00:00');

      getVideoElement().currentTime = 3600;

      component.updateTimeDisplay();
      fixture.detectChanges();

      const newCurrentTime = component.timeDisplay.slice(0, 8);
      expect(newCurrentTime).toBe('01:00:00');
    });
  });

  it('updateProgressBar should update progress bar value to match the current time', () => {
    const durationInMillisec = 3600;
    const halfOfDurationInMin = 1800 / 1000;
    component.duration = durationInMillisec;

    expect(parseInt(getProgressBar().value)).toBe(0);
    getVideoElement().currentTime = halfOfDurationInMin;
    component.updateProgressBar();
    fixture.detectChanges();

    expect(parseInt(getProgressBar().value)).toBe(component.currentTime);
  });

  function getProgressBar(): HTMLInputElement {
    return fixture.debugElement.query(By.css('.progress-bar')).nativeElement;
  }

  describe('toggleFullScreen', () => {
    beforeEach(() => {
      spyOn(component.videoPlayer.nativeElement, 'requestFullscreen');
    });

    it('should exit fullscreen mode if on fullscreen', async () => {
      spyOn(document, 'exitFullscreen');
      spyOn(component, 'isVideoInFullscreen').and.returnValue(true);

      await component.toggleFullScreen();

      expect(document.exitFullscreen).toHaveBeenCalled();
    });

    it('should enter fullscreen mode if not on fullscreen', async () => {
      await component.toggleFullScreen();

      expect(
        component.videoPlayer.nativeElement.requestFullscreen
      ).toHaveBeenCalled();
    });
  });

  describe('togglePlayPause', () => {
    it('should play video if video is not playing', () => {
      const videoElement = getVideoElement();
      spyOn(videoElement, 'play');

      component.togglePlayPause();

      expect(videoElement.play).toHaveBeenCalled();
      expect(component.isPlaying).toBeTrue();
    });

    it('should pause video if video is playing', () => {
      component.isPlaying = true;
      const videoElement = getVideoElement();
      spyOn(videoElement, 'pause');

      component.togglePlayPause();

      expect(videoElement.pause).toHaveBeenCalled();
      expect(component.isPlaying).toBeFalse();
    });

    it('should focus play button', () => {
      const videoElement = getVideoElement();
      const playButton = fixture.debugElement.query(
        By.css('.play-pause-button')
      ).nativeElement as HTMLButtonElement;
      spyOn(videoElement, 'play');
      spyOn(playButton, 'focus');

      component.togglePlayPause();

      expect(playButton.focus).toHaveBeenCalled();
    });
  });

  describe('toggleMuteUnmute', () => {
    it('should mute video if it is unmute', () => {
      component.toggleMuteUnmute();

      expect(component.isMute).toBeTrue();
    });

    it('should unmute video if video mute', () => {
      component.isMute = true;

      component.toggleMuteUnmute();

      expect(component.isMute).toBeFalse();
    });
  });

  describe('on* handlers', () => {
    it('onVideoEnd should reset the video variables', () => {
      component.isPlaying = true;
      getVideoElement().dispatchEvent(new Event('ended'));

      expect(component.isPlaying).toBeFalse();
    });

    it('onVolumeChange should adjust volume base on volume slider', () => {
      const mockEvent = {
        target: {
          value: '50',
        },
      } as unknown as Event;

      component.onVolumeChange(mockEvent);

      expect(component.volume).toBe(50);
    });

    it('onVideoQualityChange should change videoQuality', () => {
      component.videos = videoSrcs;
      const newVideoQuality = videoSrcs[1].quality;
      component.currentVideoQuality = videoSrcs[0].quality;

      component.onVideoQualityChange(1);

      expect(component.currentVideoQuality).toBe(newVideoQuality);
      expect(component.defaultVideoIndex).toBe(1);
    });

    describe('onProgressBarValueChange', () => {
      const mockEvent = {
        target: {
          value: '1000',
        },
      } as unknown as Event;

      it('should update time display', () => {
        spyOn(component, 'updateTimeDisplay');

        component.onProgressBarValueChange(mockEvent);

        expect(component.updateTimeDisplay).toHaveBeenCalled();
      });

      it('should call update progress bar', () => {
        spyOn(component, 'updateProgressBar');

        component.onProgressBarValueChange(mockEvent);

        expect(component.updateProgressBar).toHaveBeenCalled();
      });
    });

    describe('onFullScreenChange', () => {
      it('should hide the controller on fullscreen', () => {
        component.isControllerVisible = true;
        spyOn(component, 'isVideoInFullscreen').and.returnValue(true);

        component.onFullScreenChange();

        expect(component.isControllerVisible).toBeFalse();
      });

      it('should show the controller if not on fullscreen', () => {
        component.isControllerVisible = false;
        spyOn(component, 'isVideoInFullscreen').and.returnValue(false);

        component.onFullScreenChange();

        expect(component.isControllerVisible).toBeTrue();
      });
    });

    describe('onMouseMove', () => {
      beforeEach(() => {
        component.isControllerVisible = false;
        spyOn(component, 'isVideoInFullscreen').and.returnValue(true);
      });

      it('should show the controller on mousemove on fullscreen', () => {
        component.onMouseMove();

        expect(component.isControllerVisible).toBeTrue();
      });

      it('should hide the controller after mousemove on fullscreen after debounce time', fakeAsync(() => {
        const defaultDebounceTimeInMilliSec = 3000;

        component.onMouseMove();

        expect(component.isControllerVisible).toBeTrue();
        tick(defaultDebounceTimeInMilliSec);
        expect(component.isControllerVisible).toBeFalse();
      }));
    });

    describe('onVideoSrcChange', () => {
      it('should change the video playing state', () => {
        component.isPlaying = true;
        component.onVideoSrcChange();

        expect(component.isPlaying).toBeFalse();
      });

      it('should reset time display', () => {
        spyOn(component, 'updateTimeDisplay');
        component.onVideoSrcChange();

        expect(component.updateTimeDisplay).toHaveBeenCalled();
      });

      it('should reset progressbar', () => {
        spyOn(component, 'updateProgressBar');
        component.onVideoSrcChange();

        expect(component.updateProgressBar).toHaveBeenCalled();
      });

      it('should maintain the playbackrate', () => {
        spyOn(component, 'setPlaybackRate');
        component.onVideoSrcChange();

        expect(component.setPlaybackRate).toHaveBeenCalled();
      });
    });
  });

  describe('video-settings', () => {
    beforeEach(() => {
      component.isSettingsMenuOpen = true;
      component.isPlaybackSpeedMenuOpen = true;
      component.isQualityMenuOpen = true;
    });

    it('openSettingsMenu should open the main settings and close other settings menu', () => {
      component.openSettingsMenu();

      expect(component.isSettingsMenuOpen).toBeTrue();
      expect(component.isPlaybackSpeedMenuOpen).toBeFalse();
      expect(component.isQualityMenuOpen).toBeFalse();
    });

    it('closeSettingsMenu should close all the menu settings', () => {
      component.closeSettingsMenu();

      expect(component.isSettingsMenuOpen).toBeFalse();
      expect(component.isPlaybackSpeedMenuOpen).toBeFalse();
      expect(component.isQualityMenuOpen).toBeFalse();
    });

    it('openPlaybackMenu should open the playbackrate menu and close other settings menu', () => {
      component.openPlaybackMenu();

      expect(component.isSettingsMenuOpen).toBeFalse();
      expect(component.isPlaybackSpeedMenuOpen).toBeTrue();
      expect(component.isQualityMenuOpen).toBeFalse();
    });

    it('openVideoQualityMenu should open the quality menu and close other settings menu', () => {
      component.openVideoQualityMenu();

      expect(component.isSettingsMenuOpen).toBeFalse();
      expect(component.isPlaybackSpeedMenuOpen).toBeFalse();
      expect(component.isQualityMenuOpen).toBeTrue();
    });
  });

  it('setPlaybckRate should set the playback rate of the video', () => {
    const newPlaybackRate = 2;
    component.currentPlaybackRate = 1;

    component.setPlaybackRate(newPlaybackRate);
    fixture.detectChanges();

    expect(getVideoElement().playbackRate).toBe(newPlaybackRate);
    expect(component.currentPlaybackRate).toBe(newPlaybackRate);
  });
});
