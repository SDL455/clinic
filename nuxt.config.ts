export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: ["@nuxtjs/tailwindcss", "@nuxt/icon"],

  css: ["~/assets/css/main.css"],

  nitro: {
    preset: "static"
  },

  devServer: {
    port: 3000,
    host: "localhost"
  },

  app: {
    baseURL: '/clinic/',          
    buildAssetsDir: 'assets/',    
    
    head: {
      title: "Clinic Management System",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "ລະບົບຈັດການຄລີນິກທີ່ທັນສະໄໝ",
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@300;400;500;600;700&display=swap",
        },
      ],
    },
  },

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  },

  vite: {
    server: {
      hmr: {
        port: 24679,
        clientPort: 24679,
        protocol: 'ws',
        host: 'localhost'
      }
    }
  }
})
