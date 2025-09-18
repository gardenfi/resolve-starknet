# Garden Starknet<>BTC script

A script for demonstrating cross-chain asset swaps between Starknet and Bitcoin using Garden Finance protocol. This project demonstrates how to perform atomic swaps between Starknet WBTC and Bitcoin BTC on testnet.

## Features

- 🔄 **Cross-chain swaps**: Exchange assets between Starknet and Bitcoin networks
- 🛡️ **Atomic swaps**: Secure HTLC-based transactions with automatic redemption
- 📊 **Real-time quotes**: Get live pricing and availability for supported assets
- 🔍 **Order tracking**: Monitor transaction status through Garden Finance explorer
- ⚡ **Gasless initiation**: Starknet-to-Bitcoin swaps use gasless transaction initiation


## Prerequisites

- [Bun](https://bun.sh/) runtime (recommended) or Node.js
- TypeScript knowledge
- Starknet wallet with testnet funds
- Bitcoin testnet wallet (for Bitcoin-to-Starknet swaps)

## App ID

garden-app-id: 47d589e79ffbe321d296609f63922e64953da28ba08e07a7f4ba2d7978cfb931

Use this to access protected routes (Create Order & Action)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resolve-starknet
```

2. Install dependencies:
```bash
bun install
```

## Configuration

1. Copy the sample configuration:
```bash
cp sample_config.json config.json
```

2. Update `config.json` with your details:
```json
{
  "starknetNodeUrl": "https://starknet-sepolia.public.blastapi.io",
  "starknetAddress": "YOUR_STARKNET_ADDRESS",
  "starknetPrivateKey": "YOUR_STARKNET_PRIVATE_KEY",
  "orderbookURL": "https://testnet.api.garden.finance/v2",
  "gardenAppId": "47d589e79ffbe321d296609f63922e64953da28ba08e07a7f4ba2d7978cfb931",
  "bitcoinAddress": "YOUR_BITCOIN_ADDRESS"
}
```

### Configuration Parameters

- `starknetNodeUrl`: Starknet RPC endpoint (Sepolia testnet)
- `starknetAddress`: Your Starknet wallet address
- `starknetPrivateKey`: Your Starknet private key
- `orderbookURL`: Garden Finance API endpoint
- `gardenAppId`: Application ID for Garden Finance API
- `bitcoinAddress`: Your Bitcoin testnet address

## Usage

### Running the Example

Execute the main script to perform a Starknet WBTC to Bitcoin BTC swap:

```bash
bun run index.ts
```

### How It Works

The script demonstrates a complete cross-chain swap flow:

1. **Get Supported Assets**: Fetches available assets from both networks
2. **Get Quote**: Retrieves current pricing and swap details
3. **Create Order**: Initiates a new swap order
4. **Process Transaction**: Handles the appropriate flow based on source network

### Swap Flows

#### Bitcoin to Starknet Flow
1. Create order through the API
2. Pay Bitcoin to the provided HTLC address
3. Wait for Bitcoin transaction confirmation
4. Automatic redemption on Starknet

#### Starknet to Bitcoin Flow
1. Create order through the API
2. Approve token spending (if required)
3. Sign typed data message
4. Submit signature to initiate gasless transaction
5. Automatic redemption on Bitcoin

### API Endpoints

The script interacts with these Garden Finance API endpoints:

- `GET /assets` - List supported assets
- `GET /quote` - Get swap quote
- `POST /orders` - Create new order
- `PATCH /orders/{id}?action=initiate` - Initiate Starknet-to-Bitcoin swap

### Order Tracking

Monitor your swap progress:

- **Explorer**: https://testnet-explorer.garden.finance/order/{order_id}
- **API**: https://testnet.api.garden.finance/v2/orders/{order_id}

## Dependencies

- `axios`: HTTP client for API requests
- `starknet`: Starknet SDK for blockchain interactions
- `viem`: Ethereum utilities for parsing amounts

## Security Notes

⚠️ **Important Security Considerations**:

- This is a testnet implementation - never use mainnet private keys
- Keep your private keys secure and never commit them to version control
- The `config.json` file should be added to `.gitignore`
- Always verify transaction details before signing



## Troubleshooting

### Common Issues

1. **Insufficient Balance**: Ensure you have enough WBTC on Starknet or BTC on Bitcoin testnet
2. **Network Issues**: Check your RPC endpoint connectivity
3. **Invalid Configuration**: Verify all addresses and keys are correct
4. **Transaction Failures**: Check gas fees and network congestion

## License

This project is private and proprietary.

## Support

Testnet Faucet : https://testnetbtc.com // claim testnet btc, evm, sol 

For issues and questions:
- Check the [Garden Finance Documentation](https://docs.garden.finance/)
- Review the explorer for transaction status
- Verify your configuration matches the sample
