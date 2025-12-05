# Simple Donation Contract on Ganache

![Project Banner](https://via.placeholder.com/1200x300?text=Simple+Donation+Contract)  
*(Replace with an actual banner image if available)*

## Project Overview

This repository contains the implementation of a **Simple Donation Contract** as part of the "Security of Distributed Systems" course project. The project demonstrates blockchain fundamentals using Solidity, Ganache (local blockchain), and Truffle framework. Users can donate Ether, track contributions, and the owner can withdraw funds. A responsive web frontend built with HTML/CSS/JavaScript and Web3.js allows interaction with the deployed contract.

## Features

- **Smart Contract (Solidity):**
  - Donate Ether with validation (must be > 0).
  - Track total donations and per-user contributions.
  - Owner-only withdrawal of funds.
  - Event emission for donations.
  - Read-only getter for total donations.

- **Frontend (Web App):**
  - Account selection from Ganache accounts.
  - Real-time display of balances, user donations, and total contract donations.
  - Donation form with amount input.
  - Withdraw button (owner-only).
  - Table listing all Ganache accounts with balances and donations.
  - Status messages and transaction hashes.

- **Blockchain Interaction:**
  - Deployed on local Ganache network.
  - Uses Web3.js for contract calls and transactions.

## Tech Stack

- **Blockchain:** Solidity (^0.8.0), Ganache (local Ethereum simulator).
- **Framework:** Truffle (for compilation, migration, deployment).
- **Frontend:** HTML5, CSS3 (responsive design), JavaScript, Web3.js (v1.10.0).
- **Tools:** Node.js, npm.

## Prerequisites

- Node.js (v14+).
- Truffle: `npm install -g truffle`.
- Ganache: `npm install -g ganache` (CLI) or download GUI from [Truffle Suite](https://trufflesuite.com/ganache/).
- Web Browser (e.g., Chrome) for running the frontend.

## Setup Instructions

1. **Clone the Repository:**
   ```
   git clone https://github.com/your-username/simple-donation-contract.git
   cd simple-donation-contract
   ```

2. **Install Dependencies:**
   ```
   npm install
   ```
   *(This installs Web3.js and any other packages if specified in package.json.)*

3. **Start Ganache:**
   - CLI: `ganache` (provides 10 accounts with 100 ETH each).
   - GUI: Open Ganache, create a new workspace, and start the server (default port: 7545).

4. **Compile the Contract:**
   ```
   truffle compile
   ```

5. **Deploy to Ganache:**
   ```
   truffle migrate --network development
   ```
   - Note the deployed contract address from the console output (e.g., `0x74525c6B93Bf1Bd8A050E0581C6c76b7fbcB393C`).
   - Update `app.js` with this address in the `contractAddress` variable.

## Usage

1. **Run the Frontend:**
   - Open `index.html` in your browser.
   - The app will connect to Ganache automatically.
   - Select a donor account from the dropdown (defaults to account #1).
   - Enter an amount and click "Donate Now".
   - For withdrawal, click "Withdraw" (only works from the owner account, typically account #0).

2. **Interact via Truffle Console (Optional):**
   ```
   truffle console --network development
   ```
   - Example: `DonationContract.deployed().then(instance => instance.donate({value: web3.utils.toWei('1', 'ether'), from: accounts[1]}))`

3. **Testing:**
   - Donate from multiple accounts and verify totals update.
   - Attempt invalid actions (e.g., zero donation) to see reverts.
   - Withdraw as owner and check reset.

## Folder Structure

```
simple-donation-contract/
├── contracts/              # Solidity contracts
│   ├── DonationContract.sol
│   └── Migrations.sol
├── migrations/             # Truffle migration scripts
│   └── 2_deploy_contracts.js
├── app.js                  # Frontend JavaScript logic
├── index.html              # Web frontend
├── truffle-config.js       # Truffle configuration
├── README.md               # This file
└── package.json            # npm dependencies (if any)
```

## Security Notes

- **Access Control:** Owner-only withdrawal using `require`.
- **Validation:** Donations must be > 0 wei.
- **No Reentrancy Risk:** No external calls during state changes.
- **Testing:** Manual tests for edge cases; consider formal verification for production.

## Challenges and Learnings

- Integrating Web3.js with Ganache for real-time updates.
- Handling ETH/wei conversions accurately.
- Ensuring responsive UI across devices.
- Understanding transaction lifecycle and events.
