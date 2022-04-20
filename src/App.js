import React, { useState, useEffect } from 'react';
import store from "./redux/store";
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
  Link,
  Spacer,
  Container,
  Spinner,
  Image,
  ChakraProvider
} from "@chakra-ui/react";
import SelectWalletModal from "./Modal";
import { useWeb3React } from "@web3-react/core";
import { CheckCircleIcon, WarningIcon,AddIcon,MinusIcon,ArrowBackIcon,CopyIcon,CloseIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";
import { networkParams } from "./networks";
import { connectors } from "./connectors";
import { toHex, truncateAddress } from "./utils";
import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";
import fonts from './fonts';
import { extendTheme } from '@chakra-ui/react';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';


function App() {
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState("Click to claim your NFT.");
  const [mintAmount, setMintAmount] = useState(1);	
  const [smartContract, setSmartContract] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  
  const [network, setNetwork] = useState(undefined);
  const [message, setMessage] = useState("");
  
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
  
  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
    setNetwork("");
  };

  const disconnect = () => {
    refreshState();
    deactivate();
  }; 
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
		  });
	} else {
		setClaimingNft(false);
		setFeedback(`Please switch your Network to ${CONFIG.NETWORK.NAME} `);
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
		
	  const totalSupply =  SmartContract.methods.totalSupply().call();

	  SmartContract.methods
	    .totalSupply()
	    .call()
	    .then((resukt) => {
		setTotalSupply(resukt);	
	    });		
		
	  } catch (err) {
		console.log("Something went wrong.");
      }
	 
  };    

  useEffect(() => {
    getConfig();
	getSmartContract();
  }, []);  


  useEffect(() => {
  if(window.ethereum) {
    window.ethereum.on('chainChanged', () => {
      getSmartContract();
    })
    window.ethereum.on('accountsChanged', () => {
      getSmartContract();
    })
  }
  }, []);  


  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    if (provider) activate(connectors[provider]);
  }, []);

  return (
    <>

    
	<ChakraProvider theme={fonts}>
	  <HStack justifyContent="space-between" position="relative" background= "#1e1d32" paddingLeft="20px" paddingRight="20px" height="80px">
		<Box>
			<Link _hover={{color:"#fff"}} fontSize=".85em" color="#3dcfd7" href='https://survivalblox.com' isExternal>
			  <ArrowBackIcon /> BACK TO WEBSITE
			</Link>
		</Box>	  
		<Box>
		  {!active ? (
			<Button 
			  fontSize=".85em"
			  background="linear-gradient(to right, #3dd0d8 0%, rgba(124, 105, 227, 0.64) 100%)"
			  color="white"
			  letterSpacing = "1px"
			  borderRadius="60px"
			  transition= "background 0.3s"
				_hover={{
					background: '#3dd0d8',
				}}
			onClick={onOpen}><Text><CopyIcon /> CONNECT</Text></Button>
		  ) : (
			<Button 
			  fontSize=".85em"
			  background="linear-gradient(to right, #e92750, #ab27e9 100%)"
			  color="white"
			  letterSpacing = "1px"
			  borderRadius="60px"
			  transition= "background 0.3s"
				_hover={{
					background: '#3dd0d8',
				}}
			 onClick={disconnect}><Text><CloseIcon /> DISCONNECT</Text></Button>
		  )}
		</Box>
	  </HStack>
      <Box paddingTop="10rem" background="#1e1d32" justifyContent="center" alignItems="center" minHeight="100vh" paddingBottom="2rem" color="white">
	    <Container maxW="1000px" background="#292845" borderRadius="15px" padding="0px 90px 90px 90px">
			<VStack>
				<Image position="relative" transform="translateY(-50%)" marginBottom="-8rem" src='/logo.png' />
				<HStack marginBottom="10px">
				  <Text
					margin="0"
					lineHeight="1.15"
					fontSize={["1.5em", "2em", "2.5em", "3em"]}
					fontWeight="900"
				  >
					MINT
				  </Text>				  
				  <Text
					margin="0"
					lineHeight="1.15"
					fontSize={["1.5em", "2em", "2.5em", "3em"]}
					fontWeight="900"
					sx={{
					  background: "linear-gradient(90deg, #3dd0d8 0%, #7c69e3 70.35%)",
					  WebkitBackgroundClip: "text",
					  WebkitTextFillColor: "transparent"
					}}
				  >
					NFT
				  </Text>
				</HStack>
				<VStack justifyContent="center" alignItems="center" padding="10px 0">
				  <HStack>
					<Tooltip label={account} placement="right"><Text>{`${truncateAddress(account)}`}</Text></Tooltip>
					{active ? (
					  <CheckCircleIcon color="#3dcfd7" />
					) : (
					  <WarningIcon color="#df4d81" />
					)}
				  </HStack>

				  </VStack>
				  
				 {smartContract === null ? (
				 <VStack>
					<Text>
					  Sorry, something went wrong.
					</Text>
					<Text>
					  Could not load data from Contract.
					</Text>			
					<Text>
					  Please try again later.
					</Text>
				 </VStack>
				 ) : (
				 <>
				 {Number(totalSupply) >= CONFIG.MAX_SUPPLY ? (
				 <VStack>
					<Text>
					  The sale has ended.
					</Text>
					<Text>
					  You can still find {CONFIG.NFT_NAME} on <a target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>{CONFIG.MARKETPLACE}</a>	
					</Text>
				 </VStack>
				 ) : (
				  <VStack>
					  {totalSupply ? (
					  <>
					  <VStack marginBottom="2rem" marginTop="2rem">
					  <Text color="#c2d4f8" textShadow="0 2px 4.8px rgb(0 0 0 / 30%)" fontSize={["1.25em", "1.5em", "1.75em", "2em"]} fontWeight="600">
					  {totalSupply} / {CONFIG.MAX_SUPPLY}
					  </Text>
					  </VStack>
					  <HStack spacing='12px'>
						<Square>
						  <Button
							background="rgba(24, 23, 40, 0.8)"
							color="#fff"
							borderRadius="100%"
							width="50px"
							height="50px"
							fontSize={["1.25em", "1.5em", "1.75em", "2em"]}
							style={{ lineHeight: 0.4 }}
							disabled={claimingNft || chainId != CONFIG.NETWORK.ID ? 1 : 0}
							_hover = {{
								color : "#1e1d32"
							}}							
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
						  <Box 
						  disabled={claimingNft || chainId != CONFIG.NETWORK.ID ? 1 : 0}
						  maxW="80px"
						  border="0px"
						  >
						  <Text>
						  {mintAmount}
						  </Text>
						  </Box>	
						</Square>
						<Spacer />
						<Square>			
						  <Button
							background="rgba(24, 23, 40, 0.8)"
							color="#fff"
							borderRadius="100%"
							width="50px"
							height="50px"
							fontSize={["1.25em", "1.5em", "1.75em", "2em"]}
							disabled={claimingNft || chainId != CONFIG.NETWORK.ID ? 1 : 0 }
							_hover = {{
								color : "#1e1d32"
							}}
							onClick={(e) => {
							  e.preventDefault();
							  incrementMintAmount();
							}}
						  >
							+
						  </Button>	
						</Square>
					  </HStack>
					  </>
					  ) : (
					  <></>
					  )}
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
							  background="linear-gradient(to right, #3dd0d8 0%, rgba(124, 105, 227, 0.64) 100%)"
							  color="white"
							  height="80px"
							  letterSpacing = "1px"
							  fontSize={["1em", "1.15em", "1.25em", "1.5em"]}
							  borderRadius="60px"
							  paddingLeft="40px"
							  paddingRight="40px"
							  transition= "background 0.3s"
								_hover={{
									background: '#3dd0d8',
								}}
								disabled={claimingNft || chainId != CONFIG.NETWORK.ID ? 1 : 0}
								onClick={(e) => {
								  e.preventDefault();
								  claimNFTs();
								}}
							  > 
							   {chainId == CONFIG.NETWORK.ID? (
								  <Box>
								  {claimingNft ?  <Text><Spinner size='md' /> CLAIMING </Text>:  <Text>CLAIM {mintAmount} NFT{ mintAmount > 1 ? "S" :"" }</Text>}
								  </Box>
								) : (
								  <Box>
								  {chainId ? "WRONG NETWORK" : "CONNECT TO CLAIM"}
								  </Box>
								)}
							  </Button>
						  </VStack>
						</Box>
					  </HStack>	
					  <HStack justifyContent="flex-start" alignItems="flex-start">
						  {chainId == CONFIG.NETWORK.ID ? <Text>{feedback}</Text> : <Text>{!chainId ? "You are not Connected." : `Please switch your Network to {CONFIG.NETWORK.NAME}.`}</Text>}
					   </HStack>	
				   </VStack>	
				   
				 )}
				 </>
				 )}
			 </VStack>
		 </Container>
      </Box>
	</ChakraProvider>
      <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
    </>
  );
}

export default App;