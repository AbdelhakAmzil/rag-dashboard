import { Component, input } from '@angular/core';

@Component({
  selector: 'app-source-card',
  imports: [],
  templateUrl: './source-card.html',
  styleUrl: './source-card.css',
})
export class SourceCard {
  fileName = input.required<string>();

  get icon(): string {
    const ext = this.fileName().split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return '📄';
      case 'docx':
        return '📃';
      case 'txt':
        return '📝';
      case 'html':
        return '🌐';
      default:
        return '📁';
    }
  }
}
