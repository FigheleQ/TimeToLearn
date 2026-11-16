// Reset hasła + wymagania mocnego hasła (checklista)
//
// Odpowiedzi Supabase dla wysyłki maila (/recover) i zmiany hasła (PUT /user) są podstawiane
// przez cy.intercept: test nie wysyła prawdziwych maili (limit kilku na godzinę)
// i nie zmienia hasła konta testowego.

const STRONG = 'Mocne#Haslo1';
const ruleOk = (id) => cy.get(`[data-testid="password-rule-${id}"]`).should('have.attr', 'data-ok', 'true');
const ruleNotOk = (id) => cy.get(`[data-testid="password-rule-${id}"]`).should('have.attr', 'data-ok', 'false');

describe('Hasło — checklista przy rejestracji', () => {
  beforeEach(() => {
    cy.clearAllLocalStorage();
    cy.visit('/register');
  });

  it('odhacza wymagania na żywo i blokuje przycisk, dopóki hasło jest słabe', () => {
    cy.get('[data-testid="register-email-input"]').type('nowy@example.com');
    cy.get('[data-testid="password-checklist"]').should('be.visible');
    ['length', 'upper', 'lower', 'digit', 'special', 'match'].forEach(ruleNotOk);
    cy.get('[data-testid="register-button"]').should('be.disabled');

    cy.get('[data-testid="register-password-input"]').type('haslo');
    ruleOk('lower');
    ['length', 'upper', 'digit', 'special'].forEach(ruleNotOk);

    cy.get('[data-testid="register-password-input"]').clear().type('Haslo123');
    ['length', 'upper', 'lower', 'digit'].forEach(ruleOk);
    ruleNotOk('special');
    cy.get('[data-testid="register-button"]').should('be.disabled');

    cy.get('[data-testid="register-password-input"]').clear().type(STRONG);
    ['length', 'upper', 'lower', 'digit', 'special'].forEach(ruleOk);

    cy.get('[data-testid="register-confirm-input"]').type('Inne#Haslo1');
    ruleNotOk('match');
    cy.get('[data-testid="register-button"]').should('be.disabled');

    cy.get('[data-testid="register-confirm-input"]').clear().type(STRONG);
    ruleOk('match');
    cy.get('[data-testid="register-button"]').should('not.be.disabled');
  });

  it('polskie znaki liczą się jako litery (Ż = wielka, ó = mała)', () => {
    cy.get('[data-testid="register-password-input"]').type('Żółw-ę12');
    ['length', 'upper', 'lower', 'digit', 'special'].forEach(ruleOk);
  });

  it('spacja nie jest znakiem specjalnym', () => {
    cy.get('[data-testid="register-password-input"]').type('Haslo123 ');
    ruleNotOk('special');
  });
});

describe('Hasło — „Nie pamiętasz hasła?”', () => {
  beforeEach(() => cy.clearAllLocalStorage());

  it('link na stronie logowania prowadzi do formularza resetu', () => {
    cy.visit('/login');
    cy.get('[data-testid="forgot-password-link"]').click();
    cy.url().should('include', '/forgot-password');
    cy.get('[data-testid="forgot-email-input"]').should('be.visible');
  });

  it('wysyła prośbę o link z adresem powrotu /reset-password i pokazuje potwierdzenie', () => {
    cy.intercept('POST', '**/auth/v1/recover*', { statusCode: 200, body: {} }).as('recover');
    cy.visit('/forgot-password');
    cy.get('[data-testid="forgot-email-input"]').type('ktos@example.com');
    cy.get('[data-testid="forgot-submit-button"]').click();

    cy.wait('@recover').then(({ request }) => {
      expect(request.body.email).to.eq('ktos@example.com');
      expect(decodeURIComponent(request.url)).to.contain('redirect_to=http://localhost:5173/reset-password');
    });
    cy.get('[data-testid="reset-email-sent"]').should('be.visible').and('contain', 'ktos@example.com');
  });

  it('przy limicie maili (429) pokazuje czytelny komunikat', () => {
    cy.intercept('POST', '**/auth/v1/recover*', {
      statusCode: 429,
      body: { error_code: 'over_email_send_rate_limit', msg: 'email rate limit exceeded' },
    }).as('recover');
    cy.visit('/forgot-password');
    cy.get('[data-testid="forgot-email-input"]').type('ktos@example.com');
    cy.get('[data-testid="forgot-submit-button"]').click();
    cy.wait('@recover');
    cy.get('[data-testid="forgot-error"]').should('contain', 'Odczekaj');
    cy.get('[data-testid="reset-email-sent"]').should('not.exist');
  });
});

describe('Hasło — ustawienie nowego hasła (/reset-password)', () => {
  it('bez sesji z linku pokazuje „link nieaktywny” i drogę do nowego linku', () => {
    cy.clearAllLocalStorage();
    cy.visit('/reset-password');
    cy.get('[data-testid="reset-link-invalid"]').should('be.visible');
    cy.contains('a', 'Wyślij nowy link').should('have.attr', 'href', '/forgot-password');
  });

  describe('z aktywną sesją', () => {
    beforeEach(() => {
      cy.login(Cypress.env('USER_A_EMAIL'), Cypress.env('USER_A_PASSWORD'));
      cy.visit('/reset-password');
    });

    it('wymaga mocnego i powtórzonego hasła, po zapisie przechodzi do aplikacji', () => {
      cy.intercept('PUT', '**/auth/v1/user*', (req) => {
        req.reply({
          statusCode: 200,
          body: {
            id: '00000000-0000-0000-0000-000000000001',
            aud: 'authenticated',
            role: 'authenticated',
            email: Cypress.env('USER_A_EMAIL'),
          },
        });
      }).as('updateUser');

      cy.contains(Cypress.env('USER_A_EMAIL')).should('be.visible');
      cy.get('[data-testid="reset-submit-button"]').should('be.disabled');

      cy.get('[data-testid="new-password-input"]').type('slabe');
      cy.get('[data-testid="confirm-password-input"]').type('slabe');
      cy.get('[data-testid="reset-submit-button"]').should('be.disabled');

      cy.get('[data-testid="new-password-input"]').clear().type(STRONG);
      cy.get('[data-testid="confirm-password-input"]').clear().type(STRONG);
      ['length', 'upper', 'lower', 'digit', 'special', 'match'].forEach(ruleOk);
      cy.get('[data-testid="reset-submit-button"]').should('not.be.disabled').click();

      cy.wait('@updateUser').its('request.body.password').should('eq', STRONG);
      cy.get('[data-testid="password-updated"]').should('be.visible');
      cy.get('[data-testid="go-to-app-button"]').click();
      cy.url().should('eq', Cypress.config('baseUrl') + '/');
    });

    it('to samo hasło co poprzednio → komunikat po polsku', () => {
      cy.intercept('PUT', '**/auth/v1/user*', {
        statusCode: 422,
        body: { error_code: 'same_password', msg: 'New password should be different from the old password.' },
      }).as('updateUser');

      cy.get('[data-testid="new-password-input"]').type(STRONG);
      cy.get('[data-testid="confirm-password-input"]').type(STRONG);
      cy.get('[data-testid="reset-submit-button"]').click();
      cy.wait('@updateUser');
      cy.get('[data-testid="reset-error"]').should('contain', 'musi się różnić');
      cy.get('[data-testid="password-updated"]').should('not.exist');
    });
  });
});
