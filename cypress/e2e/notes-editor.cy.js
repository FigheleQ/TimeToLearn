// Edytor notatek WYSIWYG (TipTap)
const PREFIX = '[cy-editor]';
const RUN = Date.now();
const name = (label) => `${PREFIX} ${label} ${RUN}`;
const email = () => Cypress.env('USER_A_EMAIL');

// seed folderu z jedną notatką → wejście prosto do edytora
function openEditor(label, note) {
  return cy
    .task('seedFolderWithNotes', { email: email(), name: name(label), notes: [note] })
    .then(({ folderId }) => {
      cy.visit(`/notes/${folderId}`);
      cy.get('[data-testid="edit-note-button"]').first().click();
      cy.url().should('match', /\/notes\/[a-f0-9-]+\/[a-f0-9-]+\/edit$/);
      cy.get('[data-testid="note-editor-content"]', { timeout: 15000 }).should('be.visible');
      return cy.wrap(folderId);
    });
}

const editorContent = () => cy.get('[data-testid="note-editor-content"]');

// zaznacz całą treść edytora (Ctrl+A w contenteditable ProseMirror)
const selectAll = () => editorContent().click().type('{selectall}');

describe('Edytor notatek — otwieranie i bezpieczeństwo', () => {
  beforeEach(() => cy.login(email(), Cypress.env('USER_A_PASSWORD')));
  after(() => cy.task('cleanupFolders', { prefix: PREFIX }));

  it('przycisk „Edytuj” otwiera edytor z tytułem notatki', () => {
    openEditor('otwieranie', { title: 'Notatka do edycji', content: 'treść' });
    cy.get('[data-testid="note-title-input"]').should('have.value', 'Notatka do edycji');
    cy.get('[data-testid="editor-toolbar"]').should('be.visible');
  });

  it('notatka Markdown otwiera się jako sformatowany tekst (nie surowe znaczniki)', () => {
    openEditor('markdown', { title: 'MD', content: '# Nagłówek\n\nTekst z **pogrubieniem** i listą:\n\n- jeden\n- dwa' });
    editorContent().find('h1').should('contain', 'Nagłówek');
    editorContent().find('strong').should('contain', 'pogrubieniem');
    editorContent().find('li').should('have.length', 2);
    editorContent().should('not.contain', '**');
  });

  it('HTML notatki jest sanitizowany: brak skryptów i niebezpiecznych stylów', () => {
    openEditor('xss', {
      title: 'XSS',
      content_format: 'html',
      content:
        '<p>ok <span style="color: #7c5cff; position: fixed; top: 0">kolor</span></p>' +
        '<img src=x onerror="window.__xss=1"><script>window.__xss=1</script>',
    });
    editorContent().should('contain', 'ok');
    editorContent().find('script').should('not.exist');
    editorContent().find('[onerror]').should('not.exist');
    cy.window().its('__xss').should('be.undefined');

    cy.get('[data-testid="cancel-edit-button"]').click();
    cy.get('[data-testid="open-chapter-button"]').click();
    cy.get('[data-testid="chapter-content"] span')
      .should('have.attr', 'style')
      .and('contain', 'color')
      .and('not.contain', 'position');
  });

  it('nie pokazuje cudzej / nieistniejącej notatki', () => {
    cy.visit('/notes/00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000/edit');
    cy.get('[data-testid="note-not-found"]', { timeout: 15000 }).should('be.visible');
  });
});

describe('Edytor notatek — formatowanie i zapis', () => {
  beforeEach(() => cy.login(email(), Cypress.env('USER_A_PASSWORD')));
  after(() => cy.task('cleanupFolders', { prefix: PREFIX }));

  it('pogrubienie, kolor i zakreślacz z paska trafiają do zapisanej notatki i Rozdziału', () => {
    openEditor('formatowanie', { title: 'Stary tytuł', content: 'stara treść' });

    cy.get('[data-testid="note-title-input"]').clear().type('Nowy tytuł');
    selectAll();
    editorContent().type('Ważne zdanie');

    selectAll();
    cy.get('[data-testid="toolbar-bold"]').click();
    cy.get('[data-testid="toolbar-bold"]').should('have.attr', 'aria-pressed', 'true');
    cy.get('[data-testid="toolbar-color-0"]').click();
    cy.get('[data-testid="toolbar-highlight-0"]').click();

    editorContent().find('strong').should('contain', 'Ważne zdanie');
    editorContent().find('span[style*="color"]').should('exist');
    editorContent().find('mark').should('exist');

    cy.get('[data-testid="save-note-button"]').click();
    cy.url().should('match', /\/notes\/[a-f0-9-]+$/);
    cy.get('[data-testid="note-title"]').should('have.text', 'Nowy tytuł');

    cy.get('[data-testid="open-chapter-button"]').click();
    cy.get('[data-testid="chapter-content"] h2').should('contain', 'Nowy tytuł');
    cy.get('[data-testid="chapter-content"] strong').should('contain', 'Ważne zdanie');
    cy.get('[data-testid="chapter-content"] span[style*="color"]').should('exist');
    cy.get('[data-testid="chapter-content"] mark').should('exist');
  });

  it('nagłówek, lista i cytat z paska', () => {
    openEditor('bloki', { title: 'Bloki', content: 'linia' });
    editorContent().click();
    cy.get('[data-testid="toolbar-h2"]').click();
    editorContent().find('h2').should('contain', 'linia');
    cy.get('[data-testid="toolbar-h2"]').click();
    editorContent().find('h2').should('not.exist');

    cy.get('[data-testid="toolbar-bulletList"]').click();
    editorContent().find('ul li').should('contain', 'linia');
    cy.get('[data-testid="toolbar-bulletList"]').click();

    cy.get('[data-testid="toolbar-blockquote"]').click();
    editorContent().find('blockquote').should('contain', 'linia');
  });

  it('niezapisane zmiany: wskaźnik i pytanie przy Anuluj', () => {
    openEditor('dirty', { title: 'Czysta', content: 'bez zmian' });
    cy.get('[data-testid="unsaved-indicator"]').should('not.exist');

    editorContent().click().type(' dopisek');
    cy.get('[data-testid="unsaved-indicator"]').should('be.visible');

    cy.get('[data-testid="cancel-edit-button"]').click();
    cy.get('[data-testid="discard-changes-modal"]').should('be.visible');
    cy.get('[data-testid="discard-changes-modal-cancel"]').click();
    cy.url().should('match', /\/edit$/);

    cy.get('[data-testid="cancel-edit-button"]').click();
    cy.get('[data-testid="discard-changes-modal-confirm"]').click();
    cy.url().should('match', /\/notes\/[a-f0-9-]+$/);
    cy.get('[data-testid="note-preview"]').should('not.contain', 'dopisek');
  });

  it('pusty tytuł nie zostaje zapisany', () => {
    openEditor('pusty tytul', { title: 'Tytuł', content: 'x' });
    cy.get('[data-testid="note-title-input"]').clear();
    cy.get('[data-testid="save-note-button"]').click();
    cy.get('[data-testid="error-box"]').should('contain', 'Tytuł');
    cy.url().should('match', /\/edit$/);
  });
});
