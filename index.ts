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

const quote = await axios.get(CONFIG.orderbookURL + '/quote?from=starknet_sepolia:wbtc&to=bitcoin_testnet:btc&from_amount=50000')
const quote_resp = JSON.parse(quote.data)

console.log(quote_resp)


const create_order_req = JSON.stringify({
  "source": {
      "asset": "starknet_sepolia:wbtc",
      "owner": CONFIG.starknetAddress,
      "amount": "50000"
  },
  "destination": {
      "asset": "bitcoin_testnet:btc",
      "owner": CONFIG.bitcoinAddress,
      "amount": "49850"
  }
});

var result = await axios.post(CONFIG.orderbookURL + '/orders', create_order_req, {
  headers: {
    'Content-Type': 'application/json',
    'garden-app-id': CONFIG.gardenAppId
  }
});

const result_obj = JSON.parse(result.data)
const order_id = result_obj["result"]["order_id"]

console.log("Order created successfully. Order ID: ", order_id)

if (result_obj["result"]["approval"])

var test : Call =  {
  contractAddress: CONFIG.starknetWBTC,
  calldata: [],
  entrypoint: "allowance"

};



const wbtcContractData = await starknetProvider.getClassAt(CONFIG.starknetWBTC);

const wbtcContract = new Contract(wbtcContractData.abi, CONFIG.starknetWBTC, starknetProvider);


wbtcContract.connect(alice);

const allowance =  await wbtcContract.allowance(CONFIG.starknetAddress, CONFIG.starknetHTLC);

console.log(allowance);

if (allowance < parseEther("1")) {
  const tx = await wbtcContract.approve(CONFIG.starknetHTLC, parseEther("10"));
  console.log(tx);
}

const initiate_msg: TypedData = result_obj["result"]["typed_data"]

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
