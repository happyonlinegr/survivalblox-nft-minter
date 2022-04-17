import React, { useState, useEffect } from 'react';
//import { useDispatch, useSelector } from "react-redux";
import {
  VStack,
  useDisclosure,
  Button,
  Text,
  HStack,
  Select,
  Input,
  Box,
  Flex,
  Square,
  Spacer
} from "@chakra-ui/react";
import SelectWalletModal from "./Modal";
import { useWeb3React } from "@web3-react/core";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";
import { networkParams } from "./networks";
import { connectors } from "./connectors";
import { toHex, truncateAddress } from "./utils";
//import { connect } from "./redux/blockchain/blockchainActions";
//import { fetchData } from "./redux/data/dataActions";
import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";

function App() {
  //const dispatch = useDispatch();
  //const data = useSelector((state) => state.data);  
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click claim to mint your NFT.`);
  const [mintAmount, setMintAmount] = useState(1);	
  //const [signature, setSignature] = useState("");
  //const [error, setError] = useState("");
  const [smartContract, setSmartContract] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  
  const [network, setNetwork] = useState(undefined);
  const [message, setMessage] = useState("");
  //const [signedMessage, setSignedMessage] = useState("");
  //const [verified, setVerified] = useState();  
  
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });	

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    library,
    chainId,
    account,
    activate,
    deactivate,
    active
  } = useWeb3React();

  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };
  const handleInput = (e) => {
    const msg = e.target.value;
    setMessage(msg);
  };


  /*const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(network) }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[toHex(network)]]
          });
        } catch (error) {
          setFeedback(error);
        }
      }
    }
  };*/
  
  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
    setNetwork("");
    //setMessage("");
    //setSignature("");
    //setVerified(undefined);
  };

  const disconnect = () => {
    refreshState();
    deactivate();
  };
 //const blockchain = useSelector((state) => state.blockchain);   
 const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
	setClaimingNft(true);
	if (chainId == CONFIG.NETWORK.ID) {
		smartContract.methods
		  .mintQueenChiku(1)
		  .send({
			gasLimit: String(totalGasLimit),
			to: CONFIG.CONTRACT_ADDRESS,
			from: account,
			value: totalCostWei,
		  })
		  .once("error", (err) => {
			console.log(err);
			setFeedback("Sorry, something went wrong please try again later.");
			setClaimingNft(false);
		  })
		  .then((receipt) => {
			console.log(receipt);
			setFeedback(
			  `WOW, the ${CONFIG.NFT_NAME} is yours! go visit tofunft.com to view it.`
			);
			setClaimingNft(false);
			//dispatch(fetchData({account}));
		  });
	} else {
		setClaimingNft(false);
		setFeedback("Please switch your Network to ${CONFIG.NETWORK.NAME} ");
	};
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  /*const getData = () => {
    if (account !== "" && smartContract !== null) {
      dispatch(fetchData(blockchain.account));
	  console.log(smartContract);
    }
  };*/
  
  
  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };
  
  
  const getSmartContract = async () => {
	  
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();	  
	  
	const { ethereum } = window;

    Web3EthContract.setProvider(ethereum);
    let web3 = new Web3(ethereum);
    try {
	  const SmartContract = new Web3EthContract(
		abi,
		CONFIG.CONTRACT_ADDRESS
	  );
	  
		setSmartContract(SmartContract);
		
		const totalSupply = await SmartContract.methods.totalSupply().call();
		
		setTotalSupply(totalSupply);
		
	  } catch (err) {
		console.log("Something went wrong.");
      }
	 
  };    

  useEffect(() => {
    getConfig();
	getSmartContract();
  }, []);  

  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    if (provider) activate(connectors[provider]);
  }, []);

  return (
    <>
      <VStack justifyContent="center" alignItems="center" h="100vh">
        <HStack marginBottom="10px">
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
          >
            SurvivalBlox
          </Text>
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
            sx={{
              background: "linear-gradient(90deg, #1652f0 0%, #b9cbfb 70.35%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            NFT
          </Text>
        </HStack>
        <HStack>
          {!active ? (
            <Button onClick={onOpen}>Connect Wallet</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text>{`Connection Status: `}</Text>
            {active ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>

          <Tooltip label={account} placement="right">
            <Text>{`Account: ${truncateAddress(account)}`}</Text>
          </Tooltip>
          <Text>{`Network ID: ${chainId ? chainId : "No Network"}`}</Text>
          </VStack>
		
		 {Number(totalSupply) >= CONFIG.MAX_SUPPLY ? (
		 <VStack></VStack>
		 ) : (
		  <VStack>
			  <Text>
			  {totalSupply} / {CONFIG.MAX_SUPPLY}
			  </Text>
			  <HStack spacing='6px'>
				<Square>
				  <Button
					style={{ lineHeight: 0.4 }}
					disabled={claimingNft ? 1 : 0}
					onClick={(e) => {
					  e.preventDefault();
					  decrementMintAmount();
					}}
				  >
					-
				  </Button>	
				</Square>
				<Spacer />
				<Square>
				  <Input 
				  maxW="80px"
				  value={mintAmount}>
				  </Input>	
				</Square>
				<Spacer />
				<Square>			
				  <Button
					disabled={claimingNft ? 1 : 0}
					onClick={(e) => {
					  e.preventDefault();
					  incrementMintAmount();
					}}
				  >
					+
				  </Button>	
				</Square>
			  </HStack>
			  <HStack justifyContent="flex-start" alignItems="flex-start">
				<Box
				  maxW="sm"
				  borderWidth="1px"
				  borderRadius="lg"
				  overflow="hidden"
				  padding="10px"
				>
				  <VStack>
				   <Button
						disabled={claimingNft || chainId != 56 ? 1 : 0}
						onClick={(e) => {
						  e.preventDefault();
						  claimNFTs();
						  //getData();
						}}
					  > 
					   {chainId == 56 ? (
						  <Box>
						  {claimingNft ? "Loading" : "Claim ${mintAmount} NFT"}
						  </Box>
						) : (
						  <Box>
						  {chainId ? "Wrong Network" : "Connect to Claim"}
						  </Box>
						)}
					  </Button>
				  </VStack>
				</Box>
			  </HStack>	
			  <HStack justifyContent="flex-start" alignItems="flex-start">
				<Text>
				  {feedback}
				</Text>
			   </HStack>	
		   </VStack>	
		 )}
		
        
      </VStack>
      <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
    </>
  );
}

export default App;