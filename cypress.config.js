import { defineConfig } from 'cypress';
import { createClient } from '@supabase/supabase-js';
import { RELEASES } from './src/config/whatsNew.js';

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
      // service role omija RLS — tylko do przygotowania/sprzątania danych testowych
      const admin = createClient(
        config.env.SUPABASE_URL,
        config.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { persistSession: false } },
      );

      const userIds = new Map();
      async function userIdByEmail(email) {
        if (userIds.has(email)) return userIds.get(email);
        const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
        if (error) throw new Error(error.message);
        const user = data.users.find((u) => u.email === email);
        if (!user) throw new Error(`Brak użytkownika ${email} w Supabase Auth`);
        userIds.set(email, user.id);
        return user.id;
      }

      on('task', {
        async cleanupDeck({ deckTitle }) {
          const { error } = await admin
            .from('decks')
            .delete()
            .eq('title', deckTitle);
          if (error) throw new Error(error.message);
          return null;
        },

        // usuwa foldery (i kaskadowo notatki) o nazwie zaczynającej się od prefix
        async cleanupFolders({ prefix }) {
          const { error } = await admin
            .from('folders')
            .delete()
            .like('name', `${prefix}%`);
          if (error) throw new Error(error.message);
          return null;
        },

        // tworzy folder z notatkami dla wskazanego usera, zwraca { folderId }
        // notes: [{ title, content, source_name? }] — position = indeks w tablicy
        async seedFolderWithNotes({ email, name, notes = [] }) {
          const userId = await userIdByEmail(email);
          const { data: folder, error } = await admin
            .from('folders')
            .insert({ name, user_id: userId })
            .select()
            .single();
          if (error) throw new Error(error.message);
          if (notes.length > 0) {
            const { error: notesError } = await admin.from('notes').insert(
              notes.map((n, i) => ({
                user_id: userId,
                folder_id: folder.id,
                title: n.title,
                content: n.content ?? '',
                source_name: n.source_name ?? `${n.title}.md`,
                source_type: 'markdown',
                position: i,
              })),
            );
            if (notesError) throw new Error(notesError.message);
          }
          return { folderId: folder.id };
        },

        async getFolderById({ folderId }) {
          const { data, error } = await admin
            .from('folders')
            .select('*, notes(*)')
            .eq('id', folderId)
            .maybeSingle();
          if (error) throw new Error(error.message);
          return data;
        },

        // okno "What's new" — oznacz najnowszy wpis jako widziany, żeby nie zasłaniało testów
        async markWhatsNewSeen({ emails }) {
          for (const email of emails) {
            const userId = await userIdByEmail(email);
            const { error } = await admin
              .from('profiles')
              .update({ last_seen_release: RELEASES[0].id })
              .eq('id', userId);
            // 42703 = brak kolumny (migracja niewgrana) — wtedy okno i tak się nie pokaże
            if (error && error.code !== '42703') throw new Error(error.message);
          }
          return null;
        },

        async resetWhatsNew({ email }) {
          const userId = await userIdByEmail(email);
          const { error } = await admin
            .from('profiles')
            .update({ last_seen_release: null })
            .eq('id', userId);
          if (error) throw new Error(error.message);
          return null;
        },

        async getLastSeenRelease({ email }) {
          const userId = await userIdByEmail(email);
          const { data, error } = await admin
            .from('profiles')
            .select('last_seen_release')
            .eq('id', userId)
            .single();
          if (error) throw new Error(error.message);
          return data.last_seen_release;
        },
      });
    },
  },
});
