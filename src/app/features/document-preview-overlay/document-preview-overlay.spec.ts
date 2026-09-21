import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentPreviewOverlay } from './document-preview-overlay';

describe('DocumentPreviewOverlay', () => {
  let component: DocumentPreviewOverlay;
  let fixture: ComponentFixture<DocumentPreviewOverlay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentPreviewOverlay],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentPreviewOverlay);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
