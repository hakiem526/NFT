import React from "react";

function Quests(props) {

    useEffect(() => {
        var quests;
    }, []);

    if (props.blockchain.errorMsg !== "") {
        return (
            <div>
                {props.blockchain.errorMsg}
            </div>
        );
    } else if(props.blockchain.account == "" || props.blockchain.account == undefined) {
        return (
            <div>
                NOT CONNECTED
            </div>
        );
    } else if (props.data.allOwnedCats.length === 0 || props.data.allOwnedCats === undefined) {
        return (
            <div>
                BUY SOME CATS FIRST
            </div>
        );
    } else {
        return (
            <div>
                <li>------------------ QUESTS ------------------</li>
                <li>Total cats: {props.data.allOwnedCats.length}</li>
            </div>
        );
    }
}

export default Quests;