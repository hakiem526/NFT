import React, { useState } from "react";
import { Button } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import { CircularProgress } from "@material-ui/core";
import { fetchData } from "../redux/data/dataActions";

function MintButton(props) {

    const [loading, setLoading] = useState(false);

    const mint = (account, numCats) => {
        setLoading(true);
        props.blockchain.contract.methods
            .mintGrimalkin(numCats)
            .send({
                from: account,
                value: 0.05 * Math.pow(10, 18),
            })
            .once("error", (err) => {
                setLoading(false);
                console.log(err);
            })
            .then((receipt) => {
                setLoading(false);
                console.log(receipt);
                props.dispatch(fetchData(props.blockchain.account));
            });
    }

    if (loading) {
        // case: transaction processing
        return (
            <Button
                variant="outlined"
                color="primary"
                style={{ cursor: 'not-allowed', pointerEvents: 'none' }}
            >
                <CircularProgress color="primary" />
            </Button>
        );
    } else if (props.blockchain.account !== null && props.blockchain.account !== undefined) {
        // case: account connected
        return (
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddBoxIcon />}
                onClick={(e) => {
                    e.preventDefault();
                    mint(props.blockchain.account, 1);
                }}
            >
                MINT
            </Button>
        );
    } else {
        // case: no wallet connected
        return (
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddBoxIcon />}
                disabled
            >
                MINT
            </Button>
        );
    }
}

export default MintButton;