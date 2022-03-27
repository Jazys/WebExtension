/* eslint-disable no-console */
import { onMessage, sendMessage } from 'webext-bridge'
import { createApp } from 'vue'
import App from './views/App.vue'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[vitesse-webext] Hello world from content script')

  // communication example: send previous tab title from background page
  onMessage('tab-prev', ({ data }) => {
    console.log(`[vitesse-webext] Navigate from page "${data.title}"`)
    console.log(document.all[0].outerHTML)
    browser.runtime.sendMessage({ from: 'get-current-tab', message: document.all[0].outerHTML })
  })

  // to get message from extension panel
  browser.runtime.onMessage.addListener(async(msg, sender, sendResponse) => {
    // If the received message has the expected format...
    console.log('something happening from the extension')
    console.log(msg)
    if (msg.message === 'changeBgColor') {
      // depreceated way
      await sendResponse(document.all[0].outerHTML)
      // the recommandeest way
      // browser.runtime.sendMessage({ from: 'get-current-tab', message: document.all[0].outerHTML })
      document.body.style.backgroundColor = 'green'
    }
  })

  // mount component to context window
  const container = document.createElement('div')
  const root = document.createElement('div')
  const styleEl = document.createElement('link')
  const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
  styleEl.setAttribute('rel', 'stylesheet')
  styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
  shadowDOM.appendChild(styleEl)
  shadowDOM.appendChild(root)
  document.body.appendChild(container)
  createApp(App).mount(root)
})()
