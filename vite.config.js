import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // TipTap + ProseMirror pakowane z góry, razem — inaczej Vite odkrywa je dopiero przy wejściu
  // na (lazy) stronę edytora, przebudowuje zależności i w przeglądarce lądują DWIE kopie
  // prosemirror-model (błąd "Cannot read properties of null (reading 'cached')")
  optimizeDeps: {
    include: [
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/extension-text-style',
      '@tiptap/extension-highlight',
      '@tiptap/pm/state',
      '@tiptap/pm/view',
      '@tiptap/pm/model',
    ],
  },
})
