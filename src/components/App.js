import React, { Component } from 'react';
import logo from '../logo.png';
import Web3 from 'web3';
import Marketplace from '../abis/Marketplace.json';
import Navbar from './Navbar';
import Main from './Main';
import './App.css';

class App extends Component {

  async componentWillMount(){
    await this.loadweb3()
    await this.loadBlockchainData()
    console.log(window.web3);
  }

  async loadweb3(){
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if(window.web3){
      window.web3 = new Web3(window.web3)
    }
    else{
      window.alert("Install Metamask")
    }
  }

  async loadBlockchainData(){
    const web3 = window.web3;
     
    const accounts = await web3.eth.getAccounts();
    this.setState({account: accounts[0]})
    
    const networkId = await web3.eth.net.getId()
    const networkData = Marketplace.networks[networkId]
    if(networkData){
        const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address)
        this.setState({marketplace})
        const productCount = await marketplace.methods.productCount.call()
        console.log(productCount.toString())
        this.setState({productCount})
        for(var i=1 ; i <= productCount; i++)
        {
          const product = await marketplace.methods.products(i).call()
          this.setState({
            products:[...this.state.products, product]
          })
        }
        this.setState({loading: false})
    }else{
      window.alert('Marketplace contract not deployed to detected network.')

    }
    
    
  }

  constructor(props){
    super(props);
    this.state = {
      account: 0x0,
      productCount: 0,
      products: [],
      loading: true
    }
    this.createProduct = this.createProduct.bind(this)
    this.purchaseProduct = this.purchaseProduct.bind(this)
  }

  createProduct(name,price){
    alert("Hi");
    this.setState({loading: true})
    this.state.marketplace.methods.createProduct(name, price).send({from: this.state.account})
    .once('receipt', (receipt) => {console.log(receipt)
      this.setState({loading: false})
    })
  }
  purchaseProduct(_id, _price){
    this.setState({loading: true})
    this.state.marketplace.methods.purchasedProduct(_id).send({from: this.state.account, value: _price})
    .once('receipt', (receipt) => {console.log(receipt)
      this.setState({loading: false})
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
                  <div className="row">
                        <main role="main" className="col-lg-12 d-flex">
                          {this.state.loading ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div> : 
                          <Main 
                            products = {this.state.products}
                            createProduct={this.createProduct}
                            purchaseProduct={this.purchaseProduct}/> }
                        </main>
                  </div>
        </div>
      </div>    
    );
  }
}

export default App;
