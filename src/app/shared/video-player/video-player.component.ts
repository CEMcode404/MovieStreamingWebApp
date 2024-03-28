import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { SettingsMenuComponent } from './settings-menu/settings-menu.component';

export interface Video {
  quality: string;
  src: string;
  type: string;
}

@Component({
  selector: 'video-player',
  standalone: true,
  imports: [CommonModule, SettingsMenuComponent],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent implements AfterViewInit, OnDestroy {
  @Input() videos!: Video[];
  @Input() defaultVideoIndex!: number;
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef;
  isPlaying = false;
  currentTime = 0;
  currentTimeInPercentage = 0;
  currentPlaybackRate = 1;
  currentVideoQuality = 'HD';
  timeDisplay = '00:00 / 00:00';

  volume = 100;
  maxVolume = 100;
  isMute = false;
  duration = 0;
  bufferProgress = 100;
  isControllerVisible = true;
  isSettingsOpen = false;
  isPlaybackSpeedOpen = false;
  isQualityMenuOpen = false;
  playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  private hideControllerDebouncer = new CustomDebounce(3000);
  private _videoPlayer!: VideoPlayer;
  private _settingsDropDownStates = new OneTrueAllFalseState(
    [
      new State(
        'CloseAll',
        () => {
          this.isSettingsOpen = false;
          this.isPlaybackSpeedOpen = false;
        },
        () => {}
      ),
      new State(
        'Settings',
        () => {
          this.isSettingsOpen = true;
        },
        () => {
          this.isSettingsOpen = false;
        }
      ),
      new State(
        'PlaybackSpeed',
        () => {
          this.isPlaybackSpeedOpen = true;
        },
        () => {
          this.isPlaybackSpeedOpen = false;
        }
      ),
      new State(
        'Quality',
        () => {
          this.isQualityMenuOpen = true;
        },
        () => {
          this.isQualityMenuOpen = false;
        }
      ),
    ],
    () => {
      this.isSettingsOpen = false;
      this.isPlaybackSpeedOpen = false;
      this.isQualityMenuOpen = false;
    }
  );

  ngAfterViewInit(): void {
    this._videoPlayer = new VideoPlayer(
      this.videoPlayer.nativeElement.querySelector('video')
    );

    this._videoPlayer.subscribeToTimeChanges('controls', () => {
      this.updateTimeDisplay();
      this.updateProgressBar();
    });
  }

  updateTimeDisplay() {
    const timeStrategy = new HourMinSecStrategy();
    this.timeDisplay = `${this._videoPlayer.getCurrentTime(
      timeStrategy
    )} / ${this._videoPlayer.getTotalDuration(timeStrategy)}`;
  }

  updateProgressBar() {
    this.currentTime = this._videoPlayer.getCurrentTime(
      new MilliSecondStrategy()
    );

    this.currentTimeInPercentage = this._videoPlayer.getCurrentTime(
      new PercentageStrategy()
    );
  }

  ngOnDestroy(): void {
    this._videoPlayer.clearAllSubscriptionToTimeChanges();
    this.hideControllerDebouncer.cancel();
  }

  toggleFullScreen(): void {
    this.isVideoInFullscreen()
      ? document.exitFullscreen()
      : (this.videoPlayer.nativeElement as HTMLElement).requestFullscreen();
  }

  private isVideoInFullscreen(): boolean {
    return !!document.fullscreenElement;
  }

  togglePlayPause(): void {
    if (this.isPlaying) {
      this._videoPlayer.pause();
      this.isPlaying = false;
    } else {
      this._videoPlayer.play();
      this.isPlaying = true;
    }

    this.videoPlayer.nativeElement.querySelector('.play-pause-button').focus();
  }

  onVideoEnded() {
    this.isPlaying = false;
    this._videoPlayer.resetVideoState();
  }

  toggleMuteUnmute() {
    this.isMute = !this.isMute;
  }

  onVolumeChange(event: Event) {
    const volume = parseInt((event.target as HTMLInputElement).value);
    this.volume = volume;
  }

  onVideoQualityChange(index: number) {
    this.defaultVideoIndex = index;
    this.currentVideoQuality = this.videos[this.defaultVideoIndex].quality;
  }

  onDurationChange() {
    //@ts-ignore
    // getTotalDuration returns a number but typechecker think it is returning null
    this.duration = this._videoPlayer.getTotalDuration(
      new MilliSecondStrategy()
    );
  }

  onBufferProgressUpdate() {
    const bufferPercentage = this._videoPlayer.getBufferProgress();
    //check if buffer equals 0 before resetting progress bar
    //video emit progress event with buffer 0 if the video is fetch in the cache
    if (bufferPercentage > 0) this.bufferProgress = bufferPercentage;
  }

  onProgressBarValueChange(event: Event) {
    const newCurrentTimeInMilliSec = parseInt(
      (event.target as HTMLInputElement).value
    );
    this._videoPlayer.setCurrentTimeInSec(newCurrentTimeInMilliSec / 1000);
    this.updateTimeDisplay();
    this.updateProgressBar();
  }

  onFullScreenChange() {
    if (this.isVideoInFullscreen()) {
      this.isControllerVisible = false;
    } else {
      this.hideControllerDebouncer.cancel();
      this.isControllerVisible = true;
    }
  }

  onMouseMove() {
    this.hideControllerDebouncer.cancel();
    if (!this.isVideoInFullscreen()) return;

    this.isControllerVisible = true;

    this.hideControllerDebouncer.debounce(() => {
      this.isControllerVisible = false;
    });
  }

  onVideoSrcChange() {
    this.isPlaying = false;
    this._videoPlayer.resetVideoState();
    this.updateTimeDisplay();
    this.updateProgressBar();
    this.setPlaybackRate(this.currentPlaybackRate);
  }

  openSettings() {
    this._settingsDropDownStates.setState('Settings');
  }

  closeSettings() {
    this._settingsDropDownStates.resetToDefaultState();
  }

  openPlayback() {
    this._settingsDropDownStates.setState('PlaybackSpeed');
  }

  openQualityMenu() {
    this._settingsDropDownStates.setState('Quality');
  }

  setPlaybackRate(rate: number) {
    this._videoPlayer.setPlaybackRate(rate);
    this.currentPlaybackRate = rate;
  }
}

class OneTrueAllFalseState {
  private stateMap: Map<string, State> = new Map();
  constructor(private states: State[], private defaultState?: () => void) {
    this.states.forEach((state) => {
      this.stateMap.set(state.getStateName(), state);
    });
  }

  setState(stateName: string) {
    if (!this.stateMap.has(stateName)) return;

    this.stateMap.forEach((state) => {
      state.getStateName() === stateName
        ? state.activeStateEffect()
        : state.inActiveStateEffect();
    });
  }

  resetToDefaultState() {
    if (this.defaultState) this.defaultState();
  }
}

class State {
  constructor(
    private stateName: string,
    private activeState: () => void,
    private inActiveState: () => void
  ) {}

  getStateName(): string {
    return this.stateName;
  }

  activeStateEffect(): void {
    this.activeState();
  }

  inActiveStateEffect(): void {
    this.inActiveState();
  }
}

class CustomDebounce {
  private timer: any;

  constructor(private delay: number) {}

  debounce(callback: () => void) {
    clearTimeout(this.timer);
    this.timer = setTimeout(callback, this.delay);
  }

  cancel() {
    clearTimeout(this.timer);
  }
}

class VideoPlayer {
  private tick = interval(25);
  private handlers: { [key: string]: () => any } = {};
  private tickSubscriptions: Subscription[] = [];
  private defaultVideoStrategy = new MilliSecondStrategy();

  constructor(private videoElement: HTMLVideoElement) {}

  getCurrentTime(timeStrategy?: VideoTimeStrategy) {
    if (!timeStrategy) timeStrategy = this.defaultVideoStrategy;
    return timeStrategy.getCurrentTime(this.videoElement);
  }

  getTotalDuration(timeStrategy?: VideoTimeStrategy): void {
    if (!timeStrategy) timeStrategy = this.defaultVideoStrategy;

    return timeStrategy.getTotalDuration(this.videoElement);
  }

  play(): void {
    this.videoElement.play();
    Object.values(this.handlers).forEach((handler) => {
      this.tickSubscriptions.push(this.tick.subscribe(handler));
    });
  }

  pause(): void {
    this.videoElement.pause();
    this.clearAllSubscriptionToTimeChanges();
  }

  setCurrentTimeInSec(time: number) {
    this.videoElement.currentTime = time;
  }

  setPlaybackRate(rate: number) {
    this.videoElement.playbackRate = rate;
  }

  subscribeToTimeChanges<T>(name: string, handler: () => T) {
    this.handlers[name] = handler;
  }

  resetVideoState() {
    this.clearAllSubscriptionToTimeChanges();
  }

  clearAllSubscriptionToTimeChanges() {
    this.tickSubscriptions.forEach((tickSubscription) => {
      tickSubscription.unsubscribe();
    });
  }

  getBufferProgress() {
    let bufferProgress = 0;
    const duration = this.videoElement.duration;
    if (duration > 0) {
      for (let i = 0; i < this.videoElement.buffered.length; i++) {
        if (
          this.videoElement.buffered.start(
            this.videoElement.buffered.length - 1
          ) < this.videoElement.currentTime
        ) {
          bufferProgress =
            (this.videoElement.buffered.end(
              this.videoElement.buffered.length - 1
            ) *
              100) /
            duration;
        }
      }
    }

    return bufferProgress;
  }
}

interface VideoTimeStrategy {
  getCurrentTime(videoElement: HTMLVideoElement): any;
  getTotalDuration(videoElement: HTMLVideoElement): any;
}

class PercentageStrategy implements VideoTimeStrategy {
  getCurrentTime(videoElement: HTMLVideoElement): number {
    return (
      (videoElement.currentTime / videoElement.duration) *
      this.getTotalDuration()
    );
  }
  getTotalDuration(): number {
    return 100;
  }
}

class MilliSecondStrategy implements VideoTimeStrategy {
  getCurrentTime(videoElement: HTMLVideoElement): number {
    return videoElement.currentTime * 1000;
  }

  getTotalDuration(videoElement: HTMLVideoElement): number {
    return videoElement.duration * 1000;
  }
}

class HourMinSecStrategy implements VideoTimeStrategy {
  getCurrentTime(videoElement: HTMLVideoElement) {
    const sec = Math.floor(videoElement.currentTime % 60);
    const min = Math.floor((videoElement.currentTime / 60) % 60);
    const hour = Math.floor(videoElement.currentTime / 60 / 60);

    return `${
      hour ? this.convertToTwoDigits(hour) + ':' : ''
    }  ${this.convertToTwoDigits(min)}:${this.convertToTwoDigits(sec)}`;
  }

  private convertToTwoDigits(number: number): string {
    return number < 10 ? `0${number}` : `${number}`;
  }

  getTotalDuration(videoElement: HTMLVideoElement) {
    if (!videoElement.duration) return '00:00';

    const sec = Math.floor(videoElement.duration % 60);
    const min = Math.floor((videoElement.duration / 60) % 60);
    const hour = Math.floor(videoElement.duration / 60 / 60);

    return `${
      hour ? this.convertToTwoDigits(hour) + ':' : ''
    }  ${this.convertToTwoDigits(min)}:${this.convertToTwoDigits(sec)}`;
  }
}
