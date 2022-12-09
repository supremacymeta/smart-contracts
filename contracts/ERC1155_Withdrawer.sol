// SPDX-License-Identifier: AGPL-1.0-only

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Crypto_SignatureVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @custom:security-contact privacy-admin@supremacy.game
contract ERC1155Withdrawer is SignatureVerifier, Ownable, ERC1155Holder {
	mapping(address => uint256) public nonces;
	bool public canWithdraw;

	IERC1155 private immutable Tokens;

	constructor(address TokenAddr, address signer) SignatureVerifier(signer) {
		Tokens = IERC1155(TokenAddr);
	}

	// setCanWithdraw when platform is ready to allow users to transfer
	function setCanWithdraw(bool _canWithdraw) public onlyOwner {
		canWithdraw = _canWithdraw;
		emit SetCanWithdraw(_canWithdraw);
	}

	// devSetSigner updates the signer
	function devSetSigner(address _signer) public onlyOwner {
		setSigner(_signer);
	}

	// flushERC1155s returns the token to the admin
	function flushERC1155s(uint256 tokenID) public onlyOwner {
		uint256 amt = Tokens.balanceOf(address(this), tokenID);
		Tokens.safeTransferFrom(address(this), msg.sender, tokenID, amt, "");
	}

	// withdrawTokens will transfer Tokens to the caller if the signature is valid
	function withdrawTokens(
		uint256 tokenID,
		uint256 amt,
		bytes calldata signature,
		uint256 expiry
	) public {
		require(canWithdraw, "withdraws disabled");
		require(expiry > block.timestamp, "signature expired");
		uint256 nonce = nonces[msg.sender]++;
		bytes32 messageHash = getMessageHash(
			msg.sender,
			tokenID,
			amt,
			nonce,
			expiry
		);
		require(verify(messageHash, signature), "Invalid Signature");
		require(
			Tokens.balanceOf(address(this), tokenID) >= amt,
			"not enough Tokens in hot wallet"
		);
		Tokens.safeTransferFrom(address(this), msg.sender, tokenID, amt, "");
		emit WithdrawTokens(msg.sender, tokenID, amt);
	}

	// getMessageHash builds the hash
	function getMessageHash(
		address account,
		uint256 tokenID,
		uint256 amt,
		uint256 nonce,
		uint256 expiry
	) internal pure returns (bytes32) {
		return keccak256(abi.encode(account, tokenID, amt, nonce, expiry));
	}

	event WithdrawTokens(address indexed account, uint256 tokenID, uint256 amt);
	event SetCanWithdraw(bool _canWithdraw);
}
