package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"strconv"
	"time"

	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/go-chi/chi/v5"

	"github.com/ethereum/go-ethereum/common"

	"github.com/ethereum/go-ethereum/crypto"
)

func main() {
	privateKey, err := crypto.HexToECDSA("SAMPLE")
	if err != nil {
		fmt.Println(err)
		return
	}
	// publicKey := privateKey.Public()
	// publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	// if !ok {
	// 	log.Fatal("cannot assert type: publicKey is not of type *ecdsa.PublicKey")
	// }
	// publicKeyBytes := crypto.FromECDSAPub(publicKeyECDSA)
	// addr := crypto.PubkeyToAddress(*publicKeyECDSA)

	r := chi.NewRouter()
	r.Get("/{recipient}/{collection}/{address}/{nonce}", func(w http.ResponseWriter, r *http.Request) {
		recipient := chi.URLParam(r, "recipient")
		collection := chi.URLParam(r, "collection")
		addressStr := chi.URLParam(r, "address")
		address, err := strconv.Atoi(addressStr)
		if err != nil {
			http.Error(w, "bad param", http.StatusBadRequest)
			return
		}
		nonceStr := chi.URLParam(r, "nonce")
		nonce, err := strconv.Atoi(nonceStr)
		if err != nil {
			http.Error(w, "bad param", http.StatusBadRequest)
			return
		}
		expiry := time.Now().Add(10 * time.Minute)
		hash := Pack(common.HexToAddress(recipient), common.HexToAddress(collection), big.NewInt(int64(address)), big.NewInt(int64(nonce)), big.NewInt(expiry.Unix()))
		prefixedHash := crypto.Keccak256Hash(
			[]byte(fmt.Sprintf("\x19Ethereum Signed Message:\n%v", len(hash))),
			hash.Bytes(),
		)
		signature, err := crypto.Sign(prefixedHash.Bytes(), privateKey)
		if err != nil {
			log.Fatal(err)
		}
		if signature[64] == 0 || signature[64] == 1 {
			// Further reading: https://ethereum.stackexchange.com/questions/102190/signature-signed-by-go-code-but-it-cant-verify-on-solidity
			signature[64] += 27
		}
		type Resp struct {
			Signature string
			Expiry    int64
		}
		resp := &Resp{hexutil.Encode(signature), expiry.Unix()}
		json.NewEncoder(w).Encode(resp)
	})
	fmt.Println("running on :8080")
	http.ListenAndServe(":8080", r)
	// fmt.Println("PUB:", addr)
	// fmt.Println("HSH:", hash.Hex())

	// if signature[64] == 0 || signature[64] == 1 {
	// 	// Further reading: https://ethereum.stackexchange.com/questions/102190/signature-signed-by-go-code-but-it-cant-verify-on-solidity
	// 	signature[64] += 27
	// }

	// fmt.Println("SIG:", hexutil.Encode(signature))
	// signatureNoRecoverID := signature[:len(signature)-1]
	// if !crypto.VerifySignature(publicKeyBytes, prefixedHash.Bytes(), signatureNoRecoverID) {
	// 	fmt.Println("Signature does not match")
	// 	return
	// }
	// fmt.Println("Signature matches")

}

func Pack(recipient common.Address, collection common.Address, amount *big.Int, nonce *big.Int, expiry *big.Int) common.Hash {
	recipientTyp, _ := abi.NewType("address", "", nil)
	collectionTyp, _ := abi.NewType("address", "", nil)
	amtTyp, _ := abi.NewType("uint256", "", nil)
	nonceTyp, _ := abi.NewType("uint256", "", nil)
	expiryTyp, _ := abi.NewType("uint256", "", nil)

	arguments := abi.Arguments{
		{
			Type: recipientTyp,
		},
		{
			Type: collectionTyp,
		},
		{
			Type: amtTyp,
		},
		{
			Type: nonceTyp,
		},
		{
			Type: expiryTyp,
		},
	}

	b, _ := arguments.Pack(
		recipient,
		collection,
		amount,
		nonce,
		expiry,
	)
	hash := crypto.Keccak256Hash(b)
	return hash
}
