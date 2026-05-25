import { HttpParams } from '@angular/common/http';

export function buildHttpParams(paramsObject: object): HttpParams {
  let params = new HttpParams();

  Object.entries(paramsObject).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    const paramValue = typeof value === 'string' ? value.trim() : String(value);

    if (paramValue !== '') {
      params = params.set(key, paramValue);
    }
  });

  return params;
}
