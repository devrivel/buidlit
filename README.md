<p align="center">
  <a href="https://rivel.io">
    <img src="https://assets-str.b-cdn.net/Rivel_Header.jpg" height="300px">
  </a>
</p>

&nbsp;

We wanted to make recurring payments in crypto easy for everyone.
We came up with a set of tools to allow eager merchant to start
accepting crypto recurring payments in no time. Tools built
for the hackathon are an easy-to-use merchant dashboard for
creating products and a hosted checkout page for selling those
products in a few click.

## Benefits to merchants and users 🪄

Key to our smart contract is instant token settlement
for both parties. What does this mean?

<img src="https://assets-str.b-cdn.net/Rivel_Settlement.001.jpeg" height="300px">

Many merchants want to accept crypto, but are afraid of price volatility.
On the other hand, many users would gladly pay with their favorite token,
regardless of price action. Often these are the offered solutions:

1. User swaps their tokens to the merchant's preferred token (Stablecoin)
2. Merchant allows use of many tokens and swaps them to their desired token, thus
   adding additional risk if price goes down
3. Don't pay with crypto

Rivel allows both parties to choose and our contract handles swaps
instantly between these tokens. This removes any volatility for the merchant,
as swaps are performed instantly at runtime and gives freedom to the user
to pay with whatever token they wish.

## How to use Rivel 🔧

- Access the dashboard at [https://dashboard.rivel.io](https://dashboard.rivel.io)
- Create a merchant account
- Create a product
- You're ready to receive recurring payments!

## Tech for the tech heads

<img src="https://assets-str.b-cdn.net/Rivel%20System%20Design@2x%20(1).png">

Key components on Rivel's system are of course the smart contract, which
utilises Chainlink oracles to determine exchange rates between two tokens.
We also utilise Uniswap and their swap contracts to perform swaps on-chain.
Multihops are also supported, which means that there does not have to be a direct
liquidity pool between the tokens, but can go through multiple pools, thus allowing
us to support a range of different tokens.

Backend acts as an API at the same time, which can be called by developers directly with an
API key, or with a Rivel SDK.

Crucial piece of infrastructure is our subscription processor deployed as a Lambda function on AWS.
The subscription processor calls the Rivel smart contract whenever a subscription is due.

## Thank you for providing an amazing opportunity! 🙌
