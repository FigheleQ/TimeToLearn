// Układ na telefonie, tablecie i komputerze
const PHONE = [390, 844];
const TABLET = [820, 1180];
const DESKTOP = [1280, 800];
const PREFIX = '[cy-responsive]';
const email = () => Cypress.env('USER_A_EMAIL');

// strona nie może przewijać się na boki
const expectNoHorizontalScroll = () =>
  cy.document().then((doc) => {
    const el = doc.documentElement;
    expect(el.scrollWidth, 'szerokość strony').to.be.at.most(el.clientWidth);
  });

describe('Responsywność — telefon', () => {
  let folderId;

  before(() => {
    cy.task('seedFolderWithNotes', {
      email: email(),
      name: `${PREFIX} ${Date.now()}`,
      notes: [{ title: 'A' }, { title: 'B' }, { title: 'C' }],
    }).then((r) => { folderId = r.folderId; });
  });
  beforeEach(() => {
    cy.viewport(...PHONE);
    cy.login(email(), Cypress.env('USER_A_PASSWORD'));
  });
  after(() => cy.task('cleanupFolders', { prefix: PREFIX }));

  it('żadna główna strona nie przewija się w poziomie', () => {
    ['/', '/habits', '/flashcards', '/notes', `/notes/${folderId}`, `/notes/${folderId}/chapter`].forEach((path) => {
      cy.visit(path);
      cy.contains('Ładowanie').should('not.exist');
      expectNoHorizontalScroll();
    });
  });

  it('menu boczne wysuwa się z ☰, a wybór sekcji przechodzi do niej i zamyka menu', () => {
    cy.visit('/');
    cy.get('[data-testid="nav-drawer-root"]').should('have.attr', 'aria-hidden', 'true');
    cy.get('[data-testid="sidebar-toggle"]').click();
    cy.get('[data-testid="nav-drawer-root"]').should('have.attr', 'aria-hidden', 'false');
    cy.get('[data-testid="nav-drawer"]').contains('button', 'Notatki').click();
    cy.url().should('match', /\/notes$/);
    cy.get('[data-testid="nav-drawer-root"]').should('have.attr', 'aria-hidden', 'true');
  });

  it('menu zamyka się kliknięciem w tło i klawiszem Esc', () => {
    cy.visit('/');
    cy.get('[data-testid="sidebar-toggle"]').click();
    cy.get('[data-testid="nav-drawer-backdrop"]').click('right', { force: true });
    cy.get('[data-testid="nav-drawer-root"]').should('have.attr', 'aria-hidden', 'true');

    cy.get('[data-testid="sidebar-toggle"]').click();
    cy.get('body').type('{esc}');
    cy.get('[data-testid="nav-drawer-root"]').should('have.attr', 'aria-hidden', 'true');
  });

  it('widżety otwierają się w panelu z prawej', () => {
    cy.visit('/');
    cy.get('[data-testid="widgets-button"]').click();
    cy.get('[data-testid="widgets-drawer-root"]').should('have.attr', 'aria-hidden', 'false');
    cy.get('[data-testid="widgets-drawer"]').should('contain', 'Pomodoro');
    cy.get('[data-testid="widgets-drawer-close"]').click();
    cy.get('[data-testid="widgets-drawer-root"]').should('have.attr', 'aria-hidden', 'true');
  });

  it('wyszukiwarka chowa się pod lupą', () => {
    cy.visit('/');
    cy.get('[data-testid="topbar-search-input"]').should('not.exist');
    cy.get('[data-testid="topbar-search-button"]').click();
    cy.get('[data-testid="topbar-search-input"]').should('be.visible');
  });

  it('pola formularzy mają ≥16px (iOS nie powiększa strony przy pisaniu)', () => {
    cy.visit('/notes');
    cy.get('[data-testid="new-folder-button"]').click();
    cy.get('[data-testid="folder-name-input"]').should('have.css', 'font-size', '16px');
  });

  it('kolejność notatek zmienia się strzałkami ↑ ↓ i zostaje po odświeżeniu', () => {
    cy.visit(`/notes/${folderId}`);
    cy.get('[data-testid="note-item"]').should('have.length', 3).first().should('not.have.attr', 'draggable', 'true');
    cy.get('[data-testid="move-note-up"]').first().should('be.disabled');
    cy.get('[data-testid="move-note-down"]').last().should('be.disabled');

    cy.intercept('PATCH', '**/rest/v1/notes*').as('savePosition');
    cy.get('[data-testid="move-note-down"]').first().click();
    cy.get('[data-testid="note-title"]').should(($t) => {
      expect([...$t].map((e) => e.innerText.trim())).to.deep.equal(['B', 'A', 'C']);
    });
    cy.wait(['@savePosition', '@savePosition']);
    cy.reload();
    cy.get('[data-testid="note-title"]').should(($t) => {
      expect([...$t].map((e) => e.innerText.trim())).to.deep.equal(['B', 'A', 'C']);
    });
  });
});

describe('Responsywność — tablet i komputer', () => {
  beforeEach(() => cy.login(email(), Cypress.env('USER_A_PASSWORD')));

  it('tablet: sidebar zwinięty do ikon, widżety pod przyciskiem, bez przewijania w bok', () => {
    cy.viewport(...TABLET);
    cy.visit('/');
    cy.get('aside').contains('Pulpit').should('not.exist'); // same ikony, bez podpisów
    cy.get('[data-testid="widgets-button"]').should('be.visible');
    cy.get('[data-testid="sidebar-toggle"]').click();
    cy.get('aside').contains('Pulpit').should('be.visible'); // rozwinięty na żądanie
    expectNoHorizontalScroll();
  });

  it('komputer: pełny sidebar i kolumna widżetów jak dotąd', () => {
    cy.viewport(...DESKTOP);
    cy.visit('/');
    cy.get('aside').contains('Pulpit').should('be.visible');
    cy.get('[data-testid="widgets-button"]').should('not.exist');
    cy.contains('Pomodoro').should('be.visible');
    cy.get('[data-testid="topbar-search-input"]').should('be.visible');
  });
});
