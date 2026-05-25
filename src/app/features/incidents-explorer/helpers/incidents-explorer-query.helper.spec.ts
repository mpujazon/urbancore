import {
  INCIDENTS_EXPLORER_DEFAULT_PAGE,
  INCIDENTS_EXPLORER_DEFAULT_SIZE,
  INCIDENTS_EXPLORER_DEFAULT_SORT,
  buildIncidentsExplorerQuery,
  buildIncidentsExplorerQueryParams,
  hydrateIncidentsExplorerState,
} from './incidents-explorer-query.helper';

describe('incidents-explorer-query.helper', () => {
  describe('hydrateIncidentsExplorerState', () => {
    it('parses populated query params into state', () => {
      const state = hydrateIncidentsExplorerState({
        q: '  lights  ',
        status: 'UNDER_REVIEW',
        category: 'LIGHTING',
        priority: 'HIGH',
        from: '2026-01-01',
        to: '2026-01-31',
        page: '2',
        size: '25',
        sort: 'createdAt,asc',
      });

      expect(state.filters.q).toBe('  lights  ');
      expect(state.filters.status).toBe('UNDER_REVIEW');
      expect(state.filters.category).toBe('LIGHTING');
      expect(state.filters.priority).toBe('HIGH');
      expect(state.filters.from).toBe('2026-01-01');
      expect(state.filters.to).toBe('2026-01-31');
      expect(state.page).toBe(2);
      expect(state.size).toBe(25);
      expect(state.sort).toBe('createdAt,asc');
    });

    it('returns defaults for missing or invalid params', () => {
      const state = hydrateIncidentsExplorerState({
        page: 'abc',
        size: '200',
        sort: undefined,
      });

      expect(state.page).toBe(INCIDENTS_EXPLORER_DEFAULT_PAGE);
      expect(state.size).toBe(INCIDENTS_EXPLORER_DEFAULT_SIZE);
      expect(state.sort).toBe(INCIDENTS_EXPLORER_DEFAULT_SORT);
    });

    it('clamps size to default when less than 1', () => {
      const state = hydrateIncidentsExplorerState({ size: '0' });
      expect(state.size).toBe(INCIDENTS_EXPLORER_DEFAULT_SIZE);
    });

    it('clamps size to default when greater than 50', () => {
      const state = hydrateIncidentsExplorerState({ size: '51' });
      expect(state.size).toBe(INCIDENTS_EXPLORER_DEFAULT_SIZE);
    });
  });

  describe('buildIncidentsExplorerQueryParams', () => {
    it('builds params omitting defaults and blank filters', () => {
      const params = buildIncidentsExplorerQueryParams({
        filters: { q: '   ', status: 'RESOLVED' },
        page: 0,
        size: 10,
        sort: 'createdAt,desc',
      });

      expect(params['q']).toBeUndefined();
      expect(params['status']).toBe('RESOLVED');
      expect(params['page']).toBeUndefined();
      expect(params['size']).toBeUndefined();
      expect(params['sort']).toBeUndefined();
    });

    it('includes non-default page, size, and sort', () => {
      const params = buildIncidentsExplorerQueryParams({
        filters: { q: 'pothole', category: 'POTHOLE' },
        page: 3,
        size: 25,
        sort: 'priority,desc',
      });

      expect(params['q']).toBe('pothole');
      expect(params['category']).toBe('POTHOLE');
      expect(params['page']).toBe('3');
      expect(params['size']).toBe('25');
      expect(params['sort']).toBe('priority,desc');
    });
  });

  describe('buildIncidentsExplorerQuery', () => {
    it('builds API query with trimmed q and optional cityId', () => {
      const query = buildIncidentsExplorerQuery({
        filters: { q: '  graffiti  ', status: 'NEW', from: '2026-02-01', to: '2026-02-28' },
        page: 1,
        size: 25,
        sort: 'createdAt,asc',
        cityId: 'city-1',
      });

      expect(query.q).toBe('graffiti');
      expect(query.status).toBe('NEW');
      expect(query.from).toBe('2026-02-01');
      expect(query.to).toBe('2026-02-28');
      expect(query.page).toBe(1);
      expect(query.size).toBe(25);
      expect(query.sort).toBe('createdAt,asc');
      expect(query.cityId).toBe('city-1');
    });

    it('omits falsy optional fields', () => {
      const query = buildIncidentsExplorerQuery({
        filters: {},
        page: 0,
        size: 10,
        sort: 'createdAt,desc',
      });

      expect(query.q).toBeUndefined();
      expect(query.status).toBeUndefined();
      expect(query.cityId).toBeUndefined();
    });
  });
});
