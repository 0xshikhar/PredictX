import { defineChain } from 'viem';

// Core blockchain configuration
export const coreChain = defineChain({
  id: 1116,
  name: 'Core',
  nativeCurrency: {
    decimals: 18,
    name: 'Core',
    symbol: 'CORE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.coredao.org'],
      webSocket: ['wss://ws.coredao.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CoreScan',
      url: 'https://scan.coredao.org',
    },
  },
  contracts: {
    // Add prediction market contracts here when deployed
    predictionMarketFactory: {
      address: '0x0000000000000000000000000000000000000000', // To be updated
      blockCreated: 0,
    },
  },
});

export const coreTestnet = defineChain({
  id: 1115,
  name: 'Core Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Core',
    symbol: 'tCORE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.test.btcs.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'CoreScan Testnet',
      url: 'https://scan.test.btcs.network',
    },
  },
  testnet: true,
});

export const supportedChains = [coreChain, coreTestnet];

export const defaultChain = process.env.NODE_ENV === 'production' ? coreChain : coreTestnet;