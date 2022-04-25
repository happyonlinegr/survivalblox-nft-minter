import React, { useState, useEffect } from 'react';
import SelectWalletModal from "./Modal";
import { useWeb3React } from "@web3-react/core";
import { CheckCircleIcon, WarningIcon,AddIcon,MinusIcon,ArrowBackIcon,CopyIcon,CloseIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";
import { connectors } from "./connectors";
import { toHex, truncateAddress } from "./utils";
import Web3 from "web3";
import fonts from './fonts';

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

import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/roboto/900.css';


function App() {
  const [claimingNft, setClaimingNft] = useState(false);
  
  const [feedback, setFeedback] = useState("");
  
  const [mintAmount, setMintAmount] = useState(1);	
  const [smartContract, setSmartContract] = useState("");
  const [abi, setAbi] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [totalPriceFixed, setTotalPriceFixed] = useState("");

  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      RPC: "",
      BRIDGE: "",
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
    MARKETPLACE_LINK: ""
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

  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
  };

  const disconnect = () => {
    refreshState();
    deactivate();
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

  const initialize = async () => {

    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
	setAbi(abi);
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();	  
	
	SET_CONFIG(CONFIG);		
	
	const web3 = new Web3(CONFIG.NETWORK.RPC);	
	
    try {
	  const SmartContract = new web3.eth.Contract(
		abi,
		CONFIG.CONTRACT_ADDRESS
	  );
	  
	  SmartContract.methods
	    .calculatePrice()
	    .call()
	    .then((result) => {
		setTotalPrice(result);		
		setTotalPriceFixed(result > 0 ? (result / 10 ** 18).toFixed(2) : '0.00');	
	    });		  
	  
	  SmartContract.methods
	    .totalSupply()
	    .call()
	    .then((result) => {
		setTotalSupply(parseInt(result));	
	    });		
		
	  const interval = setInterval(() => {
		  SmartContract.methods
			.totalSupply()
			.call()
			.then((result) => {
			setTotalSupply(parseInt(result));	
			});	
		  SmartContract.methods
			.calculatePrice()
			.call()
			.then((result) => {
			setTotalPriceFixed(result > 0 ? (result / 10 ** 18).toFixed(2) : '0.00');	
			setTotalPrice(result);	
			});			
	  }, 5000);
	  
	  
		
	  } catch (err) {
		console.log(err);
      }
	 
  };    
  
  const claimNFTs = () => {
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = 0;
    let totalGasLimit = String(gasLimit * mintAmount);

	setClaimingNft(true);
	if (chainId == CONFIG.NETWORK.ID) {	  
		
		const web3 = new Web3(library.provider);
		const SmartContract = new web3.eth.Contract(
		abi,
		  CONFIG.CONTRACT_ADDRESS
		);
		SmartContract.setProvider(library.provider);		
	    try {
			SmartContract.methods
				.calculatePrice()
				.call()
				.then((result) => {
				setTotalPrice(result);
				
			});		  
			try {
				totalCostWei = String(totalPrice * mintAmount);
				if(totalCostWei) {
					SmartContract.methods
					  .mintQueenChiku(mintAmount)
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
					setFeedback(`Failed to calculate price. Try again later.`);
					setClaimingNft(false);
				}
			  } catch (err) {
				setFeedback(`Could not load data from Contract. Try again later.`);
			  } 
		} catch(err) {
			setFeedback(`Failed to calculate price. Try again later.`);
		}			
		
	} else {
		setClaimingNft(false);
		setFeedback(`Please switch your Network to ${CONFIG.NETWORK.NAME} `);
	};
  };  
  
  const getFeedback = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();	  
    if(chainId) {
	  if(chainId == CONFIG.NETWORK.ID) {
		setFeedback(`Click to claim your NFT.`);
	  } else {
		setFeedback(`Please switch your Network to ${CONFIG.NETWORK.NAME}.`);  
	  }
    } else {
	  setFeedback(`You are not Connected.`);
    }  
  };  

  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    if (provider) activate(connectors[provider]);
  }, []);
  useEffect(() => {
    getFeedback();
  }, [chainId]);

  useEffect(() => {
	initialize();
  }, []);    
  
  return (
    <>	
	<ChakraProvider theme={fonts}>
		<VStack minHeight="100vh" background="url(/bg.png) center center no-repeat #1e1d32" backgroundSize="cover">
		  <Container maxW="1000px" >
			<HStack justifyContent="space-between" height="80px">
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
					  background="linear-gradient(to right, tomato, purple 100%)"
					  color="white"
					  letterSpacing = "1px"
					  borderRadius="60px"
					  transition= "background 0.3s"
						_hover={{
							background: '#3dd0d8',
						}}
					 onClick={disconnect}><Text><CloseIcon fontSize="10px" /> DISCONNECT</Text></Button>
				  )}
				</Box>
			</HStack>
		  </Container>
		  <Container maxW="1000px" paddingTop={["50px","25px", "0"]}>
			<VStack background="#25243aa8" borderRadius="15px" padding={["0 30px 30px 30px", "0 60px 60px 60px", "0 90px 90px 90px"]} justifyContent="center" alignItems="center" marginBottom="2rem" color="white">
					<Image position="relative" marginTop="-50px" src='/logo.png' />
					<HStack marginBottom="10px">
					  <Text
						margin="0"
						lineHeight="1.15"
						fontSize={["2em", "2.5em", "3em"]}
						fontWeight="900"
					  >
						MINT
					  </Text>				  
					  <Text
						margin="0"
						lineHeight="1.15"
						fontSize={["2em", "2.5em", "3em"]}
						fontWeight="900"
						sx={{
						  background: "linear-gradient(90deg, #3dd0d8 0%, #7c69e3 70.35%)",
						  WebkitBackgroundClip: "text",
						  WebkitTextFillColor: "transparent"
						}}
					  >
						NFT's
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
						  You can still find {CONFIG.NFT_NAME} on <Link _hover={{color:"#fff"}} color="#3dcfd7" href={CONFIG.MARKETPLACE_LINK}>{CONFIG.MARKETPLACE}</Link>	
						</Text>
					 </VStack>
					 ) : (
					  <VStack>
						  <VStack marginBottom="2rem" marginTop="2rem">
							  <Text color="#c2d4f8" textShadow="0 2px 4.8px rgb(0 0 0 / 30%)" fontSize={["1.75em", "2em"]} fontWeight="600">
								{totalSupply ? totalSupply : <Spinner size='md' /> } of {CONFIG.MAX_SUPPLY}
							  </Text>
							  <Text>
							  Have been minted.
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
								fontSize={["1.5em", "1.75em", "2em"]}
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
								  height={["60px", "80px"]}
								  letterSpacing = "1px"
								  fontSize={["1.25em", "1.5em"]}
								  borderRadius="60px"
								  paddingLeft={["30px", "40px"]}
								  paddingRight={["30px", "40px"]}
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
									  {claimingNft ?  <Text><Spinner size='md' /> CLAIMING </Text>:  <Text>CLAIM {mintAmount} NFT{ mintAmount > 1 ? "'s" :"" }</Text>}
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
							  <Text>{feedback}</Text>
						   </HStack>	
					   </VStack>	
					   
					 )}
					 </>
					 )} 
			  </VStack>
		  </Container>
		</VStack>  
	</ChakraProvider>
    <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
    </>
  );
}

export default App;