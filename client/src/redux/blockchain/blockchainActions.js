// constants
import Web3 from "web3";
import Grimalkin from "../../contracts/Grimalkin.json";

const connectRequest = () => {
    return {
        type: "CONNECTION_REQUEST",
    };
};

const connectSuccess = (payload) => {
    return {
        type: "CONNECTION_SUCCESS",
        payload: payload,
    };
};

const connectFailed = (payload) => {
    return {
        type: "CONNECTION_FAILED",
        payload: payload,
    };
};

const updateAccountRequest = (payload) => {
    return {
        type: "UPDATE_ACCOUNT",
        payload: payload,
    };
};

export const connect = () => {
    return async (dispatch) => {
        dispatch(connectRequest());
        if (window.ethereum) {
            let web3 = new Web3(window.ethereum);
            try {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts"
                });
                console.log('account: ' + accounts[0])
                const networkId = await window.ethereum.request({
                    method: "net_version"
                });

                /*********************************** UPDATE CONTRACT CONNECTION SCRIPT FOR DEPLOYMENT ***********************************/
                console.log('networkId: ' + networkId);
                const grimalkinNetworkData = await Grimalkin.networks[networkId];

                // Add listeners
                window.ethereum.on("accountsChanged", (accounts) => {
                    dispatch(updateAccount(accounts[0]));
                });
                window.ethereum.on("chainChanged", () => {
                    window.location.reload();
                    dispatch(updateAccount(accounts[0]));
                });

                if (networkId != 5777) {
                    dispatch(connectFailed("Change network to Ethereum."));
                } else if (!grimalkinNetworkData) {
                    dispatch(connectFailed("Could not connect to smart contract"));
                } else {
                    // localhost
                    console.log('connected to network: ' + networkId)
                    const grimalkin = new web3.eth.Contract(
                        Grimalkin.abi, grimalkinNetworkData.address
                    );
                    dispatch(
                        connectSuccess({
                            account: accounts[0],
                            contract: grimalkin,
                            web3: web3,
                        })
                    );
                }
            } catch (err) {
                dispatch(connectFailed("Something went wrong."));
            }
        } else {
            dispatch(connectFailed("Install Metamask."));
        }
    };
};

export const updateAccount = (account) => {
    return async (dispatch) => {
        dispatch(updateAccountRequest({ account: account }));
    };
};