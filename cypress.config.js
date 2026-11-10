import { defineConfig } from 'cypress';
import { createClient } from '@supabase/supabase-js';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    // Supabase Auth + zimny start Vite potrafią przekroczyć domyślne 4s
    defaultCommandTimeout: 8000,
    setupNodeEvents(on, config) {
      on('task', {
        async cleanupDeck({ deckTitle }) {
          const admin = createClient(
            config.env.SUPABASE_URL,
            config.env.SUPABASE_SERVICE_ROLE_KEY,
          );
          const { error } = await admin
            .from('decks')
            .delete()
            .eq('title', deckTitle);
          if (error) throw new Error(error.message);
          return null;
        },
      });
    },
  },
});
