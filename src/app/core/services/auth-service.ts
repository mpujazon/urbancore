import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, authState, getIdToken, GoogleAuthProvider, signInWithPopup, signOut, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth = inject(Auth);

  public user$: Observable<User | null> = authState(this.auth);
  public user = toSignal(this.user$, {initialValue: null});

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
