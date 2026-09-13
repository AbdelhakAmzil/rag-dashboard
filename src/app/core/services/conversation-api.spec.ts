import { TestBed } from '@angular/core/testing';

import { ConversationApi } from './conversation-api';

describe('ConversationApi', () => {
  let service: ConversationApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversationApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
