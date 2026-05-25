import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import type { IncidentDetailVm } from '../../shared/models/incident-vm.model';

interface RouteSeoData {
  description?: string;
  noindex?: boolean;
}

const SITE_NAME = 'UrbanCore';
const SITE_ORIGIN = 'https://urbancore-pi.vercel.app';
const DEFAULT_TITLE = 'UrbanCore | City Incident Management';
const DEFAULT_DESCRIPTION =
  'UrbanCore helps residents report city incidents and follow public status updates from submission to resolution.';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/favicon.png`;

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  updateFromRoute(rootSnapshot: ActivatedRouteSnapshot, urlAfterRedirects: string): void {
    const route = this.getDeepestPrimaryRoute(rootSnapshot);
    const routeSeo = (route.data['seo'] ?? {}) as RouteSeoData;
    const incident = route.data['incident'] as IncidentDetailVm | undefined;

    const title = incident?.header?.title
      ? `${incident.header.title} | ${SITE_NAME}`
      : this.resolveTitle(route.title);
    const description = this.resolveDescription(routeSeo.description, incident);
    const canonicalUrl = this.toCanonicalUrl(urlAfterRedirects);
    const robots = routeSeo.noindex ? 'noindex, nofollow' : 'index, follow';

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: robots });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE_NAME });
    this.meta.updateTag({ property: 'og:image', content: DEFAULT_IMAGE });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: DEFAULT_IMAGE });
    this.setCanonical(canonicalUrl);
    this.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_ORIGIN,
      description,
      inLanguage: 'en',
    });
  }

  private resolveTitle(routeTitle: unknown): string {
    if (typeof routeTitle === 'string' && routeTitle.trim().length > 0) {
      return routeTitle;
    }

    return DEFAULT_TITLE;
  }

  private resolveDescription(routeDescription: string | undefined, incident: IncidentDetailVm | undefined): string {
    if (routeDescription?.trim()) {
      return routeDescription;
    }

    if (incident?.description?.trim()) {
      return incident.description.slice(0, 160);
    }

    return DEFAULT_DESCRIPTION;
  }

  private getDeepestPrimaryRoute(snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
    let current = snapshot;

    while (current.firstChild) {
      current = current.firstChild;
    }

    return current;
  }

  private toCanonicalUrl(url: string): string {
    const canonical = new URL(url || '/', SITE_ORIGIN);
    canonical.search = '';
    canonical.hash = '';
    return canonical.toString();
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }

  private setStructuredData(data: Record<string, unknown>): void {
    const scriptId = 'urbancore-jsonld';
    let script = this.document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = this.document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    script.text = JSON.stringify(data);
  }
}
