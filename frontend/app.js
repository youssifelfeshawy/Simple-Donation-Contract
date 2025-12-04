// Replace with your actual deployed contract address from `truffle migrate`
const contractAddress = '0xE1779f8281938F96368Eaf129d456339409f6251';

// Paste your ABI array here (the one you already sent)
const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "donor",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "DonationReceived",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "donationsByUser",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalDonations",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "donate",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTotalDonations",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

let web3;
let contract;
let cachedAccounts = [];

// Initialize Web3, contract, and load initial data
async function init() {
    try {
        // Connect directly to Ganache HTTP RPC
        web3 = new Web3('http://127.0.0.1:7545');

        contract = new web3.eth.Contract(contractABI, contractAddress);

        cachedAccounts = await web3.eth.getAccounts();

        if (!cachedAccounts || cachedAccounts.length < 2) {
            setStatus('Error: Not enough accounts from Ganache (need at least 2).');
            return;
        }

        // Show which account we are using as donor
        document.getElementById('activeAccount').innerText = cachedAccounts[1];

        // Load totals initially
        await getTotal();
        await getUserDonation();

        setStatus('Connected to Ganache and contract loaded.', 'green');
    } catch (error) {
        setStatus('Initialization error: ' + error.message);
        console.error(error);
    }
}

// Get accounts (using cached list)
async function getAccounts() {
    if (cachedAccounts.length === 0) {
        cachedAccounts = await web3.eth.getAccounts();
    }
    return cachedAccounts;
}

// Refresh total donations (read-only)
async function getTotal() {
    try {
        const totalWei = await contract.methods.getTotalDonations().call();
        const totalEth = web3.utils.fromWei(totalWei, 'ether');
        document.getElementById('totalDonations').innerText = `${totalEth} ETH`;
        setStatus('Total refreshed!', 'green');
    } catch (error) {
        setStatus('Error getting total: ' + error.message);
        console.error(error);
    }
}

// Get donations for accounts[1]
async function getUserDonation() {
    try {
        const accounts = await getAccounts();
        const userWei = await contract.methods.donationsByUser(accounts[1]).call();
        const userEth = web3.utils.fromWei(userWei, 'ether');
        document.getElementById('userDonations').innerText = `${userEth} ETH`;
    } catch (error) {
        setStatus('Error getting user donations: ' + error.message);
        console.error(error);
    }
}

// Donate (transaction)
async function donate() {
    const amountEth = document.getElementById('donationAmount').value;
    if (!amountEth || parseFloat(amountEth) <= 0) {
        return setStatus('Enter valid amount > 0');
    }

    try {
        const accounts = await getAccounts();
        const amountWei = web3.utils.toWei(amountEth, 'ether');

        const receipt = await contract.methods.donate().send({
            from: accounts[1], // donor
            value: amountWei
        });

        setStatus('Donation successful!', 'green');
        document.getElementById('txHash').innerText = receipt.transactionHash;

        // Refresh totals
        await getTotal();
        await getUserDonation();
    } catch (error) {
        setStatus('Donation error: ' + error.message);
        console.error(error);
    }
}

// Withdraw (owner only, transaction)
async function withdraw() {
    try {
        const accounts = await getAccounts();

        const receipt = await contract.methods.withdraw().send({
            from: accounts[0] // owner
        });

        setStatus('Withdraw successful!', 'green');
        document.getElementById('txHash').innerText = receipt.transactionHash;

        await getTotal();
        await getUserDonation();
    } catch (error) {
        setStatus('Withdraw error: ' + error.message);
        console.error(error);
    }
}

function setStatus(message, color = 'red') {
    const status = document.getElementById('status');
    status.innerText = message;
    status.style.color = color;
}

// Run init when the page is fully loaded
window.addEventListener('load', init);
