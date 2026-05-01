import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { from, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isUrbancoreApi = req.url.startsWith('http://localhost:8080/api') || req.url.startsWith(environment.API_BASE_URL);

  if (!isUrbancoreApi) {
    return next(req);
  }

  return from(authService.getToken()).pipe(
    switchMap((token)=>{
      if(token){
        const authReq = req.clone({
          setHeaders:{
            Authorization: `Bearer ${token}`
          }
        });
        return next(authReq);
      }
      return next(req);
    })
  );
};
