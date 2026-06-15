// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  runtimeConfig: {
    dbDriver: '',
    dbHost: '',
    dbPort: '',
    dbUser: '',
    dbPassword: '',
    dbDatabase: '',
    databaseUrl: '',
  },
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: ["@iconify/vue", "@vue/devtools-kit", "@vue/devtools-core"],
    },
  },
});
