// Okno "What's new" po zalogowaniu
import { RELEASES } from '../../src/config/whatsNew.js';

describe("What's new — okno nowości po zalogowaniu", () => {
  const email = () => Cypress.env('USER_A_EMAIL');

  before(() => cy.task('resetWhatsNew', { email: email() }));
  after(() => cy.task('markWhatsNewSeen', { emails: [email()] }));

  it('pokazuje najnowszy wpis, a po „Rozumiem” nie pokazuje go ponownie', () => {
    cy.login(email(), Cypress.env('USER_A_PASSWORD'));
    cy.visit('/');

    cy.get('[data-testid="whats-new-modal"]').should('be.visible');
    cy.get('[data-testid="whats-new-release"]')
      .should('have.length', 1)
      .and('contain', RELEASES[0].title);

    cy.get('[data-testid="whats-new-modal-confirm"]').click();
    cy.get('[data-testid="whats-new-modal"]').should('not.exist');

    cy.task('getLastSeenRelease', { email: email() }).should('eq', RELEASES[0].id);

    // czekamy, aż okno faktycznie sprawdzi profil — inaczej "not.exist" przeszłoby za wcześnie
    cy.intercept('GET', '**/rest/v1/profiles*').as('profile');
    cy.reload();
    cy.wait('@profile');
    cy.get('[data-testid="whats-new-modal"]').should('not.exist');
  });
});
