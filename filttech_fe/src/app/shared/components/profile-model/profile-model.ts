import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: '[app-profile-model]',
  imports: [RouterLink],
  templateUrl: './profile-model.html',
  styleUrl: './profile-model.css',
})
export class ProfileModel {
  onlogout = output();
  username = input();
  profile = input();
  logout() {
    this.onlogout.emit();
  }
}
