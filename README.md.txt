To start the contract go to DAPP folder and type "npm i" in CLI, then go to client folder and again type "npm i". Then from client folder u can type "npm start" in CLI and soon
project will run on http://localhost:3000.
Contract address on Ropsten test network: "0x1049685f74f5d2e927e4ca128f29b49b4ef48167"
Contract ABI and address can be found in DAPP/client/src/utils
Github REPO: https://github.com/AndonMitev/DAPP
Compiler version: 0.5.6

Market place contract
Contract is separated on three states. Owner, team members and guests.

1.Owner can access new members.

2.Team members can set items in store.

3.Guests are free to browse items and buy them.

Used patterns:
- Check effects pattern: Make sure to validate input arguments, mutate locale state, finally make external calls / transfers.
- Overflow/Underflow secure via SafeMath so we will make sure everything fit in uint 256.
- Re-entrnacy: Like we said in our check effects pattern, first we validate if user has enough amount to withdraw,
then we mutate locale state of user balance, and finally we use "transfer", to make external call. Prefering "transfer" over "send", because "transfer" will throw error if fail

// TODO for sunday:
- Add 5+ unit tests for each contract
- Add created modifiers