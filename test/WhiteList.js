require('truffle-test-utils').init();
require('chai').use(require('chai-as-promised')).should();
const Reverter = require('./helpers/reverter');
const Asserts = require('./helpers/asserts');
const WhiteList = artifacts.require('WhiteList');

contract('WhiteList', function(accounts) {
    const reverter = new Reverter(web3);
    afterEach('revert', reverter.revert);

    let token;
    let owner = web3.eth.accounts[0];
    const ERROR_MSG = 'VM Exception while processing transaction: revert';

    before('setup', () => {
        return WhiteList.deployed()
            .then(instance => token = instance)
            .then(reverter.snapshot);
    });

    it('owner', async function() {
        let token_owner = await token.owner();
        assert.equal(token_owner, owner);
    });

    it('add investor', async function() {
        // allow for owner
        let account1 = web3.eth.accounts[1];
        let result = await token.addInvestor(account1);
        assert.web3Event(result, {
            event: 'Investor',
            args: {
                _address: account1
            }
        }, 'The event is emitted');
        // denied for non-owner
        let account2 = web3.eth.accounts[2];
        result = await token.addInvestor(account1, {from: account2}).should.be.rejectedWith(ERROR_MSG);
    });

    it('payable', async function() {
        // allow for investor
        let account1 = web3.eth.accounts[1];
        let amount = Number(web3.toWei(0.001, "ether"));
        await token.addInvestor(account1);
        let result = await token.sendTransaction({ from: account1, gas: 50000, value: amount});
        assert.web3Event(result, {
            event: 'Buy',
            args: {
                investor: account1,
                amount: amount
            }
        }, 'The event is emitted');

        // denied for non-investor
        let account2 = web3.eth.accounts[2];
        await token.sendTransaction({ from: account2, gas: 50000, value: amount}).should.be.rejectedWith(ERROR_MSG);
    });

});