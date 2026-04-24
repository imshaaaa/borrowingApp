export default defineNuxtPlugin(() => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/eruda'
    script.onload = () => {
      // @ts-ignore
      window.eruda.init({
        theme: 'dark',
        defaults: {
          displaySize: 50,
          activeTab: 'console'
        }
      })
      console.log('Eruda initialized successfully')
    }
    script.onerror = () => console.error('Eruda failed to load from CDN')
    //document.body.appendChild(script)
})