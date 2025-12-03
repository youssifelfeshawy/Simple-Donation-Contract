// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonationContract {
    address public owner; // Contract deployer is the owner
    uint256 public totalDonations; // Tracks total Ether donated (in wei)
    mapping(address => uint256) public donationsByUser; // Tracks donations per user

    // Event to log donations
    event DonationReceived(address donor, uint256 amount);

    constructor() {
        owner = msg.sender; // Set owner to the deployer
        totalDonations = 0;
    }

    // State-changing function: Donate Ether (requires transaction with value)
    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than 0");
        totalDonations += msg.value;
        donationsByUser[msg.sender] += msg.value;
        emit DonationReceived(msg.sender, msg.value);
    }

    // Read-only (view) function: Get total donations
    function getTotalDonations() public view returns (uint256) {
        return totalDonations;
    }

    // State-changing function: Owner withdraws all funds
    function withdraw() public {
        require(msg.sender == owner, "Only owner can withdraw");
        payable(owner).transfer(address(this).balance);
        totalDonations = 0; // Reset total after withdrawal
    }
}
