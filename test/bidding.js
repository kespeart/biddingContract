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
});
