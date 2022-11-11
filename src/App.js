import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Buffer } from 'buffer'
// import {logo} from './logo.svg'

function App() {
  const [haveMetamask, sethaveMetamask] = useState(true);
  const [accountAddress, setAccountAddress] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  
  var account = null
  var address = ethereum.selectedAddress
  var token = null

  console.log(token)

  // useEffect(() => {
  //   const { ethereum } = window;
  //   const checkMetamaskAvailability = async () => {
  //     if (!ethereum) {
  //       sethaveMetamask(false);
  //     }
  //     sethaveMetamask(true);
  //   };
  //     checkMetamaskAvailability();
  // }, []);


  async function login() {
    if (account === null || address === null) {
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts'
      })
      account = accounts[0]
      address = ethereum.selectedAddress

      const [status_code, nonce] = await get_nonce()
      if (status_code === 404) {
        const registered = await register()
        if (!registered) {
          return
        }
        await login()
      }else if (status_code != 200) {
        return
      }
    }
  }

  async function get_nonce() {
    const reqOpts = {
      method: "GET",
      headers: {"Content-Type": "application/json"},
    }
    const response = await fetch("http://localhost:8001/users/"+address+"/nonce", reqOpts)
    if (response.status === 200) {
      const data = await response.json()
      const nonce = data.Nonce
      return [200, nonce]
    }
    return [response.status, ""]
  }

  async function register() {
    const reqOpts = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ 
        address: address, 
      })
    }
    const response = await fetch("http://localhost:8001/register", reqOpts)
    if (response.status === 201) {
      return true
    }
    return false
  }

  async function sign(nonce) {
    const buff = Buffer.from(nonce, "utf-8");
    const signature = await ethereum.request({
      method: "personal_sign",
      params: [ buff.toString("hex"), account],
    })
    return signature
  }
  async function perform_signin(sig, nonce) {
    const reqOpts = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ 
        address: address, 
        nonce: nonce
        })
    }
    const response = await fetch("http://localhost:8001/signin", reqOpts)
    if (response.status === 200) {
      const data = await response.json()
      return data
    }
    return null
  }


  // const connectWallet = async () => {
  //   try {
  //     if (account == null || address == null) {
  //       sethaveMetamask(false);
  //     }
  //     const accounts = await ethereum.request({
  //       method: 'eth_requestAccounts',
  //     });
  //     let balance = await provider.getBalance(accounts[0]);
  //     let bal = ethers.utils.formatEther(balance);
  //     setAccountAddress(accounts[0]);
  //     setAccountBalance(bal);
  //     setIsConnected(true);
  //   } catch (error) {
  //     setIsConnected(false);
  //   }
  // };

  return (
    <div className="App">
      <header className="App-header">
        {haveMetamask ? (
          <div className="App-header">
            {isConnected ? (
              <div className="card">
                <div className="card-row">
                  <h3>Wallet Address:</h3>
                  <p>
                    {accountAddress.slice(0, 4)}...
                    {accountAddress.slice(38, 42)}
                  </p>
                </div>
                <div className="card-row">
                  <h3>Wallet Balance:</h3>
                  <p>{accountBalance}</p>
                </div>
              </div>
            ) : (
              <span>Not connected</span>
            )}
            {isConnected ? (
              <p className="info">🎉 Connected Successfully</p>
            ) : (
              <button className="btn" onClick={login}>
                Connect
              </button>
            )}
          </div>
        ) : (
          <p>Please Install MataMask</p>
        )}
      </header>
    </div>
  );
}

export default App;
