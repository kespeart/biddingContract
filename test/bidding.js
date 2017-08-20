var Bidding = artifacts.require("./Bidding.sol");

contract('Bidding', function(accounts) {
  var contract;
  var initialBid = 50;
  beforeEach(function() {
      return Bidding.new('car', 'cadilac', 3600, initialBid, accounts[0]).then(function(instance){
         contract = instance;
      });
  });

  it("starting bid should be the same as initialBid", function() {
    contract.getHighBid.call().then(function(value){
      assert.equal(value.toNumber(), initialBid);
    });   
  });

  it('should return HighBidChanged event when a new high bit is place', function() {
    contract.placeBid('John', {from: accounts[1], value:1000}).then(function(result){
        assert.equal('HighBidChanged', result.logs[0].event);
        assert.equal(1000, result.logs[0].args.newHighBid.toNumber());
        assert.equal('John', result.logs[0].args.nm);
    });
  });

  it("should return BidFailed when a new mid is lower than the current bid", function() {
    contract.placeBid('John', {from: accounts[1], value:1000})
    .then(function(){
      return contract.placeBid('John', {from: accounts[0], value:800});
    }).then(function(result){
      assert.equal('BidFailed', result.logs[0].event);
    });
  });
  
  it('should allow user to claim funds if their high bid has been replaaced', function() {
      var balances = [];
      // store the balances of all the accounts;    
      for(var account of accounts){
        balances.push(web3.eth.getBalance(account).toNumber());
      }
      // place a bid from account 1
       contract.placeBid('John', {from: accounts[1], value: web3.toWei(1)}).then(function(result){
        // check that account[1] balance is lower than the original
        assert.isBelow(web3.eth.getBalance(accounts[1]).toNumber(), balances[1]);
        // update account[1] balance;
        balances[1] = web3.eth.getBalance(accounts[1]).toNumber();
        // place a bid from account[2]
        return contract.placeBid('Mark', {from: accounts[2], value:web3.toWei(2)});
      }).then(function(){
          // account[1] is no long the high bidder so claim funds
          return contract.claimBidAmount({from: accounts[1]});
      }).then(function(){
        // account[1] bid got refunded therefore the new balance should be higher than the stored balance
        assert.isAbove(web3.eth.getBalance(accounts[1]).toNumber(), balances[1]);
        // should throw an error as account[1] no longer has a high;
        return contract.claimBidAmount({from: accounts[1]});
      }).then(function(result, error){
        // this statement will not execute because account[1] no longer have funds to claim
         assert.equal(false, true);
      }).catch(function(error){
         assert.equal(true, !!error);
         return null;
      }).then(function(){
        return contract.claimBidAmount({from: accounts[2]});
      }).then(function(){
        assert.equal(false, true);
      })
      .catch(function(error){
        // current high bidder cannot claim funds;
        assert.equal(true, !!error);
      })
  });

});
