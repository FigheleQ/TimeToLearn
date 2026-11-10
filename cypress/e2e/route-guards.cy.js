describe('Route guards — ochrona chronionych tras', () => {
  it('przekierowuje / → /login gdy brak sesji', () => {
    cy.clearAllLocalStorage();
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('przekierowuje /flashcards → /login gdy brak sesji', () => {
    cy.clearAllLocalStorage();
    cy.visit('/flashcards');
    cy.url().should('include', '/login');
  });

  it('przekierowuje /habits → /login gdy brak sesji', () => {
    cy.clearAllLocalStorage();
    cy.visit('/habits');
    cy.url().should('include', '/login');
  });

  it('zalogowany użytkownik wchodzi na / bez przekierowania', () => {
    cy.login(Cypress.env('USER_A_EMAIL'), Cypress.env('USER_A_PASSWORD'));
    cy.url().should('not.include', '/login');
  });
});
