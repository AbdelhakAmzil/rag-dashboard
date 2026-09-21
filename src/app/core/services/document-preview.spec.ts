import { TestBed } from '@angular/core/testing';

import { DocumentPreview } from './document-preview';

describe('DocumentPreview', () => {
  let service: DocumentPreview;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentPreview);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
