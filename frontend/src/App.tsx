import React, { useEffect, useContext, useCallback, useState } from "react";
import circuit from './noirjs_demo.json';
import { BarretenbergBackend } from '@noir-lang/backend_barretenberg';
import { Noir } from '@noir-lang/noir_js';

import Header from "./Components/Headers";
import Products from "./Components/ProductTypes/Products";
import Context from "./Context";
import { Contract, loadContractArtifact, createPXEClient } from '@aztec/aztec.js';
import { getInitialTestAccountsWallets } from '@aztec/accounts/testing';

import styles from "./App.module.scss";

import Button from "plaid-threads/Button";

const App = () => {
  const { linkSuccess, isItemAccess, isPaymentInitiation, dispatch } = useContext(Context);

  const [logs, setLogs] = useState(['']);
  const [results, setResults] = useState('');
  const [inputValue, setInputValue] = useState('');


  const getInfo = useCallback(async () => {
    const response = await fetch("/api/info", { method: "POST" });
    if (!response.ok) {
      dispatch({ type: "SET_STATE", state: { backend: false } });
      return { paymentInitiation: false };
    }
    const data = await response.json();
    const paymentInitiation: boolean = data.products.includes(
      "payment_initiation"
    );
    dispatch({
      type: "SET_STATE",
      state: {
        products: data.products,
        isPaymentInitiation: paymentInitiation,
      },
    });
    return { paymentInitiation };
  }, [dispatch]);

  const generateToken = useCallback(
    async (isPaymentInitiation) => {
      // Link tokens for 'payment_initiation' use a different creation flow in your backend.
      const path = isPaymentInitiation
        ? "/api/create_link_token_for_payment"
        : "/api/create_link_token";
      const response = await fetch(path, {
        method: "POST",
      });
      if (!response.ok) {
        dispatch({ type: "SET_STATE", state: { linkToken: null } });
        return;
      }
      const data = await response.json();
      if (data) {
        if (data.error != null) {
          dispatch({
            type: "SET_STATE",
            state: {
              linkToken: null,
              linkTokenError: data.error,
            },
          });
          return;
        }
        dispatch({ type: "SET_STATE", state: { linkToken: data.link_token } });
      }
      // Save the link_token to be used later in the Oauth flow.
      localStorage.setItem("link_token", data.link_token);
    },
    [dispatch]
  );

  async function getAddress() {
    const { PXE_URL = 'http://localhost:8080' } = process.env;
    const pxe = createPXEClient(PXE_URL);
    const [ownerWallet] = await getInitialTestAccountsWallets(pxe);
    const ownerAddress = ownerWallet.getCompleteAddress();
    return ownerAddress;
  }

  const setup = async () => {
    await Promise.all([
      import("@noir-lang/noirc_abi").then(module =>
          module.default(new URL("@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm", import.meta.url).toString())
      ),
      import("@noir-lang/acvm_js").then(module =>
          module.default(new URL("@noir-lang/acvm_js/web/acvm_js_bg.wasm", import.meta.url).toString())
      )
    ]);
  }

  const appendLog = (message: string) => {
    setLogs(oldLogs => [...oldLogs, message]);
  }

  const sleep = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const generateProof = async () => {
    try {
      // @ts-ignore
      const backend = new BarretenbergBackend(circuit);
      // @ts-ignore
      const noir = new Noir(circuit, backend);
      const response = await fetch('/api/balance');
      const data = await response.json();
      const x = data[0].balances.available;

      const input = { x: x, y: 1};

      appendLog('Generating proof... ⌛');
      const proof = await noir.generateFinalProof(input);
      appendLog('Generating proof... ✅');
      appendLog(`${proof}`);
      appendLog('Verifying proof... ⌛');
      const verification = await noir.verifyFinalProof(proof);
      //console.log("verified")
      //console.log(verification)
      if (verification) appendLog('Verifying proof... ✅');

    } catch(err) {
      console.log(err)
      appendLog("Oh 💔 Wrong balance")
    }
  }

  useEffect(() => {
    const init = async () => {
      const { paymentInitiation } = await getInfo(); // used to determine which path to take when generating token
      // do not generate a new token for OAuth redirect; instead
      // setLinkToken from localStorage
      if (window.location.href.includes("?oauth_state_id=")) {
        dispatch({
          type: "SET_STATE",
          state: {
            linkToken: localStorage.getItem("link_token"),
          },
        });
        return;
      }
      generateToken(paymentInitiation);
      setup()
      getAddress()
    };
    init();
  }, [dispatch, generateToken, getInfo]);

  return (
    <div className={styles.App}>
      <div className={styles.container}>
        <Header />
        {linkSuccess && (
            <>
              {isItemAccess && (
                  <>
                    <Products/>
                    <div>
                      <div>
                        <Button
                            small
                            centered
                            wide
                            secondary id="submitGuess" onClick={generateProof}>Generate proof</Button>
                      </div>
                      <div id="logs">
                        <table>
                          <tbody>
                          {logs.map((log, index) => (
                              <tr key={index}>
                                <td>{log.length > 20 ? `${log.substring(0, 50)}...` : log}</td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>

                      <div id="results"></div>
                    </div>
                  </>
              )}
            </>
        )}
      </div>
    </div>
  );
};

export default App;


