import './commands';

// Okno "What's new" po zalogowaniu zasłaniałoby inne testy — przed każdym specem
// oznaczamy najnowszy wpis jako widziany. whats-new.cy.js resetuje to u siebie.
before(() => {
  cy.task('markWhatsNewSeen', {
    emails: [Cypress.env('USER_A_EMAIL'), Cypress.env('USER_B_EMAIL')],
  });
});
