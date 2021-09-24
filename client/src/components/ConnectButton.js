import React from "react";
import { Button } from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import { CircularProgress } from "@material-ui/core";
import { connect } from "../redux/blockchain/blockchainActions"

function ConnectButton(props) {

    const connectWallet = () => {
        props.dispatch(connect());
    };

    if (props.blockchain.errorMsg !== "") {
        // case: connect failed
        return (
            <Button
                variant="outlined"
                color="secondary"
                style={{ cursor: 'not-allowed', pointerEvents: 'none' }}
            >
                <span>{props.blockchain.errorMsg}</span>
            </Button>
        );
    } else if (props.blockchain.account !== null && props.blockchain.account !== undefined && props.blockchain.account !== "") {
        // case: account connected
        return (
            <Button
                variant="outlined"
                color="secondary"
                style={{ cursor: 'not-allowed', pointerEvents: 'none' }}
            >
                <span>{props.blockchain.account}</span>
            </Button>
        );
    } else if (props.blockchain.loading) {
        // case: transaction processing
        return (
            <Button
                variant="outlined"
                color="secondary"
                style={{ cursor: 'not-allowed', pointerEvents: 'none' }}
            >
                <CircularProgress color="secondary" />
            </Button>
        );
    } else {
        // case: no wallet connected
        return (
            <Button
                onClick={(e) => {
                    e.preventDefault();
                    connectWallet();
                }}
                variant="contained"
                color="secondary"
                startIcon={<AccountBalanceWalletIcon />}
            >
                Connect
            </Button>
        );
    }
}

export default ConnectButton;