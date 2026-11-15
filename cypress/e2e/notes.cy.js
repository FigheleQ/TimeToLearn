// Moduł Notatki → Rozdział (etap 1)
// Foldery testowe mają prefiks PREFIX — after() sprząta je przez service role.
const PREFIX = '[cy-notes]';
const RUN = Date.now();
const name = (label) => `${PREFIX} ${label} ${RUN}`;
const FX = 'cypress/fixtures/notes';

const USER_A = () => [Cypress.env('USER_A_EMAIL'), Cypress.env('USER_A_PASSWORD')];

// pusty (albo z notatkami) folder usera A → od razu wchodzimy do jego widoku
function seedAndOpen(label, notes = []) {
  return cy
    .task('seedFolderWithNotes', { email: Cypress.env('USER_A_EMAIL'), name: name(label), notes })
    .then(({ folderId }) => {
      cy.visit(`/notes/${folderId}`);
      cy.get('[data-testid="folder-title"]').should('contain', name(label));
      return cy.wrap(folderId);
    });
}

const importFiles = (files) =>
  cy.get('[data-testid="file-input"]').selectFile(files, { force: true });

// asercja z ponawianiem (should + callback), bo stan listy zmienia się asynchronicznie
const expectTitles = (expected) =>
  cy.get('[data-testid="note-title"]').should(($els) => {
    expect([...$els].map((el) => el.innerText.trim())).to.deep.equal(expected);
  });

describe('Notatki — foldery (CRUD)', () => {
  const FOLDER = name('crud');
  const RENAMED = name('crud po zmianie');

  beforeEach(() => {
    cy.login(...USER_A());
    cy.visit('/notes');
  });

  after(() => cy.task('cleanupFolders', { prefix: PREFIX }));

  it('link „Notatki” w nawigacji prowadzi do listy folderów', () => {
    cy.visit('/');
    cy.contains('button', 'Notatki').click();
    cy.url().should('match', /\/notes$/);
    cy.get('[data-testid="new-folder-button"]').should('be.visible');
  });

  it('tworzy folder', () => {
    cy.get('[data-testid="new-folder-button"]').click();
    cy.get('[data-testid="folder-name-input"]').type(FOLDER);
    cy.get('[data-testid="create-folder-button"]').click();
    cy.contains('[data-testid="folder-card"]', FOLDER).should('be.visible');
  });

  it('zmienia nazwę folderu (trwale)', () => {
    cy.contains('[data-testid="folder-card"]', FOLDER).within(() => {
      cy.get('[data-testid="rename-folder-button"]').click();
      cy.get('[data-testid="rename-folder-input"]').clear().type(RENAMED);
      cy.get('[data-testid="save-folder-name-button"]').click();
    });
    cy.contains('[data-testid="folder-name"]', RENAMED).should('be.visible');
    cy.reload();
    cy.contains('[data-testid="folder-name"]', RENAMED).should('be.visible');
  });

  it('usuwa folder dopiero po potwierdzeniu', () => {
    cy.contains('[data-testid="folder-card"]', RENAMED)
      .find('[data-testid="delete-folder-button"]')
      .click();
    cy.get('[data-testid="delete-folder-modal"]').should('be.visible');
    cy.get('[data-testid="delete-folder-modal-cancel"]').click();
    cy.get('[data-testid="delete-folder-modal"]').should('not.exist');
    cy.contains('[data-testid="folder-card"]', RENAMED).should('exist');

    cy.contains('[data-testid="folder-card"]', RENAMED)
      .find('[data-testid="delete-folder-button"]')
      .click();
    cy.get('[data-testid="delete-folder-modal-confirm"]').click();
    cy.contains('[data-testid="folder-card"]', RENAMED).should('not.exist');
    cy.reload();
    cy.contains('[data-testid="folder-card"]', RENAMED).should('not.exist');
  });
});

describe('Notatki — import', () => {
  beforeEach(() => cy.login(...USER_A()));
  after(() => cy.task('cleanupFolders', { prefix: PREFIX }));

  it('importuje wiele plików .md/.txt i pokazuje listę pominiętych', () => {
    seedAndOpen('import wiele');
    importFiles([`${FX}/wstep.md`, `${FX}/rozwiniecie.txt`, `${FX}/obraz.png`]);

    cy.get('[data-testid="note-item"]').should('have.length', 2);
    cy.get('[data-testid="note-title"]').should('contain', 'wstep').and('contain', 'rozwiniecie');
    cy.get('[data-testid="skipped-list"]').should('be.visible');
    cy.get('[data-testid="skipped-item"]').should('have.length', 1).and('contain', 'obraz.png');

    cy.reload();
    cy.get('[data-testid="note-item"]').should('have.length', 2);
  });

  it('importuje cały katalog (input webkitdirectory)', () => {
    seedAndOpen('import katalog');
    cy.get('[data-testid="folder-input"]').should('have.attr', 'webkitdirectory');
    cy.get('[data-testid="folder-input"]').selectFile(
      [`${FX}/wstep.md`, `${FX}/zakonczenie.md`, `${FX}/obraz.png`],
      { force: true },
    );
    cy.get('[data-testid="note-item"]').should('have.length', 2);
    cy.get('[data-testid="skipped-item"]').should('contain', 'obraz.png');
  });

  it('odrzuca plik większy niż 1 MB z czytelnym komunikatem', () => {
    seedAndOpen('import limit');
    importFiles({
      contents: Cypress.Buffer.alloc(1024 * 1024 + 1, 'a'),
      fileName: 'duzy.txt',
      mimeType: 'text/plain',
    });
    cy.get('[data-testid="skipped-item"]').should('contain', 'duzy.txt').and('contain', '1 MB');
    cy.get('[data-testid="notes-empty"]').should('be.visible');
  });

  it('ponowny import tej samej nazwy nadpisuje notatkę po potwierdzeniu (bez duplikatu)', () => {
    seedAndOpen('import nadpisanie');
    importFiles([`${FX}/wstep.md`, `${FX}/rozwiniecie.txt`]);
    cy.get('[data-testid="note-item"]').should('have.length', 2);

    importFiles({
      contents: Cypress.Buffer.from('# Wstęp\n\nNowa treść wstępu.'),
      fileName: 'wstep.md',
    });
    cy.get('[data-testid="overwrite-modal"]').should('be.visible');
    cy.get('[data-testid="overwrite-item"]').should('have.length', 1).and('contain', 'wstep.md');
    cy.get('[data-testid="overwrite-modal-confirm"]').click();

    cy.get('[data-testid="note-item"]').should('have.length', 2);
    cy.contains('[data-testid="note-item"]', 'wstep')
      .find('[data-testid="note-preview"]')
      .should('contain', 'Nowa treść wstępu');
    // nadpisana notatka zostaje na swoim miejscu (pierwsza)
    expectTitles(['wstep', 'rozwiniecie']);

    cy.reload();
    cy.get('[data-testid="note-item"]').should('have.length', 2);
    cy.contains('[data-testid="note-item"]', 'wstep')
      .find('[data-testid="note-preview"]')
      .should('contain', 'Nowa treść wstępu');
  });

  it('„Pomiń” w modalu zostawia starą treść i dopisuje plik do pominiętych', () => {
    seedAndOpen('import pomin');
    importFiles(`${FX}/wstep.md`);
    cy.get('[data-testid="note-item"]').should('have.length', 1);

    importFiles([
      { contents: Cypress.Buffer.from('zmieniona treść'), fileName: 'wstep.md' },
      `${FX}/zakonczenie.md`,
    ]);
    cy.get('[data-testid="overwrite-modal-cancel"]').click();

    cy.get('[data-testid="note-item"]').should('have.length', 2);
    cy.contains('[data-testid="note-item"]', 'wstep')
      .find('[data-testid="note-preview"]')
      .should('not.contain', 'zmieniona treść');
    cy.get('[data-testid="skipped-item"]').should('contain', 'wstep.md');
  });
});

describe('Notatki — kolejność (drag & drop)', () => {
  beforeEach(() => cy.login(...USER_A()));
  after(() => cy.task('cleanupFolders', { prefix: PREFIX }));

  it('przeciągnięcie zmienia kolejność i zapisuje ją w bazie', () => {
    seedAndOpen('kolejnosc', [
      { title: 'A', content: 'pierwsza' },
      { title: 'B', content: 'druga' },
      { title: 'C', content: 'trzecia' },
    ]);
    expectTitles(['A', 'B', 'C']);

    const dataTransfer = new DataTransfer();
    cy.get('[data-testid="note-item"]').eq(0).trigger('dragstart', { dataTransfer });
    cy.get('[data-testid="note-item"]').eq(2)
      .trigger('dragover', { dataTransfer })
      .trigger('drop', { dataTransfer });
    cy.get('[data-testid="note-item"]').eq(0).trigger('dragend', { dataTransfer });

    expectTitles(['B', 'C', 'A']);
    cy.reload();
    expectTitles(['B', 'C', 'A']);
  });
});

describe('Notatki — Rozdział i eksport', () => {
  const CHAPTER = name('rozdzial');
  const notes = [
    { title: 'Wstęp', content: 'Tekst z **pogrubieniem**.' },
    { title: 'Rozwinięcie', content: '- punkt 1\n- punkt 2' },
    {
      title: 'Niebezpieczna',
      content: 'ok <img src=x onerror="window.__xss=1"><script>window.__xss=1</script>',
    },
  ];
  let folderId;

  before(() => {
    cy.task('seedFolderWithNotes', { email: Cypress.env('USER_A_EMAIL'), name: CHAPTER, notes })
      .then((res) => { folderId = res.folderId; });
  });
  beforeEach(() => cy.login(...USER_A()));
  after(() => cy.task('cleanupFolders', { prefix: PREFIX }));

  it('skleja notatki w kolejności, z tytułem jako nagłówkiem, i renderuje Markdown', () => {
    cy.visit(`/notes/${folderId}/chapter`);
    cy.get('[data-testid="chapter-content"] h1').should('contain', CHAPTER);
    cy.get('[data-testid="chapter-content"] h2').then(($h) => {
      expect([...$h].map((h) => h.innerText.trim())).to.deep.equal(['Wstęp', 'Rozwinięcie', 'Niebezpieczna']);
    });
    cy.get('[data-testid="chapter-content"] strong').should('contain', 'pogrubieniem');
    cy.get('[data-testid="chapter-content"] li').should('have.length', 2);
  });

  it('sanitizuje HTML z treści notatki (brak XSS)', () => {
    cy.visit(`/notes/${folderId}/chapter`);
    cy.get('[data-testid="chapter-content"]').should('contain', 'ok');
    cy.get('[data-testid="chapter-content"] script').should('not.exist');
    cy.get('[data-testid="chapter-content"] [onerror]').should('not.exist');
    cy.window().its('__xss').should('be.undefined');
  });

  it('eksportuje Rozdział do .md', () => {
    cy.visit(`/notes/${folderId}/chapter`);
    cy.get('[data-testid="export-md-button"]').click();
    cy.readFile(`cypress/downloads/${CHAPTER}.md`).then((md) => {
      expect(md).to.match(new RegExp(`^# ${Cypress._.escapeRegExp(CHAPTER)}`));
      expect(md.indexOf('## Wstęp')).to.be.lessThan(md.indexOf('## Rozwinięcie'));
      expect(md).to.contain('Tekst z **pogrubieniem**.');
    });
  });

  it('wyeksportowany plik importuje się z powrotem jako jedna notatka', () => {
    seedAndOpen('reimport');
    importFiles(`cypress/downloads/${CHAPTER}.md`);
    cy.get('[data-testid="note-item"]').should('have.length', 1);
    cy.get('[data-testid="note-title"]').should('have.text', CHAPTER);
    cy.get('[data-testid="note-preview"]').should('contain', `# ${CHAPTER}`);
  });
});
