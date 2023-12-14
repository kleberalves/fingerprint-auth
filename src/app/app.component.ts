import { Component } from '@angular/core';
import { User } from './interfaces/user';
import { ServerMockService } from './services/server-mock.service';
import { CommonModule } from '@angular/common';

import { WebAuthnService } from './services/web-authn.service';
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatButtonModule } from '@angular/material/button'

import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [MatCardModule, MatCheckboxModule, MatIconModule, MatFormFieldModule, FormsModule, MatInputModule, CommonModule, MatButtonModule],
})
export class AppComponent {
  title = 'angular-web-authn';
  users: User[];
  email = 'a@a.com';
  password = 'aaa';
  useFingerprint = true;
  webAuthnAvailable = !!navigator.credentials && !!navigator.credentials.create;
  // signupForm: FormGroup;

  constructor(private serverMockService: ServerMockService, private webAuthnService: WebAuthnService) {
    this.users = serverMockService.getUsers();

    // this.signupForm = fb.group({
    //   email: ['a@a.com', [Validators.required, Validators.email]],
    //   password: ['aaa', [Validators.required]],
    //   confirmPassword: ['aaa', [Validators.required]],
    // });
  }

  valueChange($event:any) {
    console.log($event.checked);
    this.useFingerprint = $event.checked;
  }

  removeUser(email: string) {
    this.serverMockService.removeUser(email);
    this.users = this.serverMockService.getUsers();
  }

  signup() {
    console.log('SIGNUP');

    // Save into the 'DB'
    const prevUser = this.serverMockService.getUser(this.email);
    if (prevUser) {
      alert('🚫 User already exists with this email address');
      return;
    }
    const user: User = this.serverMockService.addUser({ email: this.email, password: this.password, credentials: [] });
    this.users = this.serverMockService.getUsers();

    // Ask for WebAuthn Auth method
    if (this.webAuthnAvailable && this.useFingerprint) {
      this.webAuthnService.webAuthnSignup(user)
        .then((credential: Credential | null) => {
          console.log('credentials.create RESPONSE', credential);
          //const valid = this.serverMockService.registerCredential(user, credential);
          this.users = this.serverMockService.getUsers();
        }).catch((error) => {
          console.log('credentials.create ERROR', error);
        });
    }
  }

  signin() {
    console.log('[signin]');
    const user = this.serverMockService.getUsers().find(u => u.email === this.email && u.password === this.password);
    if (user) {
      alert('✅ Congrats! Authentication went fine!');
    } else {
      alert('🚫 Sorry :( Invalid credentials!');
    }
  }

  webAuthSignin() {
    const user = this.serverMockService.getUser(this.email);

    if (user) {
      this.webAuthnService.webAuthnSignin(user).then((response) => {
        // TODO: validate attestion
        alert('✅ Congrats! Authentication went fine!');
        console.log('SUCCESSFULLY GOT AN ASSERTION!', response);
      })
        .catch((error) => {
          alert('🚫 Sorry :( Invalid credentials!');
          console.log('FAIL', error);
        });
    }
  }
}
