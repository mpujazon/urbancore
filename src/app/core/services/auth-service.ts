import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState, getIdToken, GoogleAuthProvider, signInWithPopup, signOut, User } from '@angular/fire/auth';
import { Observable, switchMap, catchError, of } from 'rxjs';
import { UserDto } from '../../shared/models/UserInterface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private http: HttpClient = inject(HttpClient);

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

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();

    try{
      await signInWithPopup(this.auth, provider);
    }catch(error){
      console.error('Error signing in with Google', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try{
      await signOut(this.auth);
    }catch(error){
      console.error('Error signing out', error);
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
