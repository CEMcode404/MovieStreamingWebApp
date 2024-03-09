import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Hero, HeroesService } from '../../../services/heroes/heroes.service';
import { Subscription, interval } from 'rxjs';
import { LogService } from '../../../services/log/log.service';

@Component({
  selector: 'hero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements OnInit, OnDestroy {
  displayedHeroIndex = 0;
  heroes: Hero[] = [];
  private intervalSubscription: Subscription | undefined;

  constructor(
    private hostElement: ElementRef,
    private heroesService: HeroesService,
    private zone: NgZone
  ) {}

  async ngOnInit(): Promise<void> {
    this.startHeroRotation(5000);

    try {
      this.heroes = await this.heroesService.getHeroes();
    } catch (error) {
      LogService.error(error);
    }
  }

  ngOnDestroy(): void {
    this.stopHeroRotation();
  }

  startHeroRotation(speed: number) {
    this.zone.runOutsideAngular(() => {
      this.intervalSubscription = interval(speed).subscribe(() => {
        this.slideToNextHero();
      });
    });
  }

  private slideToNextHero() {
    this.displayedHeroIndex >= this.heroes.length - 1
      ? this.zone.run(() => {
          this.displayedHeroIndex = 0;
        })
      : this.zone.run(() => {
          this.displayedHeroIndex++;
        });

    this.slideToHero(this.displayedHeroIndex);
  }

  stopHeroRotation() {
    if (this.intervalSubscription) this.intervalSubscription.unsubscribe();
  }

  private slideToHero(index: number) {
    const heroContainers = this.hostElement.nativeElement.querySelectorAll(
      '.hero-img-container'
    );

    for (let heroContainer of heroContainers)
      heroContainer.style.setProperty('--hero-index', index);
  }

  handleRadioBttnsClick(e: any) {
    const heroIndex = e.target.value;
    this.displayedHeroIndex = heroIndex;

    this.slideToHero(heroIndex);
  }
}
