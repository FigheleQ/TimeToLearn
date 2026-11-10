import { createClient } from '@supabase/supabase-js';

// cy.login(email, password) — loguje przez Supabase SDK (pomija formularz UI).
// Sesja jest cachowana przez cy.session(), więc powtórne wywołanie z tymi samymi
// danymi nie robi nowego requestu — przywraca stan localStorage z poprzedniego razu.
Cypress.Commands.add('login', (email, password) => {
  cy.session(
    [email, password],
    () => {
      cy.visit('/login');
      cy.window().then(async (win) => {
        const supabase = createClient(
          Cypress.env('SUPABASE_URL'),
          Cypress.env('SUPABASE_ANON_KEY'),
          { auth: { storage: win.localStorage } },
        );
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw new Error(error.message);
      });
    },
    {
      validate() {
        cy.window().then((win) => {
          const hasSession = Object.keys(win.localStorage).some((k) =>
            k.includes('auth-token'),
          );
          expect(hasSession, 'session in localStorage').to.be.true;
        });
      },
    },
  );
});
