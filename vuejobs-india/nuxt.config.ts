// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  runtimeConfig: {
    databaseUrl: "",
    betterAuth: {
      secret: "",
      url: "",
    },
    smtp: {
      host: "localhost",
      port: "1025",
      user: "",
      pass: "",
      from: '"VueJobs India" <noreply@vuejobs.in>',
    },
  },
  routeRules: {
    "/docs/**":{
      ssr: false,
      
    }
  },
  modules: ["@scalar/nuxt", "./modules/openapi"],
  scalar: {
    spec: {
      url: "/openapi.json",
    },
  },
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
       include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
      ],
      exclude: ["web-worker"],
    },
  },
});
