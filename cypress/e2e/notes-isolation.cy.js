// Izolacja danych notatek między użytkownikami (RLS na folders / notes)
import { createClient } from '@supabase/supabase-js';

const PREFIX = '[cy-isolation]';
const FOLDER_A = `${PREFIX} folder A ${Date.now()}`;

// osobny klient zalogowany jako B — sprawdza politykę RLS bezpośrednio, z pominięciem UI
function asUserB(fn) {
  return cy.wrap(
    (async () => {
      const sb = createClient(Cypress.env('SUPABASE_URL'), Cypress.env('SUPABASE_ANON_KEY'), {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error } = await sb.auth.signInWithPassword({
        email: Cypress.env('USER_B_EMAIL'),
        password: Cypress.env('USER_B_PASSWORD'),
      });
      if (error) throw new Error(error.message);
      const result = await fn(sb);
      await sb.auth.signOut();
      return result;
    })(),
    { timeout: 15000 },
  );
}

describe('Notatki — izolacja danych między użytkownikami (RLS)', () => {
  let folderIdA;

  before(() => {
    cy.task('seedFolderWithNotes', {
      email: Cypress.env('USER_A_EMAIL'),
      name: FOLDER_A,
      notes: [{ title: 'Tajna notatka A', content: 'tylko dla A' }],
    }).then((res) => { folderIdA = res.folderId; });
  });

  after(() => cy.task('cleanupFolders', { prefix: PREFIX }));

  it('użytkownik A widzi swój folder', () => {
    cy.login(Cypress.env('USER_A_EMAIL'), Cypress.env('USER_A_PASSWORD'));
    cy.visit('/notes');
    cy.contains('[data-testid="folder-card"]', FOLDER_A).should('be.visible');
  });

  it('użytkownik B nie widzi folderu A na liście', () => {
    cy.login(Cypress.env('USER_B_EMAIL'), Cypress.env('USER_B_PASSWORD'));
    cy.visit('/notes');
    cy.get('[data-testid="new-folder-button"]').should('be.visible');
    cy.contains(FOLDER_A).should('not.exist');
  });

  it('użytkownik B nie otworzy folderu ani Rozdziału A po bezpośrednim URL', () => {
    cy.login(Cypress.env('USER_B_EMAIL'), Cypress.env('USER_B_PASSWORD'));
    cy.visit(`/notes/${folderIdA}`);
    cy.get('[data-testid="folder-not-found"]').should('be.visible');
    cy.contains('Tajna notatka A').should('not.exist');

    cy.visit(`/notes/${folderIdA}/chapter`);
    cy.get('[data-testid="folder-not-found"]').should('be.visible');
    cy.contains('tylko dla A').should('not.exist');
  });

  it('RLS: B nie czyta, nie zmienia, nie usuwa danych A i nie dopisze notatki do folderu A', () => {
    asUserB(async (sb) => {
      const folders = await sb.from('folders').select('*').eq('id', folderIdA);
      const notes = await sb.from('notes').select('*').eq('folder_id', folderIdA);
      const rename = await sb.from('folders').update({ name: 'hacked' }).eq('id', folderIdA).select();
      const remove = await sb.from('folders').delete().eq('id', folderIdA).select();
      const insert = await sb
        .from('notes')
        .insert({ folder_id: folderIdA, title: 'wstrzyknięta', content: 'x' })
        .select();
      return { folders, notes, rename, remove, insert };
    }).then(({ folders, notes, rename, remove, insert }) => {
      expect(folders.data, 'select folders').to.have.length(0);
      expect(notes.data, 'select notes').to.have.length(0);
      expect(rename.data, 'update folder').to.have.length(0);
      expect(remove.data, 'delete folder').to.have.length(0);
      expect(insert.error, 'insert do cudzego folderu').to.not.be.null;
      expect(insert.error.code).to.eq('42501'); // naruszenie polityki RLS
    });

    // dane A nietknięte
    cy.task('getFolderById', { folderId: folderIdA }).then((folder) => {
      expect(folder.name).to.eq(FOLDER_A);
      expect(folder.notes).to.have.length(1);
    });
  });
});
