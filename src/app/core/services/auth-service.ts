import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState, getIdToken, GoogleAuthProvider, signInWithPopup, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, switchMap, catchError, of } from 'rxjs';
import { UserDto } from '../../shared/models/UserInterface';
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
  }));
  public dbUser = toSignal(this.dbUser$, {initialValue: null});

  redirectUserOnLogin = effect(()=>{
    const firebaseUser = this.user();
    const dbUser = this.dbUser();

    if(!firebaseUser || !dbUser){
      return;
    }

    if(dbUser.role === 'citizen'){
      void this.router.navigateByUrl('/dashboard');
      return;
    }

    if(dbUser.role === 'admin'){
      void this.router.navigateByUrl('/manage-incidents');
    }
  });

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();

    try{
      await signInWithPopup(this.auth, provider);
      this.toastService.showSuccess('Successfully logged in! Welcome.');
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
}
