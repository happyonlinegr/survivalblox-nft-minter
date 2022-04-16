import React, { StrictMode } from 'react';
import ReactDOM from "react-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { Web3ReactProvider } from "@web3-react/core";
import { ethers } from "ethers";
import store from "./redux/store";
import { Provider } from "react-redux";
import "./styles/reset.css";

import App from "./App";

const getLibrary = (provider) => {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 8000; // frequency provider is polling
  return library;
};

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <ChakraProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
		<Provider store={store}>
          <App />
		</Provider>
      </Web3ReactProvider>
    </ChakraProvider>
  </StrictMode>,
  rootElement
);