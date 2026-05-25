import { validateImageFile } from './image-upload.validators';

describe('image-upload.validators', () => {
  it('accepts valid image files by MIME type', () => {
    expect(validateImageFile(new File([''], 'photo.jpg', { type: 'image/jpeg' }))).toBeNull();
    expect(validateImageFile(new File([''], 'photo.png', { type: 'image/png' }))).toBeNull();
    expect(validateImageFile(new File([''], 'photo.webp', { type: 'image/webp' }))).toBeNull();
    expect(validateImageFile(new File([''], 'photo.heic', { type: 'image/heic' }))).toBeNull();
    expect(validateImageFile(new File([''], 'photo.heif', { type: 'image/heif' }))).toBeNull();
  });

  it('accepts valid image files by extension', () => {
    expect(validateImageFile(new File([''], 'photo.JPG', { type: '' }))).toBeNull();
    expect(validateImageFile(new File([''], 'photo.JPEG', { type: '' }))).toBeNull();
    expect(validateImageFile(new File([''], 'photo.PNG', { type: '' }))).toBeNull();
    expect(validateImageFile(new File([''], 'photo.WEBP', { type: '' }))).toBeNull();
    expect(validateImageFile(new File([''], 'photo.HEIC', { type: '' }))).toBeNull();
    expect(validateImageFile(new File([''], 'photo.HEIF', { type: '' }))).toBeNull();
  });

  it('rejects files with invalid type and extension', () => {
    expect(validateImageFile(new File([''], 'notes.txt', { type: 'text/plain' }))).toContain(
      'Only JPG, PNG, WebP, HEIC or HEIF images are allowed.',
    );
    expect(validateImageFile(new File([''], 'document.pdf', { type: 'application/pdf' }))).toContain(
      'Only JPG, PNG, WebP, HEIC or HEIF images are allowed.',
    );
  });

  it('rejects files exceeding 5 MB', () => {
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    expect(validateImageFile(largeFile)).toContain('The image must not exceed 5 MB.');
  });

  it('accepts files exactly at 5 MB', () => {
    const exactly5MB = new File([new ArrayBuffer(5 * 1024 * 1024)], 'max.jpg', { type: 'image/jpeg' });
    expect(validateImageFile(exactly5MB)).toBeNull();
  });
});
