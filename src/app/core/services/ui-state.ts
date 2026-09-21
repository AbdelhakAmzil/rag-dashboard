import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UiState {
  isDarkMode = signal(false);
  isSidebarOpen = signal(this.getInitialState(768));
  isSourcesPanelOpen = signal(this.getInitialState(1024));

  private getInitialState(breakpoint: number): boolean {
    return typeof window !== 'undefined' ? window.innerWidth > breakpoint : true;
  }

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
