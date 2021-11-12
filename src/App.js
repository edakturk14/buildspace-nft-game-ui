import React, { useEffect, useState } from 'react';
import LoadingIndicator from './Components/LoadingIndicator';

import './App.css';

import SelectCharacter from './Components/SelectCharacter';
import twitterLogo from './assets/twitter-logo.svg';

import Arena from './Components/Arena';

// talk to the smart contract
import { ethers } from 'ethers';

//get the contract 
import myEpicGame from './utils/MyEpicGame.json';
import  { CONTRACT_ADDRESS, transformCharacterData } from './constants';

// footer
const TWITTER_HANDLE = 'edatweets_';
const TWITTER_HANDLE_BUILDSPACE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TWITTER_LINK_BUILDSPACE = `https://twitter.com/${TWITTER_HANDLE_BUILDSPACE}`;

const App = () => {
  // State
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      const currentNetwork = ethereum.networkVersion;
      console.log("Current network", currentNetwork);

      if(currentNetwork != 4){
        setCurrentAccount(null);
        return;
      };

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  };


const renderContent = () => {

  if (isLoading) {
    return <LoadingIndicator />;
  }


  if (!currentAccount) {
    return (
      <div className="connect-wallet-container">
        <img
          src="https://imgix.gizmodo.com.au/content/uploads/sites/2/2021/02/20/gvxtolg2vpzafciu1lob.gif?ar=16%3A9&auto=format&fit=crop&q=65&w=720&nrs=40&fm=gif"
          alt="Monty Python Gif"
        />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect Wallet on Rinkeby To Start
        </button>
      </div>
    );
  } else if (currentAccount && !characterNFT) {
    return <SelectCharacter setCharacterNFT={setCharacterNFT} />;	

  } else if (currentAccount && characterNFT) {
     return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
  }
}; 

  /*
   * Implement your connectWallet method here
   */
  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      const currentNetwork = ethereum.networkVersion;
      console.log("Current network", currentNetwork);
      if(currentNetwork != 4){
        alert('Connect to Rinkeby!');
        return;
      };


      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

// UseEffects
useEffect(() => {

  setIsLoading(false);
  checkIfWalletIsConnected();
}, []);

// check if the user has an nft to play the game
useEffect(() => {

  const fetchNFTMetadata = async () => {
    console.log('Check for Character NFT on address:', currentAccount);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      myEpicGame.abi,
      signer
    );

  const txn = await gameContract.checkIfUserHasNFT();
    if (txn.name) {
      console.log('yay! User has character NFT');
      setCharacterNFT(transformCharacterData(txn));
    }
    setIsLoading(false);
  };
  
  if (currentAccount) {
    console.log('CurrentAccount:', currentAccount);
    fetchNFTMetadata();
  
  }
}, [currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Find the best NFT</p>
          <p className="sub-text">Help Eda make 100x gainz before the Bear Market!</p>
          <div className="connect-wallet-container">
            {/*
             * Button that we will use to trigger wallet connect
             * Don't forget to add the onClick event to call your method!
             */}
             {renderContent()}
          </div>
        </div>

        <div className="footer-container">
            <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
            <a className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`built by @${TWITTER_HANDLE}`}</a>
            <br />
            <a className="footer-text"
              href={TWITTER_LINK_BUILDSPACE}
              target="_blank"
              rel="noreferrer"
            >{`// from @${TWITTER_HANDLE_BUILDSPACE} `}</a>
        </div>

      </div>
    </div>
  );
};

export default App;