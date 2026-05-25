import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import type { IncidentDetailVm } from '../../shared/models/incident-vm.model';
import { SeoService } from './seo-service';

describe('SeoService', () => {
  let service: SeoService;
  let titleMock: { setTitle: ReturnType<typeof vi.fn> };
  let metaMock: { updateTag: ReturnType<typeof vi.fn> };
  let documentMock: Document;

  beforeEach(() => {
    titleMock = { setTitle: vi.fn() };
    metaMock = { updateTag: vi.fn() };

    const docEl = document.implementation.createHTMLDocument();
    documentMock = docEl;

    TestBed.configureTestingModule({
      providers: [
        { provide: Title, useValue: titleMock },
        { provide: Meta, useValue: metaMock },
        { provide: DOCUMENT, useValue: documentMock },
      ],
    });

    service = TestBed.inject(SeoService);
  });

  it('sets default title and description when route has no SEO data', () => {
    const route = buildRoute({ title: undefined });
    service.updateFromRoute(route, '/');

    expect(titleMock.setTitle).toHaveBeenCalledWith('UrbanCore | City Incident Management');
    expect(metaMock.updateTag).toHaveBeenCalledWith({
      name: 'description',
      content: expect.stringContaining('UrbanCore helps residents'),
    });
  });

  it('uses route title when provided', () => {
    const route = buildRoute({ title: 'Custom Page' });
    service.updateFromRoute(route, '/custom');

    expect(titleMock.setTitle).toHaveBeenCalledWith('Custom Page');
  });

  it('prepends incident title with site name when incident data is resolved', () => {
    const incident: IncidentDetailVm = {
      id: 'INC-1',
      rawId: 'inc-1',
      cityId: 'city-1',
      status: 'UNDER_REVIEW',
      header: {
        title: 'Broken Street Light',
        categoryLabel: 'Lighting',
        statusLabel: 'Under Review',
        statusTone: 'is-review',
        createdAtLabel: 'Jan 01, 2026',
      },
      summary: {
        categoryLabel: 'Lighting',
        statusLabel: 'Under Review',
        statusTone: 'is-review',
        createdAtLabel: 'Jan 01, 2026',
      },
      description: 'Street light has been broken for days.',
      location: {
        lat: 41.38,
        lng: 2.17,
        coordinatesLabel: '41.3800° N, 2.1700° E',
        addressLabel: 'Main St',
        city: 'Barcelona',
      },
      images: [],
      statusHistory: [],
      plannedActions: [],
    };

    const route = buildRoute({ title: 'Incident Detail', incident });
    service.updateFromRoute(route, '/incidents/inc-1');

    expect(titleMock.setTitle).toHaveBeenCalledWith('Broken Street Light | UrbanCore');
  });

  it('sets noindex robots when route SEO data requests it', () => {
    const route = buildRoute({ title: 'Admin', seo: { noindex: true } });
    service.updateFromRoute(route, '/admin');

    expect(metaMock.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'robots', content: 'noindex, nofollow' }),
    );
  });

  it('uses incident description when route description is missing', () => {
    const incident: IncidentDetailVm = {
      id: 'INC-2',
      rawId: 'inc-2',
      cityId: 'city-1',
      status: 'NEW',
      header: {
        title: 'Pothole',
        categoryLabel: 'Pothole',
        statusLabel: 'New',
        statusTone: 'is-new',
        createdAtLabel: 'Jan 01, 2026',
      },
      summary: {
        categoryLabel: 'Pothole',
        statusLabel: 'New',
        statusTone: 'is-new',
        createdAtLabel: 'Jan 01, 2026',
      },
      description: 'A large pothole near the intersection.',
      location: {
        lat: 41.38,
        lng: 2.17,
        coordinatesLabel: '41.3800° N, 2.1700° E',
      },
      images: [],
      statusHistory: [],
      plannedActions: [],
    };

    const route = buildRoute({ title: 'Incident', incident });
    service.updateFromRoute(route, '/incidents/inc-2');

    expect(metaMock.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'description',
        content: 'A large pothole near the intersection.',
      }),
    );
  });

  it('strips query and hash from canonical URL', () => {
    const route = buildRoute({ title: undefined });
    service.updateFromRoute(route, '/incidents?page=2&size=10#section');

    expect(metaMock.updateTag).toHaveBeenCalledWith(
      expect.objectContaining({
        property: 'og:url',
        content: 'https://urbancore-pi.vercel.app/incidents',
      }),
    );
  });
});

function buildRoute(opts: {
  title?: string;
  incident?: IncidentDetailVm;
  seo?: { description?: string; noindex?: boolean };
}): ActivatedRouteSnapshot {
  return {
    title: opts.title,
    data: {
      ...(opts.incident ? { incident: opts.incident } : {}),
      ...(opts.seo ? { seo: opts.seo } : {}),
    },
    firstChild: null,
    paramMap: convertToParamMap({}),
  } as unknown as ActivatedRouteSnapshot;
}
