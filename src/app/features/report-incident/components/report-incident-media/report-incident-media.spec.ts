import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportIncidentMedia } from './report-incident-media';

describe('ReportIncidentMedia', () => {
  let fixture: ComponentFixture<ReportIncidentMedia>;
  let component: ReportIncidentMedia;
  let createObjectUrlSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectUrlSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    createObjectUrlSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:preview');
    revokeObjectUrlSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [ReportIncidentMedia],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportIncidentMedia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    createObjectUrlSpy.mockRestore();
    revokeObjectUrlSpy.mockRestore();
  });

  it('adds valid files and emits selected files', () => {
    const emitSpy = vi.spyOn(component.selectedFilesChanged, 'emit');
    const file = new File(['ok'], 'evidence.jpg', { type: 'image/jpeg' });

    callOnFilesSelected(component, [file]);

    expect(emitSpy).toHaveBeenCalledWith([file]);
    expect((component as unknown as { previews: () => unknown[] }).previews().length).toBe(1);
    expect(createObjectUrlSpy).toHaveBeenCalledWith(file);
  });

  it('rejects invalid file type and does not emit', () => {
    const emitSpy = vi.spyOn(component.selectedFilesChanged, 'emit');
    const invalidFile = new File(['text'], 'notes.txt', { type: 'text/plain' });

    callOnFilesSelected(component, [invalidFile]);

    expect((component as unknown as { errorMessage: () => string | null }).errorMessage()).toContain(
      'Only JPG, PNG, WebP, HEIC or HEIF images are allowed.',
    );
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('enforces 5-file limit', () => {
    const emitSpy = vi.spyOn(component.selectedFilesChanged, 'emit');
    const sixFiles = Array.from({ length: 6 }, (_, idx) =>
      new File(['ok'], `evidence-${idx}.jpg`, { type: 'image/jpeg' }),
    );

    callOnFilesSelected(component, sixFiles);

    expect((component as unknown as { previews: () => unknown[] }).previews().length).toBe(5);
    expect((component as unknown as { errorMessage: () => string | null }).errorMessage()).toContain('Only 5 files are allowed.');
    expect(emitSpy).toHaveBeenCalled();
  });

  it('revokes object URLs when removing preview', () => {
    const file = new File(['ok'], 'evidence.jpg', { type: 'image/jpeg' });
    callOnFilesSelected(component, [file]);

    const preview = (component as unknown as { previews: () => Array<{ id: number; url: string }> }).previews()[0];
    (component as unknown as { removePreview: (id: number) => void }).removePreview(preview.id);

    expect(revokeObjectUrlSpy).toHaveBeenCalledWith(preview.url);
    expect((component as unknown as { previews: () => unknown[] }).previews().length).toBe(0);
  });
});

function callOnFilesSelected(component: ReportIncidentMedia, files: File[]): void {
  const fileInput = document.createElement('input');
  Object.defineProperty(fileInput, 'files', {
    value: createFileList(files),
    configurable: true,
  });

  (component as unknown as { onFilesSelected: (event: Event) => void }).onFilesSelected({
    target: fileInput,
  } as unknown as Event);
}

function createFileList(files: File[]): FileList {
  const fileList = files.slice() as unknown as {
    [index: number]: File;
    length: number;
    item: (index: number) => File | null;
  };
  fileList.item = (index: number) => files[index] ?? null;
  return fileList as FileList;
}
