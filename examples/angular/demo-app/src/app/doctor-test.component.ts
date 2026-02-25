import { Component, input } from '@angular/core';

@Component({
  selector: 'app-doctor-test',
  standalone: true,
  template: `<button type="button">{{ label() }}</button>`,
})
export class DoctorTestComponent {
  label = input.required<string>();
}
