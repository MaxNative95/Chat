import React, { useState, useEffect } from "react";

import socketIoClient from "socket.io-client";
import contract from './contracts/NFTCollectible.json';
import { ethers } from 'ethers';
import { Button } from 'react-bootstrap';
import './index.css'

const contractAddress = "0x355638a4eCcb777794257f22f50c289d4189F245";
const abi = contract.abi;
const socket = socketIoClient("http://localhost:8463", { autoConnect: false });


const Message = ({ msg, account }) => {

  return (
    <div className="msg">
      <span> User : {account} </span><span> {new Date(msg.date).toLocaleDateString()} </span>
      <span> {msg.content} </span>
    </div>
  );

};


const MessageBox = () => {

  const [value, setValue] = useState("");

  const postMessage = e => {
    e.preventDefault();

    if (!value) return;

    socket.emit("message", value);

    setValue("");
  };

  return (
    <form onSubmit={postMessage}>
      <input type="text" className="input" placeholder="message"
        value={value} onChange={e => setValue(e.target.value)}
      />
    </form>
  );

};


const Chat = () => {

  const [messages, setMessages] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have Metamask installed!");
      return;
    } else {
      console.log("Wallet exists! We're ready to go!")
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account: ", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }
  }

  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("Please install Metamask!");
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      console.log("Found an account! Address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err)
    }
  }

  const mintNftHandler = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {

        await window.ethereum.request({
          method: "wallet_requestPermissions",
          params: [
            {
              eth_accounts: {}
            }
          ]
        });

        /*const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("Initialize payment");
        let nftTxn = await nftContract.mintNFTs(1, { value: ethers.utils.parseEther("0.01") });

        console.log("Mining... please wait");
        await nftTxn.wait();

        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        */

      } else {
        console.log("Ethereum object does not exist");
      }

    } catch (err) {
      console.log(err);
    }
  }

  const connectWalletButton = () => {
    return (
      // <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
      //   Connect Wallet
      // </button>
      <header className="App-header">
        <Button variant="secondary" onClick={connectWalletHandler} disabled={currentAccount ? true : false}>
          <img src="images/metamask.svg" alt="MetaMask" width="50" height="50" /> Connect to MetaMask
        </Button>
        <div className="mt-2 mb-2">
          Connect Account: {currentAccount ? currentAccount : ''}
        </div>
        {/* {
          currentAccount &&
          <div className="chat-button-container">
            <Button onClick={goTo}>
              Start Chat
        </Button>
          </div>
        } */}
      </header>
    )
  }

  const mintNftButton = () => {
    return (
      <div className='' style={{ color: '#fff', textAlign:'center' }}>
        Online and Connected
      </div>
    )
  }

  const addMessage = (msg) => {
    setMessages(oldMessages => [...oldMessages, ...(Array.isArray(msg) ? msg.reverse() : [msg])]);
  };

  useEffect(() => {

    checkWalletIsConnected();

    socket.on("latest", (data) => {
      // expect server to send us the latest messages
      addMessage(data);
    });
    socket.on("message", (msg) => {
      addMessage(msg);
    });

    socket.connect();

  }, []);

  return (
    <div>
      <div>
        {currentAccount ? mintNftButton() : connectWalletButton()}
      </div>

      {currentAccount && (
        <div className="App-header">
          <div id="msgBox">
            {messages.map((msg, index) => <Message account={currentAccount} msg={msg} />)}
          </div>
          <MessageBox />
        </div>
      )}


    </div>
  );

};



export default Chat;
