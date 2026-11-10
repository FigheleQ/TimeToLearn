const TEST_DECK = `[cy-test] Talia ${Date.now()}`;

describe('Talie fiszek — CRUD', () => {
  beforeEach(() => {
    cy.login(Cypress.env('USER_A_EMAIL'), Cypress.env('USER_A_PASSWORD'));
    cy.visit('/flashcards');
  });

  after(() => {
    cy.task('cleanupDeck', { deckTitle: TEST_DECK });
  });

  it('wyświetla stronę z talkami po zalogowaniu', () => {
    cy.url().should('include', '/flashcards');
    cy.get('[data-testid="new-deck-button"]').should('be.visible');
  });

  it('otwiera formularz nowej talii po kliknięciu przycisku', () => {
    cy.get('[data-testid="new-deck-button"]').click();
    cy.get('[data-testid="deck-title-input"]').should('be.visible');
    cy.get('[data-testid="deck-subject-input"]').should('be.visible');
    cy.get('[data-testid="create-deck-button"]').should('be.visible');
  });

  it('zamyka formularz po kliknięciu Anuluj', () => {
    cy.get('[data-testid="new-deck-button"]').click();
    cy.get('[data-testid="cancel-deck-button"]').click();
    cy.get('[data-testid="deck-title-input"]').should('not.exist');
  });

  it('tworzy nową talię i pokazuje ją na liście', () => {
    cy.get('[data-testid="new-deck-button"]').click();
    cy.get('[data-testid="deck-title-input"]').type(TEST_DECK);
    cy.get('[data-testid="deck-subject-input"]').type('Cypress test');
    cy.get('[data-testid="create-deck-button"]').click();
    cy.get('[data-testid="deck-card"]').contains(TEST_DECK).should('be.visible');
  });

  it('otwiera talię po kliknięciu "Otwórz talię"', () => {
    cy.get('[data-testid="deck-card"]').contains(TEST_DECK)
      .closest('[data-testid="deck-card"]')
      .find('[data-testid="open-deck-button"]')
      .click();
    cy.url().should('match', /\/flashcards\/[a-z0-9-]+/);
  });

  it('usuwa talię z listy', () => {
    cy.get('[data-testid="deck-card"]').contains(TEST_DECK)
      .closest('[data-testid="deck-card"]')
      .find('[data-testid="delete-deck-button"]')
      .click();
    cy.get('[data-testid="deck-card"]').contains(TEST_DECK).should('not.exist');
  });
});
