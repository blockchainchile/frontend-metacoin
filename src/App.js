import React, { Component } from 'react';
import './App.css';

import web3 from './web3setup'
import Contract  from 'truffle-contract'
import metacoin_artifacts from './contracts/MetaCoin.json'



class App extends Component {

  constructor(props) {
    super(props);

    this.MetaCoin=Contract(metacoin_artifacts);
    this.MetaCoin.setProvider(web3.currentProvider);

    this.state = {
      status: '',
      balance: 0,
      account: ''
    };

    this.refreshBalance = this.refreshBalance.bind(this);
    this.sendCoin = this.sendCoin.bind(this)
  }

  componentDidMount(){
    let self=this;
    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err !== null) {
        self.setState({status: "There was an error fetching your accounts."});
      }else{
        if (accs.length === 0) {
          self.setState({status: "Couldn't get any accounts! Make sure your Ethereum client is configured correctly."});
        }else{
          self.setState({account: accs[0]})
          self.refreshBalance();
        }
      }
    });
  }


  refreshBalance(){
    let self=this;
    let meta;
    self.MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getBalance.call(self.state.account);
    }).then(function(value) {
      console.log("Balance:"+value)
      self.setState({balance: value.valueOf()});
    }).catch(function(e) {
      console.log(e);
      self.setState({status: "Error getting balance; see log."});
    });
  }


  sendCoin(){
    let self=this;
    let amount = parseInt(self.refs.amount.value,10);
    let receiver = self.refs.receiver.value;

    self.setState({status: "Initiating transaction... (please wait)"});

    var meta;
    self.MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.sendCoin(receiver, amount, {from: self.state.account});
    }).then(function() {
      self.setState({status: "Transaction complete!"});
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setState({status: "Error sending coin; see log."});
    });


  }


  render() {
    return (
      <div className="App">
        <h1>MetaCoin</h1>
        <h3>Your account <span className="black"><span id="account">{ this.state.account }</span></span></h3>
        <h3>You have <span className="black"><span id="balance">{ this.state.balance }</span> META</span></h3>
        <br/>
        <h1>Send MetaCoin</h1>
        <br/><label htmlFor="amount">Amount:</label><input type="text" ref="amount" placeholder="e.g., 95"></input>
        <br/><label htmlFor="receiver">To Address:</label><input type="text" ref="receiver" placeholder="e.g., 0x93e66d9baea28c17d9fc393b53e3fbdd76899dae"></input>
        <br/><br/><button id="send" onClick={ this.sendCoin }>Send MetaCoin</button>
        <br/><br/>
        <span id="status">{this.state.status}</span>
        <br/>
        <span className="hint"><b>Hint:</b> open the browser developer console to view any errors and warnings.</span>
      </div>
    );
  }
}

export default App;
