import { IncidentCategoryLabelPipe } from './incident-category-label.pipe';

describe('IncidentCategoryLabelPipe', () => {
  const pipe = new IncidentCategoryLabelPipe();

  it('transforms SCREAMING_SNAKE_CASE to Title Case', () => {
    expect(pipe.transform('STREET_FURNITURE')).toBe('Street Furniture');
    expect(pipe.transform('POTHOLE')).toBe('Pothole');
    expect(pipe.transform('LIGHTING')).toBe('Lighting');
    expect(pipe.transform('CLEANLINESS')).toBe('Cleanliness');
    expect(pipe.transform('NOISE')).toBe('Noise');
    expect(pipe.transform('GRAFFITI')).toBe('Graffiti');
    expect(pipe.transform('OTHER')).toBe('Other');
  });
});
