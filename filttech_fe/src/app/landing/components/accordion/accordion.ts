import { NgClass } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.html',
  imports: [NgClass],
  standalone: true,
})
export class Accordion {
  items = [
    {
      title: 'How do I enroll in a course?',
      content:
        "Simply create an account, browse our course catalog, and click any course that interests you. You'll get instant access to all course materials and can start learning immediately.",
    },
    {
      title: 'Are the courses self-paced or scheduled?',
      content:
        'our courses are self-paced, allowing you to learn at your own speed. However, we also offer live sessions with expert instructors for personalized guidance and real-time interaction.',
    },
    {
      title: 'How do i sign up?',
      content:
        'To create an account, click Subscribe on the signup page. We will send you a message. Reply with OK to 1234, and you will receive a password via SMS. Use that password to log in.',
    },
    {
      title: 'What if I need help during the course?',
      content: 'Support  with  phone number or can contact us in the form',
    },
    {
      title: 'Can I access courses on mobile devices?',
      content:
        'Absolutely! Our platform is fully responsive and works seamlessly on desktop, tablet, and mobile devices. Learn anywhere, anytime, on any device.',
    },
    {
      title: 'What payment methods do you accept?',
      content: 'We accept SMS-based payment methods. Pay easily using your phone',
    },
  ];

  openIndex = 0; // first one open

  toggle(index: number) {
    this.openIndex = this.openIndex === index ? -1 : index;
  }
}
