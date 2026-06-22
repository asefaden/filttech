import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-terms-and-conditions',
  imports: [],
  templateUrl: './terms-and-conditions.html',
  styleUrl: './terms-and-conditions.css',
  standalone: true,
})
export class TermsAndConditions {
  oncloseterms = output();
  onacceptterms = output();
  close() {
    this.oncloseterms.emit();
  }
  accept() {
    this.onacceptterms.emit();
  }
}
