import { Component } from '@angular/core';
import { DoctorTestComponent } from './doctor-test.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DoctorTestComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export default class AppComponent {
  darkMode = false;
  userRenderedContent = '<img src="invalid:" onerror="alert(1)">';

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
  }
}
