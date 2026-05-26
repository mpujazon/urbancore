import { NgOptimizedImage } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, Subject, switchMap, tap } from 'rxjs';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CityContextService } from '../../../../core/services/city-context-service';
import { environment } from '../../../../../environments/environment';
import type { ResourceState } from '../../../../shared/models/resource-state.model';
import type { IncidentSummaryResponse } from '../../../public-statistics/models/public-statistics-dashboard.model';
import {
  EMPTY_INCIDENT_SUMMARY,
  INCIDENT_SUMMARY_ENDPOINT,
} from '../../../public-statistics/config/public-statistics-dashboard.config';

gsap.registerPlugin(ScrollTrigger);

interface StatCardData {
  value: number;
  label: string;
  subtitle: string;
  icon: string;
  accent: string;
  isDecimal: boolean;
}

@Component({
  selector: 'app-homepage',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Homepage {
  protected showSplash = signal(true);

  readonly splashLoader = viewChild<ElementRef<HTMLElement>>('splashLoader');
  readonly splashTitle = viewChild<ElementRef<HTMLElement>>('splashTitle');
  readonly splashSubtitle = viewChild<ElementRef<HTMLElement>>('splashSubtitle');
  readonly splashProgress = viewChild<ElementRef<HTMLElement>>('splashProgress');
  readonly splashTagline = viewChild<ElementRef<HTMLElement>>('splashTagline');
  readonly splashShapes = viewChildren<ElementRef<HTMLElement>>('splashShape');

  readonly heroElements = viewChildren<ElementRef<HTMLElement>>('heroAnimEl');

  readonly statCards = viewChildren<ElementRef<HTMLElement>>('statCard');
  readonly statNumbers = viewChildren<ElementRef<HTMLElement>>('statNumber');

  readonly processSection = viewChild.required<ElementRef<HTMLElement>>('processSection');
  readonly stepsTrack = viewChild.required<ElementRef<HTMLElement>>('stepsTrack');
  readonly scrollViewport = viewChild.required<ElementRef<HTMLElement>>('scrollViewport');
  readonly processCopy = viewChild.required<ElementRef<HTMLElement>>('processCopy');
  readonly scrollIndicator = viewChild<ElementRef<HTMLElement>>('scrollIndicator');
  readonly stepCards = viewChildren<ElementRef<HTMLElement>>('stepCard');
  readonly progressDots = viewChildren<ElementRef<HTMLElement>>('progressDot');

  private readonly http = inject(HttpClient);
  private readonly cityContext = inject(CityContextService);
  readonly destroyRef = inject(DestroyRef);

  private readonly summaryResource = signal<ResourceState<IncidentSummaryResponse>>({
    data: EMPTY_INCIDENT_SUMMARY,
    status: 'loading',
    error: null,
  });

  protected readonly summaryStatus = computed(() => this.summaryResource().status);
  protected readonly summaryError = computed(() => this.summaryResource().error);

  protected readonly statCardData = computed((): readonly StatCardData[] => {
    const s = this.summaryResource().data;
    return [
      {
        value: s.totalIncidents,
        label: 'Total Reports',
        subtitle: 'All submissions',
        icon: 'total',
        accent: '#3b82f6',
        isDecimal: false,
      },
      {
        value: s.resolvedIncidents,
        label: 'Resolved',
        subtitle: 'Successfully closed',
        icon: 'resolved',
        accent: '#22c55e',
        isDecimal: false,
      },
      {
        value: s.openIncidents,
        label: 'Under Investigation',
        subtitle: 'Currently in progress',
        icon: 'open',
        accent: '#f59e0b',
        isDecimal: false,
      },
      {
        value: s.averageResolutionDays,
        label: 'Avg Resolution',
        subtitle: 'From report to closure',
        icon: 'time',
        accent: '#8b5cf6',
        isDecimal: true,
      },
    ];
  });

  private readonly summaryRequest = new Subject<string | undefined>();
  private heroAnimationComplete = false;
  private statsAnimationTriggered = false;

  private scrollTriggerInstances: ScrollTrigger[] = [];

  constructor() {
    afterNextRender(() => this.initAnimations());
    this.initDataFetching();

    effect(() => {
      const cards = this.statCards();
      if (cards.length > 0 && this.heroAnimationComplete && !this.statsAnimationTriggered) {
        this.statsAnimationTriggered = true;
        untracked(() => this.initStatsEntrance());
      }
    });
  }

  private initDataFetching(): void {
    this.summaryRequest
      .pipe(
        tap(() =>
          this.summaryResource.set({
            data: this.summaryResource().data,
            status: 'loading',
            error: null,
          }),
        ),
        switchMap((cityId) =>
          this.http
            .get<IncidentSummaryResponse>(
              `${environment.API_BASE_URL}${INCIDENT_SUMMARY_ENDPOINT}`,
              { params: this.buildCityParams(cityId) },
            )
            .pipe(
              map((summary) => ({ data: summary, status: 'success' as const, error: null })),
              catchError(() =>
                of({
                  data: EMPTY_INCIDENT_SUMMARY,
                  status: 'error' as const,
                  error: 'Could not load statistics. Please try again.',
                }),
              ),
            ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => this.summaryResource.set(result));

    this.summaryRequest.next(undefined);

    effect(() => {
      if (!this.cityContext.citiesLoaded()) return;
      const cityId = this.cityContext.selectedCityId();
      untracked(() => this.summaryRequest.next(cityId));
    });
  }

  private buildCityParams(cityId: string | undefined): HttpParams | undefined {
    return cityId ? new HttpParams().set('cityId', cityId) : undefined;
  }

  private initAnimations(): void {
    this.preHideElements();
    this.initSplashAnimation();

    this.destroyRef.onDestroy(() => {
      this.scrollTriggerInstances.forEach((st) => st.kill());
      ScrollTrigger.getAll().forEach((st) => st.kill());
    });
  }

  private preHideElements(): void {
    const heroEls = this.heroElements().map((e) => e.nativeElement);
    if (heroEls.length) {
      gsap.set(heroEls, { opacity: 0, y: 50 });
    }
  }

  private initSplashAnimation(): void {
    const loader = this.splashLoader();
    if (!loader) return;

    const title = this.splashTitle();
    const subtitle = this.splashSubtitle();
    const tagline = this.splashTagline();
    const progress = this.splashProgress();
    const shapes = this.splashShapes().map((s) => s.nativeElement);

    const tl = gsap.timeline({
      onComplete: () => {
        this.showSplash.set(false);
        this.initHeroAnimation();
      },
    });

    if (shapes.length) {
      tl.from(
        shapes,
        {
          scaleY: 0,
          transformOrigin: 'bottom center',
          duration: 0.5,
          stagger: 0.06,
          ease: 'power3.out',
        },
        0,
      );
    }

    if (title) {
      tl.from(
        title.nativeElement,
        { y: 30, opacity: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.25',
      );
    }

    if (subtitle) {
      tl.from(
        subtitle.nativeElement,
        { y: 20, opacity: 0, duration: 0.35, ease: 'power2.out' },
        '-=0.2',
      );
    }

    if (tagline) {
      tl.from(
        tagline.nativeElement,
        { opacity: 0, duration: 0.4, ease: 'power2.out' },
        '-=0.3',
      );
    }

    if (progress) {
      tl.fromTo(
        progress.nativeElement,
        { width: '0%' },
        { width: '100%', duration: 0.6, ease: 'power3.inOut' },
        '-=0.35',
      );
    }

    tl.to(loader.nativeElement, {
      y: '-100%',
      duration: 0.6,
      ease: 'power3.inOut',
      delay: 0.3,
    });
  }

  private initHeroAnimation(): void {
    const elements = this.heroElements().map((e) => e.nativeElement);
    if (!elements.length) return;

    const tl = gsap.timeline({
      onComplete: () => {
        this.heroAnimationComplete = true;
        this.initScrollAnimations();
      },
    });

    tl.to(elements, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: 'power3.out',
    });
  }

  private initScrollAnimations(): void {
    this.initProcessHorizontalScroll();
    this.maybeInitStatsEntrance();
  }

  private maybeInitStatsEntrance(): void {
    if (this.statsAnimationTriggered) return;
    const cards = this.statCards();
    if (cards.length > 0) {
      this.statsAnimationTriggered = true;
      this.initStatsEntrance();
    }
  }

  private initStatsEntrance(): void {
    const cards = this.statCards().map((c) => c.nativeElement);
    const numbers = this.statNumbers().map((n) => n.nativeElement);

    if (!cards.length) return;

    cards.forEach((card, i) => {
      const st = ScrollTrigger.create({
        trigger: card,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: 'power3.out',
            delay: i * 0.12,
          });

          if (numbers[i]) {
            const targetStr = numbers[i].getAttribute('data-target');
            if (targetStr) {
              const isDecimal = targetStr.includes('.');
              const target = parseFloat(targetStr);
              const counter = { value: 0 };

              gsap.to(counter, {
                value: target,
                duration: 2.2,
                ease: 'power2.out',
                delay: i * 0.12 + 0.4,
                onUpdate: () => {
                  numbers[i].textContent = isDecimal
                    ? counter.value.toFixed(1)
                    : Math.round(counter.value).toLocaleString();
                },
                onComplete: () => {
                  if (isDecimal) {
                    numbers[i].textContent = target.toFixed(1);
                  }
                },
              });
            }
          }
        },
      });

      this.scrollTriggerInstances.push(st);
    });
  }

  private initProcessHorizontalScroll(): void {
    ScrollTrigger.matchMedia({
      '(min-width: 1024px)': () => {
        const section = this.processSection().nativeElement;
        const track = this.stepsTrack().nativeElement;
        const viewport = this.scrollViewport().nativeElement;

        const getScrollDistance = (): number => {
          return Math.max(0, track.scrollWidth - viewport.clientWidth);
        };

        if (getScrollDistance() <= 0) return;

        const stepEls = this.stepCards().map((c) => c.nativeElement);
        const dots = this.progressDots().map((d) => d.nativeElement);

        gsap.set(stepEls, { opacity: 0, y: 40 });

        const indicator = this.scrollIndicator();
        if (indicator) {
          ScrollTrigger.create({
            trigger: section,
            start: 'top 92%',
            end: 'top 50%',
            scrub: true,
            animation: gsap.to(indicator.nativeElement, { opacity: 0, duration: 1 }),
          });
        }

        if (stepEls.length) {
          ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              gsap.to(stepEls, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.2,
                ease: 'power3.out',
              });
            },
          });
        }

        ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollDistance() * 1.8}`,
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          animation: gsap.to(track, {
            x: () => -getScrollDistance(),
            ease: 'none',
          }),
          onUpdate: (self) => {
            if (dots.length) {
              const activeIndex = Math.min(Math.floor(self.progress * dots.length), dots.length - 1);
              dots.forEach((dot, i) => {
                dot.classList.toggle('is-active', i === activeIndex);
              });
            }
          },
        });

        ScrollTrigger.refresh();
      },
    });
  }
}
