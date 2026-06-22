import { Component } from '@angular/core';
import { Accordion } from '../accordion/accordion';

@Component({
  selector: '[app-faq]',
  imports: [Accordion],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class Faq {}
