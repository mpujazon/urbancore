import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState, getIdToken, GoogleAuthProvider, signInWithPopup, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, switchMap, catchError, of, shareReplay, firstValueFrom, filter, take } from 'rxjs';
import { UserDto } from '../../shared/models/user-dto.model';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private http: HttpClient = inject(HttpClient);
  private toastService: ToastService = inject(ToastService);
  private router: Router = inject(Router);

  public user$: Observable<User | null> = authState(this.auth);
  public user = toSignal(this.user$, {initialValue: null});

  public dbUser$: Observable<UserDto | null> = this.user$.pipe(
    switchMap((firebaseUser)=>{
    if(firebaseUser){
      return this.http.post<UserDto>(`${environment.API_BASE_URL}/auth/sync`, {}).pipe(
        catchError((err)=>{
          console.error('Error syncing user with backend', err);
          return of(null);
        })
      );
    }
    return of(null);
  }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  public dbUser = toSignal(this.dbUser$, {initialValue: null});

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();

    try{
      await signInWithPopup(this.auth, provider);
      const dbUser = await firstValueFrom(
        this.dbUser$.pipe(
          filter((user): user is UserDto => user !== null),
          take(1)
        )
      );
      this.toastService.showSuccess('Successfully logged in! Welcome.');
      await this.redirectToDefaultRoute(dbUser);
    }catch(error){
      console.error('Error signing in with Google', error);
      this.toastService.showError('Authentication failed or was cancelled.');
      throw error;
    }
  }

  async logout(): Promise<void> {
    try{
      await signOut(this.auth);
      this.toastService.showInfo('You have been logged out.');
    }catch(error){
      console.error('Error signing out', error);
      this.toastService.showError('Could not sign out. Please try again.');
      throw error;
    }
  }

  async getToken(): Promise<string | null> {
    const currentUser = this.auth.currentUser;
    if(currentUser){
      return await getIdToken(currentUser);
    }
    return null;
  }

  private async redirectToDefaultRoute(dbUser: UserDto): Promise<void> {
    if(dbUser.role === 'ROLE_CITIZEN'){
      await this.router.navigateByUrl('/dashboard');
      return;
    }

    if(dbUser.role === 'ROLE_ADMIN'){
      await this.router.navigateByUrl('/manage-incidents');
    }
  }
}
