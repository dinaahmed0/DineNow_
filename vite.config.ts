import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    // Unique per `npm run dev` (or build) invocation — lets the app detect that
    // the dev server was restarted so it can discard any leftover session.
    // See src/lib/auth-session.ts (clearStaleDevSession).
    __DEV_SESSION_ID__: JSON.stringify(Date.now().toString()),
  },
})
