pragma solidity ^0.4.4;

contract Bidding {
  string name;
  string description;
  uint duration;
  uint startPrice;
  address itemOwner;
  
  /*
  * information represents the high bidder;
  */
  struct HighBidder {
    address addr;
    string name;
    uint bid;
  }

  event HighBidChanged(address addr, string nm, uint newHighBid);
  event BidFailed(string nm, uint newHighBid);
  address[] temp;
  address[] highBidderAddresses = [address(this)];
  HighBidder highBidder;
  mapping(address => HighBidder) highBidders;
 
  modifier ownerOnly {
    if (itemOwner == msg.sender) {
      _;
    } else {
      assert(false);
    }
  }

  function Bidding(string nm, string desc, uint dura, uint sp, address owner) {
    itemOwner = owner;
    name = nm;
    description = desc;
    duration = now + dura;
    startPrice = sp;
    highBidder = HighBidder(address(this), "contract", sp);
  }

  function placeBid(string bidder) payable {

    if (now > duration) {
        revert();
    }
    if (msg.value > highBidder.bid) {
         highBidder = HighBidder(msg.sender, bidder, msg.value); // last high bidder;
         highBidders[msg.sender] = highBidder;  // store this high bidder in the list of high bidders;
         highBidderAddresses.push(msg.sender); // keep track of bidder addresses;
         HighBidChanged(msg.sender, bidder, msg.value);
     } else {
         BidFailed(bidder, msg.value);
     }
  }

  function claimBidAmount() returns (uint) {
    bool hasEthers = false;
    address[] memory swap;
    HighBidder memory hb;

    for ( uint i = 0; i < highBidderAddresses.length; i++) {
       // check to see if this person has previously sent ethers to the contract
        if (msg.sender == highBidderAddresses[i] && highBidderAddresses[i] != highBidder.addr) {
             hasEthers = true;
        } else {
           temp.push(highBidderAddresses[i]);
        }

        highBidderAddresses.length = 0;
        swap = temp;
        highBidderAddresses = temp;
        temp = highBidderAddresses;

        if (hasEthers) {
            hb = highBidders[msg.sender];
            highBidders[msg.sender] = HighBidder(0x0, "", 0);
            msg.sender.transfer(hb.bid);
        } else {
            revert();
        }    
  }
}

function getHighBid() returns (uint) {
  return highBidder.bid;
}

function bidEnd() ownerOnly {
    selfdestruct(itemOwner);
}

}
