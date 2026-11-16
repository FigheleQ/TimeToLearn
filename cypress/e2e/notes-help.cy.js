// Pomoc modułu Notatki: panel na liście folderów + przycisk „?” w folderze i edytorze
const PREFIX = '[cy-help]';
const email = () => Cypress.env('USER_A_EMAIL');

describe('Notatki — pomoc „Jak korzystać”', () => {
  let folderId;

  before(() => {
    cy.task('seedFolderWithNotes', {
      email: email(),
      name: `${PREFIX} ${Date.now()}`,
      notes: [{ title: 'Pierwsza', content: 'treść' }],
    }).then((res) => { folderId = res.folderId; });
  });
  beforeEach(() => cy.login(email(), Cypress.env('USER_A_PASSWORD')));
  after(() => cy.task('cleanupFolders', { prefix: PREFIX }));

  it('panel na liście folderów pokazuje wszystkie sekcje i da się go zwinąć (zapamiętane)', () => {
    cy.visit('/notes');
    // konto testowe ma foldery → domyślnie zwinięty; rozwijamy ręcznie
    cy.clearLocalStorage('ttl:notes-help-collapsed');
    cy.reload();
    cy.get('[data-testid="notes-help-toggle"]').should('have.attr', 'aria-expanded', 'false').click();
    cy.get('[data-testid="notes-help-content"]').should('be.visible');
    cy.get('[data-testid="notes-help-section"]').should('have.length.at.least', 5);
    cy.get('[data-testid="notes-help-content"]').should('contain', 'Import plików').and('contain', 'Edycja notatki');

    cy.get('[data-testid="notes-help-toggle"]').click();
    cy.get('[data-testid="notes-help-content"]').should('not.exist');
    cy.reload();
    cy.get('[data-testid="notes-help-toggle"]').should('have.attr', 'aria-expanded', 'false');
    cy.get('[data-testid="notes-help-content"]').should('not.exist');

    cy.get('[data-testid="notes-help-toggle"]').click();
    cy.get('[data-testid="notes-help-content"]').should('be.visible');
  });

  it('przycisk „?” w folderze otwiera pomoc zaczynając od importu', () => {
    cy.visit(`/notes/${folderId}`);
    cy.get('[data-testid="notes-help-button"]').click();
    cy.get('[data-testid="notes-help-modal"]').should('be.visible');
    cy.get('[data-testid="notes-help-section"]').first().should('contain', 'Import plików');
    cy.get('[data-testid="notes-help-modal-confirm"]').click();
    cy.get('[data-testid="notes-help-modal"]').should('not.exist');
  });

  it('przycisk „?” w edytorze zaczyna od opisu edycji', () => {
    cy.visit(`/notes/${folderId}`);
    cy.get('[data-testid="edit-note-button"]').first().click();
    cy.get('[data-testid="note-editor-content"]', { timeout: 15000 }).should('be.visible');
    cy.get('[data-testid="notes-help-button"]').click();
    cy.get('[data-testid="notes-help-section"]').first().should('contain', 'Edycja notatki');
  });
});
