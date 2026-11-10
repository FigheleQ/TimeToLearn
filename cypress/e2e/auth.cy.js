describe('Auth — logowanie przez formularz UI', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('pokazuje stronę logowania dla niezalogowanego użytkownika', () => {
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="login-button"]').should('be.visible');
  });

  it('pokazuje błąd przy złym haśle', () => {
    cy.get('[data-testid="email-input"]').type(Cypress.env('USER_A_EMAIL'));
    cy.get('[data-testid="password-input"]').type('zle-haslo-12345');
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="login-error"]').should('be.visible');
  });

  it('loguje się przez formularz i przekierowuje na dashboard', () => {
    cy.get('[data-testid="email-input"]').type(Cypress.env('USER_A_EMAIL'));
    cy.get('[data-testid="password-input"]').type(Cypress.env('USER_A_PASSWORD'));
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('zalogowany użytkownik przekierowywany z /login na /', () => {
    cy.login(Cypress.env('USER_A_EMAIL'), Cypress.env('USER_A_PASSWORD'));
    cy.visit('/login');
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });
});

describe('Auth — wylogowanie', () => {
  beforeEach(() => {
    cy.login(Cypress.env('USER_A_EMAIL'), Cypress.env('USER_A_PASSWORD'));
    // cy.session() zostawia pustą stronę — trzeba wejść do apki, żeby był Sidebar
    cy.visit('/');
  });

  it('wylogowuje i przekierowuje na /login', () => {
    cy.get('[data-testid="signout-button"]').click();
    cy.url().should('include', '/login');
  });

  it('po wylogowaniu chronione trasy znów przekierowują na /login', () => {
    cy.get('[data-testid="signout-button"]').click();
    // czekamy aż signOut skończy (redirect), inaczej visit wyprzedza czyszczenie sesji
    cy.url().should('include', '/login');
    cy.visit('/flashcards');
    cy.url().should('include', '/login');
  });
});
