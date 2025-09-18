import { Axios } from "axios";
import { Account, Contract, RpcProvider, type TypedData, type WeierstrassSignatureType, type Call } from "starknet";
import { parseEther } from "viem";
import { readFileSync } from "fs";

const CONFIG = JSON.parse(readFileSync("config.json", "utf8"));

const starknetProvider = new RpcProvider({
  nodeUrl: CONFIG.starknetNodeUrl,
});

const axios = new Axios();

const alice = new Account(
  starknetProvider,
  CONFIG.starknetAddress,
  CONFIG.starknetPrivateKey,
  "1",
  "0x3"
);

// get list of supported assets
const assets = await axios.get(CONFIG.orderbookURL + '/assets')
const assets_resp = JSON.parse(assets.data)

// Filter assets to get Starknet and Bitcoin assets
const starknetAssets = assets_resp.result.filter((asset: any) => asset.id.startsWith('starknet_'));
const bitcoinAssets = assets_resp.result.filter((asset: any) => asset.id.startsWith('bitcoin_'));

// Get the first available Starknet WBTC and Bitcoin BTC assets
const starknetWBTC = starknetAssets.find((asset: any) => asset.id === 'starknet_sepolia:wbtc');
const bitcoinBTC = bitcoinAssets.find((asset: any) => asset.id === 'bitcoin_testnet:btc');

console.log('Available Starknet assets:', starknetAssets.map((a: any) => a.id));
console.log('Available Bitcoin assets:', bitcoinAssets.map((a: any) => a.id));
console.log('Selected Starknet WBTC:', starknetWBTC);
console.log('Selected Bitcoin BTC:', bitcoinBTC);



// Get a quote for the order
const quote = await axios.get(CONFIG.orderbookURL + `/quote?from=${starknetWBTC?.id}&to=${bitcoinBTC?.id}&from_amount=50000`)
const quote_resp = JSON.parse(quote.data)

console.log(quote_resp)


// Create order request
const create_order_req = JSON.stringify({
  "source": {
      "asset": quote_resp["result"][0]["source"]["asset"],
      "owner": quote_resp["result"][0]["source"]["asset"].startsWith("starknet_") ? CONFIG.starknetAddress : CONFIG.bitcoinAddress,
      "amount": quote_resp["result"][0]["source"]["amount"]
  },
  "destination": {
      "asset": quote_resp["result"][0]["destination"]["asset"],
      "owner": quote_resp["result"][0]["destination"]["asset"].startsWith("starknet_") ? CONFIG.starknetAddress : CONFIG.bitcoinAddress,
      "amount": quote_resp["result"][0]["destination"]["amount"]
  }
});

// Create an order
var result = await axios.post(CONFIG.orderbookURL + '/orders', create_order_req, {
  headers: {
    'Content-Type': 'application/json',
    'garden-app-id': CONFIG.gardenAppId
  }
});

// Get the order ID
const result_obj = JSON.parse(result.data)
const order_id = result_obj["result"]["order_id"]

console.log("Order created successfully. Order ID: ", order_id)

// Get the contract data
const wbtcContractData = await starknetProvider.getClassAt(CONFIG.starknetWBTC);

// Create a contract
const wbtcContract = new Contract(wbtcContractData.abi, CONFIG.starknetWBTC, starknetProvider);


// Connect the contract to the account
wbtcContract.connect(alice);

// Get the allowance
const allowance =  await wbtcContract.allowance(CONFIG.starknetAddress, CONFIG.starknetHTLC);

console.log(allowance);

// Check if the allowance is less than 1
if (allowance < parseEther("1")) {
  const tx = await wbtcContract.approve(CONFIG.starknetHTLC, parseEther("10"));
  console.log(tx);
}

// Get the initiate message
const initiate_msg: TypedData = result_obj["result"]["typed_data"]

// Get the signature
const signature = (await alice.signMessage(initiate_msg)) as WeierstrassSignatureType;

const { r, s } = signature;

const rs_sig =  `${r.toString()},${s.toString()}`;

const sig_json = JSON.stringify({
  "signature": rs_sig
})


var result = await axios.patch(CONFIG.orderbookURL + '/orders/'+order_id+'?action=initiate', sig_json, {
  headers: {
    'Content-Type': 'application/json',
    'garden-app-id': CONFIG.gardenAppId
  }
});

const init_result = JSON.parse(result.data)

console.log("Order initiated successfully. GaslessInitiate Result Tx Hash: ", init_result["result"])
