// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: false,
  modules: [
    '@nuxtjs/ionic',
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    'nuxt-qrcode'
  ],
  css: ['~/assets/css/main.css'],
  app: {
    baseURL: './',
  },
  nitro: {
    prerender: {
      crawlLinks: true
    }
  },
  ui: {
    colorMode: false,
    global: true,
    primary: 'secondary',
    toaster: {
      slots: {
        viewport: 'p-4 flex flex-col gap-4 bg-transparent pt-[env(safe-area-inset-top)]'
      }
    },
  },
  ionic: {
    config: {
      mode: 'ios',
      animated: true
    },
    css: {
      core: true,
      basic: false,
      utilities: false
    },
    integrations: {
      router: true
    }
  },
  supabase: {
    types:false,
    redirect: false
  },
  runtimeConfig: {
    public: {
      supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    }
  }
})