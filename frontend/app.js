// Replace with your actual deployed contract address from `truffle migrate`
const contractAddress = '0xBE9c7d8eb90F0175671327F58038b5f47D6e9ab5';

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
let selectedAccountIndex = 1; // default donor will be accounts[1]

// Initialize Web3, contract, and load initial data
async function init() {
    try {
        // Connect to Ganache
        web3 = new Web3('http://127.0.0.1:7545');

        contract = new web3.eth.Contract(contractABI, contractAddress);

        cachedAccounts = await web3.eth.getAccounts();

        if (!cachedAccounts || cachedAccounts.length < 2) {
            setStatus('Error: Not enough accounts from Ganache (need at least 2).');
            return;
        }

        // Build account selector + table
        buildAccountSelector();
        await refreshSelectedAccountInfo();
        await renderAccountsTable();

        // Load total donations
        await getTotal();

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
        // const totalEth = web3.utils.fromWei(totalWei, 'ether');
        const totalEth = parseFloat(web3.utils.fromWei(totalWei, 'ether')).toFixed(2);
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
        const account = accounts[selectedAccountIndex];

        const userWei = await contract.methods.donationsByUser(account).call();
        // const userEth = web3.utils.fromWei(userWei, 'ether');
        const userEth = parseFloat(web3.utils.fromWei(userWei, 'ether')).toFixed(2);
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
        const donor = accounts[selectedAccountIndex];
        const amountWei = web3.utils.toWei(amountEth, 'ether');

        const receipt = await contract.methods.donate().send({
            from: donor,
            value: amountWei
        });

        setStatus('Donation successful!', 'green');
        document.getElementById('txHash').innerText = receipt.transactionHash;

        // Refresh totals + table + selected account info
        await getTotal();
        await refreshSelectedAccountInfo();
        await renderAccountsTable();
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
            from: accounts[0] // owner (deployer)
        });

        setStatus('Withdraw successful!', 'green');
        document.getElementById('txHash').innerText = receipt.transactionHash;

        await getTotal();
        await refreshSelectedAccountInfo();
        await renderAccountsTable();
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

function buildAccountSelector() {
    const select = document.getElementById('accountSelect');
    select.innerHTML = '';

    cachedAccounts.forEach((acc, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${index}: ${acc}`;
        if (index === selectedAccountIndex) option.selected = true;
        select.appendChild(option);
    });

    // When user changes account in dropdown
    select.addEventListener('change', async (e) => {
        selectedAccountIndex = parseInt(e.target.value, 10);
        await refreshSelectedAccountInfo();
    });
}

async function refreshSelectedAccountInfo() {
    const accounts = await getAccounts();
    const account = accounts[selectedAccountIndex];

    // Show selected account address
    document.getElementById('activeAccount').innerText = account;

    // Show selected account balance
    const balanceWei = await web3.eth.getBalance(account);
    // const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
    const balanceEth = parseFloat(web3.utils.fromWei(balanceWei, 'ether')).toFixed(2);
    document.getElementById('activeBalance').innerText = `${balanceEth} ETH`;

    // Show how much this account has donated
    await getUserDonation();
}
async function renderAccountsTable() {
    const tbody = document.getElementById('accountsTableBody');
    tbody.innerHTML = '';

    const accounts = await getAccounts();

    for (let i = 0; i < accounts.length; i++) {
        const acc = accounts[i];

        const balanceWei = await web3.eth.getBalance(acc);
        // const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        const balanceEth = parseFloat(web3.utils.fromWei(balanceWei, 'ether')).toFixed(2);

        const donatedWei = await contract.methods.donationsByUser(acc).call();
        // const donatedEth = web3.utils.fromWei(donatedWei, 'ether');
        const donatedEth = parseFloat(web3.utils.fromWei(donatedWei, 'ether')).toFixed(2);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${i}</td>
            <td>${acc}</td>
            <td>${balanceEth} ETH</td>
            <td>${donatedEth} ETH</td>
        `;
        tbody.appendChild(tr);
    }
}



// Run init when the page is fully loaded
window.addEventListener('load', init);
