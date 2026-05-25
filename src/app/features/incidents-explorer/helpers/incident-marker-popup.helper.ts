import { formatCategory, formatStatus, getCategoryIcon, getStatusStyleClass } from '../../../shared/mappers/incident.mapper';
import type { IncidentListItemDto } from '../../../shared/models/incident-dto.model';

export function buildIncidentMarkerPopupHtml(incident: IncidentListItemDto): string {
  const date = new Date(incident.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const statusCls = getStatusStyleClass(incident.status);
  const categoryLabel = formatCategory(incident.category);
  const categoryIcon = getCategoryIcon(incident.category);
  const statusLabel = formatStatus(incident.status);

  const locationText = [incident.location?.addressLabel, incident.location?.city]
    .filter(Boolean)
    .join(', ');

  const imageSection = incident.thumbnailUrl
    ? `<div class="marker-popup-media">
         <img src="${incident.thumbnailUrl}" alt="${escapeHtml(incident.title)}" class="marker-popup-img" loading="lazy" />
         <span class="marker-popup-status-badge ${statusCls}">
           <span class="marker-popup-status-dot" aria-hidden="true"></span>${statusLabel}
         </span>
       </div>`
    : `<div class="marker-popup-media marker-popup-media--fallback">
         <div class="marker-popup-fallback">
           <i class="fa-solid ${categoryIcon}" aria-hidden="true"></i>
         </div>
         <span class="marker-popup-status-badge ${statusCls}">
           <span class="marker-popup-status-dot" aria-hidden="true"></span>${statusLabel}
         </span>
       </div>`;

  const locationSection = locationText
    ? `<div class="marker-popup-location">
         <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
         <span>${escapeHtml(locationText)}</span>
       </div>`
    : '';

  return `
    <article class="marker-popup-card">
      ${imageSection}
      <div class="marker-popup-body">
        <header class="marker-popup-header">
          <span class="marker-popup-category">${categoryLabel}</span>
        </header>
        <h3 class="marker-popup-title">${escapeHtml(incident.title)}</h3>
        ${locationSection}
        <time class="marker-popup-date" datetime="${incident.createdAt}">${date}</time>
        <footer class="marker-popup-footer">
          <a href="/incidents/${incident.id}" class="marker-popup-cta">
            View details
            <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </a>
        </footer>
      </div>
    </article>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
