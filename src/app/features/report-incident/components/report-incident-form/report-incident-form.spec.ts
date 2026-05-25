import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportIncidentForm } from './report-incident-form';

describe('ReportIncidentForm', () => {
  let fixture: ComponentFixture<ReportIncidentForm>;
  let component: ReportIncidentForm;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportIncidentForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportIncidentForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('emits valid form data after debounce when form becomes valid', async () => {
    vi.useFakeTimers();
    const valuesSpy = vi.spyOn(component.formValuesChanged, 'emit');
    const validitySpy = vi.spyOn(component.formValidityChanged, 'emit');
    const form = (component as unknown as { incidentForm: { controls: any } }).incidentForm;

    form.controls.title.setValue('Streetlight outage');
    form.controls.description.setValue('Streetlight has not worked for over a week in this area.');
    form.controls.category.setValue('LIGHTING');

    vi.advanceTimersByTime(500);
    await vi.runAllTimersAsync();

    expect(valuesSpy).toHaveBeenCalledWith({
      title: 'Streetlight outage',
      description: 'Streetlight has not worked for over a week in this area.',
      category: 'LIGHTING',
    });
    expect(validitySpy).toHaveBeenLastCalledWith(true);
    vi.useRealTimers();
  });

  it('emits invalid state when form changes but remains invalid', async () => {
    vi.useFakeTimers();
    const validitySpy = vi.spyOn(component.formValidityChanged, 'emit');
    const form = (component as unknown as { incidentForm: { controls: any } }).incidentForm;

    form.controls.title.setValue('bad');
    form.controls.description.setValue('too short');

    vi.advanceTimersByTime(500);
    await vi.runAllTimersAsync();

    expect(validitySpy).toHaveBeenLastCalledWith(false);
    vi.useRealTimers();
  });

  it('applies suggested values and emits valid payload when suggestion is valid', () => {
    const valuesSpy = vi.spyOn(component.formValuesChanged, 'emit');
    const validitySpy = vi.spyOn(component.formValidityChanged, 'emit');

    fixture.componentRef.setInput('suggestedValues', {
      title: 'Pothole near crossing',
      description: 'Large pothole near the crossing that is dangerous for bikes.',
      category: 'POTHOLE',
    });
    fixture.detectChanges();

    expect(valuesSpy).toHaveBeenCalledWith({
      title: 'Pothole near crossing',
      description: 'Large pothole near the crossing that is dangerous for bikes.',
      category: 'POTHOLE',
    });
    expect(validitySpy).toHaveBeenLastCalledWith(true);
  });
});
