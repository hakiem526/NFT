import React, { useEffect } from "react";
import { fetchData } from "../redux/data/dataActions";


function OwnedCats(props) {

    useEffect(() => {
        if (props.blockchain.account !== "" && props.blockchain.account !== null) {
            console.log('Fetching data for account ' + props.blockchain.account);
            props.dispatch(fetchData(props.blockchain.account));
        }

    }, [props.blockchain.account]);

    if (props.blockchain.account == "" || props.blockchain.account == undefined) {
        return (
            <div>
                NOT CONNECTED
            </div>
        );
    } else if (props.data.allOwnedCats.length === 0 || props.data.allOwnedCats === undefined) {
        return (
            <div>
                NO CATS
            </div>
        );
    } else {
        return (
            <div>
                <li>Total cats: {props.data.allOwnedCats.length}</li>
                {props.data.allOwnedCats.map((item, index) => {
                    return (
                        <div key={index}>
                            <li>ID: {item.id}</li>
                            <li>dna: {item.dna}</li>
                            <li>ki: {item.ki}</li>
                            <div>------------------</div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default OwnedCats;