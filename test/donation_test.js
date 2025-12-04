// const DonationContract = artifacts.require("DonationContract");

// contract("DonationContract", (accounts) => {
//     it("should allow owner to withdraw and reset total", async () => {
//         let instance = await DonationContract.deployed();
//         await instance.donate({ from: accounts[1], value: web3.utils.toWei("1", "ether") });  // Donate first
//         await instance.withdraw({ from: accounts[0] });  // Withdraw as owner
//         let totalAfter = await instance.getTotalDonations();
//         assert.equal(totalAfter.toString(), "0");
//     });
// });

const DonationContract = artifacts.require("DonationContract");
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');  // Add this for better error and event testing (install if needed: npm install --save-dev @openzeppelin/test-helpers)

contract("DonationContract", (accounts) => {
    let instance;
    let owner = accounts[0];  // Deployer/owner
    let donor1 = accounts[1];
    let donor2 = accounts[2];
    let nonOwner = accounts[3];

    // Run before each test to deploy a fresh contract
    beforeEach(async () => {
        instance = await DonationContract.new();  // Changed from .deployed() to .new() for fresh instance per test
    });

    it("should deploy with initial total donations as 0 and correct owner", async () => {
        const total = await instance.getTotalDonations();
        assert.equal(total.toString(), "0", "Initial total should be 0");

        const contractOwner = await instance.owner();
        assert.equal(contractOwner, owner, "Owner should be the deployer");
    });

    it("should allow a successful donation and update total and user mapping", async () => {
        const donationAmount = web3.utils.toWei("1", "ether");

        // Donate from donor1
        const receipt = await instance.donate({ from: donor1, value: donationAmount });

        // Check total updated
        const total = await instance.getTotalDonations();
        assert.equal(total.toString(), donationAmount, "Total donations should update after donation");

        // Check user-specific donation
        const userDonation = await instance.donationsByUser(donor1);
        assert.equal(userDonation.toString(), donationAmount, "User's donation amount should update");

        // Check event emitted
        await expectEvent(receipt, "DonationReceived", { donor: donor1, amount: donationAmount });
    });

    it("should allow multiple donations from different users and accumulate total", async () => {
        const donation1 = web3.utils.toWei("1", "ether");
        const donation2 = web3.utils.toWei("2", "ether");

        await instance.donate({ from: donor1, value: donation1 });
        await instance.donate({ from: donor2, value: donation2 });

        const total = await instance.getTotalDonations();
        assert.equal(total.toString(), web3.utils.toWei("3", "ether"), "Total should accumulate multiple donations");

        const user1Donation = await instance.donationsByUser(donor1);
        assert.equal(user1Donation.toString(), donation1, "Donor1's amount should be correct");

        const user2Donation = await instance.donationsByUser(donor2);
        assert.equal(user2Donation.toString(), donation2, "Donor2's amount should be correct");
    });

    it("should revert on zero-value donation", async () => {
        // Expect revert with exact error message
        await expectRevert(
            instance.donate({ from: donor1, value: "0" }),
            "Donation must be greater than 0"
        );
    });

    it("should allow owner to withdraw and reset total and contract balance", async () => {
        const donationAmount = web3.utils.toWei("1", "ether");

        // Donate first
        await instance.donate({ from: donor1, value: donationAmount });

        // Get balances before withdraw
        const ownerBalanceBefore = await web3.eth.getBalance(owner);
        const contractBalanceBefore = await web3.eth.getBalance(instance.address);

        // Withdraw as owner
        const receipt = await instance.withdraw({ from: owner });

        // Check total reset
        const totalAfter = await instance.getTotalDonations();
        assert.equal(totalAfter.toString(), "0", "Total should reset after withdraw");

        // Check contract balance is 0
        const contractBalanceAfter = await web3.eth.getBalance(instance.address);
        assert.equal(contractBalanceAfter, "0", "Contract balance should be 0 after withdraw");

        // Check owner received funds (approx, minus gas)
        const ownerBalanceAfter = await web3.eth.getBalance(owner);
        assert(ownerBalanceAfter > ownerBalanceBefore, "Owner balance should increase after withdraw");

        // No event for withdraw, but gas used confirms transaction
        assert(receipt.receipt.gasUsed > 0, "Withdraw transaction should use gas");
    });

    it("should revert withdraw if called by non-owner", async () => {
        const donationAmount = web3.utils.toWei("1", "ether");

        // Donate first
        await instance.donate({ from: donor1, value: donationAmount });

        // Try withdraw as non-owner
        await expectRevert(
            instance.withdraw({ from: nonOwner }),
            "Only owner can withdraw"
        );

        // Total should not change
        const total = await instance.getTotalDonations();
        assert.equal(total.toString(), donationAmount, "Total should not reset on failed withdraw");
    });

    it("should handle withdraw with no funds (total remains 0)", async () => {
        // No donation, direct withdraw
        await instance.withdraw({ from: owner });

        const total = await instance.getTotalDonations();
        assert.equal(total.toString(), "0", "Total should stay 0 if no funds");

        const contractBalance = await web3.eth.getBalance(instance.address);
        assert.equal(contractBalance, "0", "Contract balance should be 0");
    });

    it("should correctly track user donations across multiple calls", async () => {
        const donation1 = web3.utils.toWei("1", "ether");
        const donation2 = web3.utils.toWei("0.5", "ether");

        await instance.donate({ from: donor1, value: donation1 });
        await instance.donate({ from: donor1, value: donation2 });

        const userDonation = await instance.donationsByUser(donor1);
        assert.equal(userDonation.toString(), web3.utils.toWei("1.5", "ether"), "User donations should accumulate");
    });
});