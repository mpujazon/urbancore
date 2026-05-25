import { NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

  readonly destroyRef = inject(DestroyRef);

  private scrollTriggerInstances: ScrollTrigger[] = [];

  constructor() {
    afterNextRender(() => this.initAnimations());
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

    const cardEls = this.statCards().map((e) => e.nativeElement);
    if (cardEls.length) {
      gsap.set(cardEls, { opacity: 0, y: 50, scale: 0.9 });
    }

    const stepEls = this.stepCards().map((e) => e.nativeElement);
    if (stepEls.length) {
      gsap.set(stepEls, { opacity: 0, y: 40 });
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
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        },
        0,
      );
    }

    if (title) {
      tl.from(
        title.nativeElement,
        { y: 40, opacity: 0, duration: 0.6, ease: 'power2.out' },
        '-=0.4',
      );
    }

    if (subtitle) {
      tl.from(
        subtitle.nativeElement,
        { y: 30, opacity: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.35',
      );
    }

    if (tagline) {
      tl.from(
        tagline.nativeElement,
        { opacity: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.5',
      );
    }

    if (progress) {
      tl.fromTo(
        progress.nativeElement,
        { width: '0%' },
        { width: '100%', duration: 1, ease: 'power3.inOut' },
        '-=0.6',
      );
    }

    tl.to(loader.nativeElement, {
      y: '-100%',
      duration: 0.9,
      ease: 'power3.inOut',
      delay: 0.6,
    });
  }

  private initHeroAnimation(): void {
    const elements = this.heroElements().map((e) => e.nativeElement);
    if (!elements.length) return;

    const tl = gsap.timeline({
      onComplete: () => this.initScrollAnimations(),
    });

    tl.to(elements, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
    });
  }

  private initScrollAnimations(): void {
    this.initStatsEntrance();
    this.initProcessHorizontalScroll();
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
            duration: 0.75,
            ease: 'power3.out',
            delay: i * 0.15,
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
                delay: i * 0.15 + 0.4,
                onUpdate: () => {
                  numbers[i].textContent = isDecimal
                    ? counter.value.toFixed(1)
                    : Math.round(counter.value).toLocaleString();
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
    const section = this.processSection().nativeElement;
    const track = this.stepsTrack().nativeElement;
    const viewport = this.scrollViewport().nativeElement;

    const getScrollDistance = (): number => {
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    };

    if (getScrollDistance() <= 0) return;

    const stepEls = this.stepCards().map((c) => c.nativeElement);
    const dots = this.progressDots().map((d) => d.nativeElement);

    const indicator = this.scrollIndicator();
    if (indicator) {
      const indicatorSt = ScrollTrigger.create({
        trigger: section,
        start: 'top 92%',
        end: 'top 50%',
        scrub: true,
        animation: gsap.to(indicator.nativeElement, { opacity: 0, duration: 1 }),
      });
      this.scrollTriggerInstances.push(indicatorSt);
    }

    if (stepEls.length) {
      const stepSt = ScrollTrigger.create({
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
      this.scrollTriggerInstances.push(stepSt);
    }

    const mainSt = ScrollTrigger.create({
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

    this.scrollTriggerInstances.push(mainSt);

    ScrollTrigger.refresh();
  }
}
