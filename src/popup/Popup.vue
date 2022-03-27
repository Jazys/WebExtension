
<script setup lang="ts">
import { ethers } from 'ethers'
import { onMessage, sendMessage } from 'webext-bridge'
import { toRefs, defineProps, unref, ref, reactive } from 'vue'
import { storageDemo } from '~/logic/storage'

const state = reactive({
  title: 'None',
  contractNameDai: '',
  textSelect: '',
})

/**
 * To store and get value for extension
 */
browser.storage.sync.set({ key: 'test' })

browser.storage.sync.get(['key']).then((result) => {
  console.log(`Value currently is ${result.key}`)
})

browser.runtime.onMessage.addListener(async(message: any, sender: Runtime.MessageSender) => {
  // To view console logs in a background page on Chrome,
  // you go to chrome://extensions/ and inspect views under your extension
  console.log('Hello from background.js')
  if (message.from) {}
  console.log(`Message sent by: ${message.message}`)
},
)

function openOptionsPage() {
  browser.runtime.openOptionsPage()
}

/**
 * Call A smart contract token and get gas information
 */
async function web3DaiContract() {
  const provider = ethers.getDefaultProvider('mainnet', {
    etherscan: '1PK1FGSFCJ736X8QZNJ2RAMPPHUCNWWYFI',
  })

  // You can also use an ENS name for the contract address
  const daiAddress = 'dai.tokens.ethers.eth'

  // The ERC-20 Contract ABI, which is a common contract interface
  // for tokens (this is the Human-Readable ABI format)
  const daiAbi = [
  // Some details about the token
    'function name() view returns (string)',
    'function symbol() view returns (string)',

    // Get the account balance
    'function balanceOf(address) view returns (uint)',

    // Send some of your tokens to someone else
    'function transfer(address to, uint amount)',

    // An event triggered whenever anyone transfers to someone else
    'event Transfer(address indexed from, address indexed to, uint amount)',
  ]

  // The Contract object
  const daiContract = new ethers.Contract(daiAddress, daiAbi, provider)

  daiContract.on('Transfer', (tokenId) => {
    console.log(`Token #${tokenId} minted`)
  })

  const gasPrice = async() => { console.log(`gas ${await provider.getGasPrice()}`) }

  state.contractNameDai = await daiContract.name()
  console.log(`Contract name is ${state.contractNameDai}`)
}

async function changeBgPageByCode() {
  // to get current tab and make request
  const tab = await browser.tabs.query({ active: true, currentWindow: true })

  // to change dynamically code of the current tab
  await browser.tabs.executeScript(tab[0].id, { code: 'document.body.style.backgroundColor="yellow"' })
}

async function changeBgPageByContentScript() {
  const tab = await browser.tabs.query({ active: true, currentWindow: true })
  // send message to current tab and wait data
  await browser.tabs.sendMessage(tab[0].id as number, { from: 'extension', message: 'changeBgColor' })
}

async function getSelectPageText() {
  const tab = await browser.tabs.query({ active: true, currentWindow: true })

  const tmp = await browser.tabs.executeScript(tab[0].id, { code: 'window.getSelection().toString()' })

  state.textSelect = tmp[0] as string
}

async function simpleGetJson() {
  fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then(response => response.json())
  // eslint-disable-next-line no-console
    .then(json => state.title = json.title)
}

async function sendCmdToBackgroundNewTab() {
  const res = await sendMessage('OpenTab', { url: 'https://www.google.fr/' }, 'background')
  console.log(res)
}

async function getCurrentTabTileFromBackground() {
  const res = await sendMessage('get-current-tab', { tabId: 0 }, 'background')
  state.title = res.title as string
}

// to get all tabs and send message
/* browser.storage.local.get('urls').then(({ urls }) => {
     return browser.tabs.query({ url: urls })
    //return browser.tabs.query({ active: true, currentWindow: true })
  }).then((tabs) => {
    return Promise.all(
      Array.from(tabs, tab => browser.tabs.sendMessage(tab.id, { from: 'report_back', message: 'report_back' })),
      // Array.from(tabs, tab => browser.tabs.executeScript({ code: 'document.body.style.backgroundColor="000000";' })),
    )
  }).then((data) => {
    console.log('yeeeeeeee')
    console.log(data)
  }).catch((error) => {
    console.error(`An error occurred while reloading tabs: ${error.message}`)
  }) */
</script>

<template>
  <main class="w-[500px] px-4 py-5 text-center text-gray-700">
    <Logo />
    <div>Popup</div>
    <p class="mt-2 opacity-50">
      This is the popup page
    </p>
    <button class="btn mt-2" @click="openOptionsPage">
      Open Options
    </button>
    <button class="btn mt-2" @click="web3DaiContract">
      Dai-Contract
    </button>
    <div class="mt-2">
      <span class="opacity-50">Contract Name :</span> {{ state.contractNameDai }}
    </div>

    <button class="btn mt-2" @click="changeBgPageByCode">
      ChangeColorBgByInjectCode
    </button>
    <button class="btn mt-2" @click="changeBgPageByContentScript">
      ChangeColorBgByMessageToContentScript
    </button>

    <button class="btn mt-2" @click="getSelectPageText">
      GetSelectTextInPage
    </button>
    <div class="mt-2">
      <span class="opacity-50">Select :</span> {{ state.textSelect }}
    </div>

    <button class="btn mt-2" @click="simpleGetJson">
      GetJsonAPI
    </button>
    <div class="mt-2">
      <span class="opacity-50">Select :</span> {{ state.title }}
    </div>

    <button class="btn mt-2" @click="getCurrentTabTileFromBackground">
      GetCurrentTabTileFromBackground
    </button>
    <div class="mt-2">
      <span class="opacity-50">Select :</span> {{ state.title }}
    </div>

    <button class="btn mt-2" @click="sendCmdToBackgroundNewTab">
      CmdToBackgroundNewTab
    </button>

    <div class="mt-2">
      <span class="opacity-50">Storage:</span> {{ storageDemo }}
    </div>

    <div class="bg-gray-50">
      <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          <span class="block">Ready to dive in?</span>
          <span class="block text-indigo-600">Start your free trial today.</span>
        </h2>
        <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
          <div class="inline-flex rounded-md shadow">
            <a href="#" class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"> Get started </a>
          </div>
          <div class="ml-3 inline-flex rounded-md shadow">
            <a href="#" class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"> Learn more </a>
          </div>
        </div>
      </div>
    </div>

    <div class="card w-96 bg-base-100 shadow-xl">
      <figure><img src="https://api.lorem.space/image/shoes?w=400&h=225" alt="Shoes" /></figure>
      <div class="card-body">
        <h2 class="card-title">
          Shoes!
        </h2>
        <p>If a dog chews shoes whose shoes does he choose?</p>
        <div class="card-actions justify-end">
          <button class="btn btn-primary">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
