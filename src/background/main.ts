import { sendMessage, onMessage } from 'webext-bridge'
import { Tabs } from 'webextension-polyfill'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

let previousTabId = 0

browser.runtime.onMessage.addListener(async(message: any, sender: Runtime.MessageSender) => {
  // To view console logs in a background page on Chrome,
  // you go to chrome://extensions/ and inspect views under your extension
  // browser.tabs.sendMessage(previousTabId, { from: 'report_back', message: 'get-current-tab' })
  console.log('Hello from background.js')
  console.log(`Message sent by: ${message.from}`)
},
)

// communication example: send previous tab title from background page
// send a message to currentTab Page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  }
  catch {
    return
  }
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

// to get the current name of tab (for example use in extension panel)
onMessage('get-current-tab', async() => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.title,
    }
  }
  catch {
    return {
      title: undefined,
    }
  }
})

// To get message from extension panel
onMessage('OpenTab', async({ data }) => {
  console.log(data)
  await browser.tabs.create(data)
  console.log('background receive data')
})
