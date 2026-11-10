const DECK_NAME = `[cy-test] Sesja ${Date.now()}`;

describe('Sesja nauki i podsumowanie', () => {

  before(() => {
    cy.login(Cypress.env('USER_A_EMAIL'), Cypress.env('USER_A_PASSWORD'));

    // Tworzymy talię i 2 fiszki przez UI
    cy.visit('/flashcards');
    cy.get('[data-testid="new-deck-button"]').click();
    cy.get('[data-testid="deck-title-input"]').type(DECK_NAME);
    cy.get('[data-testid="create-deck-button"]').click();

    cy.get('[data-testid="deck-card"]').contains(DECK_NAME)
      .closest('[data-testid="deck-card"]')
      .find('[data-testid="open-deck-button"]')
      .click();

    cy.url().should('match', /\/flashcards\/[a-z0-9-]+/);

    // Fiszka 1
    cy.get('[data-testid="question-input"]').type('Pytanie testowe 1');
    cy.get('[data-testid="answer-input"]').type('Odpowiedź testowa 1');
    cy.get('[data-testid="add-card-button"]').click();
    cy.get('[data-testid="flashcard"]').should('have.length', 1);

    // Fiszka 2
    cy.get('[data-testid="question-input"]').type('Pytanie testowe 2');
    cy.get('[data-testid="answer-input"]').type('Odpowiedź testowa 2');
    cy.get('[data-testid="add-card-button"]').click();
    cy.get('[data-testid="flashcard"]').should('have.length', 2);
  });

  after(() => {
    cy.task('cleanupDeck', { deckTitle: DECK_NAME });
  });

  beforeEach(() => {
    cy.login(Cypress.env('USER_A_EMAIL'), Cypress.env('USER_A_PASSWORD'));
    cy.visit('/flashcards');
    cy.get('[data-testid="deck-card"]').contains(DECK_NAME)
      .closest('[data-testid="deck-card"]')
      .find('[data-testid="open-deck-button"]')
      .click();
  });

  it('pokazuje przycisk "Ucz się" gdy talia ma fiszki', () => {
    cy.get('[data-testid="study-button"]').should('be.visible');
  });

  it('wchodzi w tryb nauki po kliknięciu "Ucz się"', () => {
    cy.get('[data-testid="study-button"]').click();
    cy.get('[data-testid="study-card"]').should('be.visible');
  });

  it('nie pokazuje przycisków oceny przed odkryciem karty', () => {
    cy.get('[data-testid="study-button"]').click();
    cy.get('[data-testid="btn-known"]').should('not.exist');
    cy.get('[data-testid="btn-unknown"]').should('not.exist');
  });

  it('odkrywa odpowiedź po kliknięciu karty', () => {
    cy.get('[data-testid="study-button"]').click();
    cy.get('[data-testid="study-card"]').click();
    cy.get('[data-testid="btn-known"]').should('be.visible');
    cy.get('[data-testid="btn-unknown"]').should('be.visible');
  });

  it('przechodzi przez całą sesję (umiem + nie umiem) i pokazuje podsumowanie', () => {
    cy.get('[data-testid="study-button"]').click();

    // Karta 1 — umiem
    cy.get('[data-testid="study-card"]').click();
    cy.get('[data-testid="btn-known"]').click();

    // Karta 2 — nie umiem
    cy.get('[data-testid="study-card"]').click();
    cy.get('[data-testid="btn-unknown"]').click();

    // Podsumowanie
    cy.get('[data-testid="summary-known"]').should('contain', '1');
    cy.get('[data-testid="summary-unknown"]').should('contain', '1');
  });

  it('pokazuje przycisk "Powtórz błędy" gdy są nieznane karty', () => {
    cy.get('[data-testid="study-button"]').click();

    cy.get('[data-testid="study-card"]').click();
    cy.get('[data-testid="btn-unknown"]').click();

    cy.get('[data-testid="study-card"]').click();
    cy.get('[data-testid="btn-unknown"]').click();

    cy.get('[data-testid="retry-button"]').should('be.visible');
  });

  it('powtórka błędów restartuje sesję tylko z nieznanych kart', () => {
    cy.get('[data-testid="study-button"]').click();

    // Obie nieznane
    cy.get('[data-testid="study-card"]').click();
    cy.get('[data-testid="btn-unknown"]').click();
    cy.get('[data-testid="study-card"]').click();
    cy.get('[data-testid="btn-unknown"]').click();

    cy.get('[data-testid="retry-button"]').click();

    // Wraca do trybu nauki z 2 kartami
    cy.get('[data-testid="study-card"]').should('be.visible');
    cy.contains('1 / 2').should('be.visible');
  });
});
