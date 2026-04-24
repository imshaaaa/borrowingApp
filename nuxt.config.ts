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
    'nuxt-qrcode',
    'nuxt-charts'
  ],
  css: ['~/assets/css/main.css'],
  app: {
    baseURL: './',
    head: {
      meta: [
        { 
          name: 'viewport', 
          content: 'width=device-width, initial-scale=1, viewport-fit=cover' 
        }
      ]
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true
    }
  },
  ui: {
    colorMode: false,
    //global: true,
    //primary: 'secondary',
    // toast: {
    //   slots: {
    //     root: 'mt-calc(env(safe-area-inset-top) + 20px)'
    //   }
    // },
    // toast: {
    //   variants: {
    //     position: {
    //       'top-right': {
    //         viewport: 'top-50'
    //       }
    //     }
    //   }
    // }
  },
  ionic: {
    config: {
      mode: 'md',
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
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/', '/register']
    },
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 7, 
      sameSite: 'lax',
      secure: true
    }
  },
  runtimeConfig: {
    public: {
      supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    }
  },
  router: {
    options: {
      hashMode: false
    }
  }
})