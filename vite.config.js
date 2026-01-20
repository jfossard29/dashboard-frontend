import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    cors: {
      origin: ["http://localhost:8080","http://localhost:8081","http://localhost:8081"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true, // Ajout de cette ligne
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "application/json",
        "Set-Cookie" // Ajout de cet en-tête
      ],
    },
  },
})