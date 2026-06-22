// dropdown-select.component.ts
import { Component, model, signal, input } from '@angular/core';
import { ClickOutsideDirective } from '../../../shared/directive/click-outside.directive';

@Component({
  selector: 'app-dropdown-select',
  standalone: true,
  imports: [ClickOutsideDirective],
  templateUrl: './dropdown-select.html',
})
export class DropdownSelectComponent {
  // Input: list of options (read-only signal)
  options = input<{ label: string; value: string }[]>([]);

  // Input: placeholder text
  placeholder = input<string>('Select');

  // Two-way binding: the currently selected option
  selectedOption = model<{ label: string; value: string } | null>(null);

  // Local UI state
  open = signal(false);

  toggle() {
    this.open.update((x) => !x);
  }

  choose(option: { label: string; value: string }) {
    if (option === this.selectedOption()) {
      this.open.set(false);
      this.selectedOption.set(null);
    } else {
      this.selectedOption.set(option); // This triggers (selectedOptionChange) in parent
      this.open.set(false);
    }
  }

  close() {
    this.open.set(false);
  }

  // Helper to display current selection
  displayLabel() {
    return this.selectedOption()?.label || this.placeholder();
  }
}
