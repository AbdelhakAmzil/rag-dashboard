import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UiState {
  isDarkMode = signal(false);
  isSidebarOpen = signal(false);
  isSourcesPanelOpen = signal(false);

  constructor() {
    effect(() => {
      const theme = this.isDarkMode() ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  toggleDarkMode() {
    this.isDarkMode.update((value) => !value);
  }

  toggleSidebar() {
    this.isSidebarOpen.update((value) => !value);
  }

  toggleSourcesPanel() {
    this.isSourcesPanelOpen.update((value) => !value);
  }
}
