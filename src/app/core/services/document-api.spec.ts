import { TestBed } from '@angular/core/testing';

import { DocumentApi } from './document-api';

describe('DocumentApi', () => {
  let service: DocumentApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
