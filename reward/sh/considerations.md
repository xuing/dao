**What should be in the merkle tree?**
leaf = (userId, eth_temp_address)

**What should be signed on claim?**
NOTE: Signature should be made with `eth_temp_address` key.
- sender ethereum address
- ???

**Using temporary Ethereum wallet**
1. User takes temporary Ethereum wallet and generates a signature with it.
2. Using her main wallet, user sends a transaction that calls the following method:
devRewardDistributor.claim(
  transferTo = myRealWallet.address,
  delegateTo = famousHumanAddress,
  temporaryAddress = temporaryAddress,
  signature = signature,
  merkleProof
)
This way, user only uses temporaryWallet for generating the signature, and never for actual tx sending.
Now, a question arises on how to create that signature. I know 2 methods:
1. Through Metamask's interactive signTypedData_v3, in browser
1. Or through web3.personal.sign, in browser or in NodeJS CLI
I think that CLI is the most secure way to do that. Anyway, it's possible to decide as we go.
To check that signature, we'll use ECDSA.recover, as done here https://github.com/gitcoinco/governance/blob/d5362d31076e79e76503ff845d8475473b53a3fd/contracts/TokenDistributor.sol#L177-L180

**Counteract web-site highjacking**
On claim, users must sign their actual wallet address with the private key of temporary wallet and include that within proof.
And the Reward Contract must require that msg.sender is the address signed by temporary wallet.
This way, it would be impossible to steal the proof.
That's need in order to counteract web-site highjacking.

**Usernames in file**
It's possible to store encrypted private keys of temporary wallets along GitHub usernames. This will make proof generation way faster since there's no need to go through all the private keys trying to decrypt them. And that wouldn't reveal user's ethereum address cuz temporary wallet is still encrypted.

**Mermaid diagram**
https://mermaid.ink/img/eyJjb2RlIjoic2VxdWVuY2VEaWFncmFtXG4gICAgYXV0b251bWJlclxuICAgIFxuICAgIHJlY3QgcmdiKDcwLCA3MCwgNzApXG4gICAgcGFydGljaXBhbnQgRmx1ZW5jZVxuXG4gICAgcGFydGljaXBhbnQgRGF0YVxuICAgIFxuICAgIHBhcnRpY2lwYW50IFdlYnNpdGVcblxuICAgIHBhcnRpY2lwYW50IERldmVsb3BlclxuXG4gICAgcGFydGljaXBhbnQgVG9rZW5EaXN0cmlidXRvclxuXG4gICAgcmVjdCByZ2IoMTAwLCA3MCwgMTAwKVxuICAgICAgICBub3RlIHJpZ2h0IG9mIEZsdWVuY2U6IFByZXBhcmUgZGF0YVxuICAgICAgICBGbHVlbmNlIC0-PiBGbHVlbmNlOiBHZW5lcmF0ZSBhIHRlbXBvcmFyeSBLZXlQYWlyIGZvciBlYWNoIFNTSCBrZXlcbiAgICAgICAgRmx1ZW5jZSAtPj4gRGF0YTogRHVtcCBlMmUtZW5jcnlwdGVkIFNLcyB0byBrZXlzLmJpblxuICAgICAgICBGbHVlbmNlIC0-PiBEYXRhOiBDcmVhdGUgTWVya2xlVHJlZSBmcm9tIGVudW1lcmF0ZWQgUEtzXG4gICAgICAgIG5vdGUgbGVmdCBvZiBEYXRhOiBNZXJrbGUgVHJlZSBlbnRyeSBpcyAodXNlcl9pZCwgUEspXG4gICAgICAgIEZsdWVuY2UgLT4-IERhdGE6IExpc3Qgb2YgYWxsIEdpdEh1YiB1c2VybmFtZXMgYXdhcmRlZFxuICAgICAgICBEYXRhIC0-PisgV2Vic2l0ZTogcHVibGlzaFxuICAgIGVuZFxuXG5cbiAgICByZWN0IHJnYig3MCwgMTAwLCAxMDApXG4gICAgICAgIG5vdGUgbGVmdCBvZiBEZXZlbG9wZXI6IEZpbmQgaWYgZWxpZ2libGUgYW5kIGNsYWltXG4gICAgICAgIERldmVsb3BlciAtPj4gV2Vic2l0ZTogQXV0aCB3aXRoIEdpdEh1YlxuICAgICAgICBXZWJzaXRlIC0-PiBXZWJzaXRlOiBjaGVjayBpZiB1c2VyIGlzIGFtb25nIEdpdEh1YiB1c2VybmFtZXNcbiAgICAgICAgV2Vic2l0ZSAtPj4gRGV2ZWxvcGVyOiBhc2sgdG8gcnVuIG1ha2VfcHJvb2Yuc2hcbiAgICAgICAgRGV2ZWxvcGVyIC0-PiBEZXZlbG9wZXI6IHJ1biBtYWtlX3Byb29mLnNoXG4gICAgICAgIG5vdGUgcmlnaHQgb2YgRGV2ZWxvcGVyOiBnb3QgTWVya2xlIFByb29mLCBsZWFmLCBzaWduYXR1cmUsIFBLXG4gICAgICAgIERldmVsb3BlciAtPj4gV2Vic2l0ZTogc3VibWl0IE1lcmtsZSBQcm9vZiwgbGVhZiwgc2lnbmF0dXJlLCBQS1xuICAgICAgICBub3RlIGxlZnQgb2YgV2Vic2l0ZTogdmFsaWRhdGUgZGF0YVxuICAgICAgICBXZWJzaXRlIC0-PiBXZWJzaXRlOiB2YWxpZGF0ZSBvZmZjaGFpblxuICAgICAgICByZWN0IHJnYigxMDAsIDEwMCwgNzApXG4gICAgICAgICAgICBXZWJzaXRlIC0-PiBUb2tlbkRpc3RyaWJ1dG9yOiBjYWxsIFRva2VuRGlzdHJpYnV0b3IuY2xhaW1cbiAgICAgICAgICAgIG5vdGUgcmlnaHQgb2YgVG9rZW5EaXN0cmlidXRvcjogdXNlcl9pZCBoYXMgbm90IHlldCBjbGFpbWVkXG4gICAgICAgICAgICBub3RlIHJpZ2h0IG9mIFRva2VuRGlzdHJpYnV0b3I6IGxlYWYgPT0ga2VjY2FrKHVzZXJfaWQsIFBLKVxuICAgICAgICAgICAgbm90ZSByaWdodCBvZiBUb2tlbkRpc3RyaWJ1dG9yOiBFQ0RTQS5yZWNvdmVyKGxlYWYsIHNpZ25hdHVyZSkgPT0gUEtcbiAgICAgICAgICAgIG5vdGUgcmlnaHQgb2YgVG9rZW5EaXN0cmlidXRvcjogaXNWYWxpZChNZXJrbGUgUHJvb2YsIE1lcmtsZSBSb290KVxuICAgICAgICAgICAgVG9rZW5EaXN0cmlidXRvciAtPj4gVG9rZW5EaXN0cmlidXRvcjogRkxULnRyYW5zZmVyKHRyYW5zZmVyVG9BZGRyKVxuICAgICAgICAgICAgVG9rZW5EaXN0cmlidXRvciAtPj4gVG9rZW5EaXN0cmlidXRvcjogRkxULmRlbGVnYXRlKGRlbGVnYXRlVG9BZGRyKVxuICAgICAgICAgICAgVG9rZW5EaXN0cmlidXRvciAtPj4gVG9rZW5EaXN0cmlidXRvcjogc2F2ZSB1c2VyX2lkIGFzIGNsYWltZWRcbiAgICAgICAgICAgIFRva2VuRGlzdHJpYnV0b3IgLT4-IFdlYnNpdGU6IHN1Y2Nlc3NcbiAgICAgICAgZW5kXG4gICAgICAgIFdlYnNpdGUgLT4-IERldmVsb3Blcjogbm90aWZ5IHRoYXQgdG9rZW5zIGFyZSBzZW50XG4gICAgZW5kXG4gICAgZW5kIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRhcmsifSwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ