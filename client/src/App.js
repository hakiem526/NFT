import React from "react";
import ConnectButton from './components/ConnectButton';
import MintButton from "./components/MintButton";
import { useDispatch, useSelector } from "react-redux";
import OwnedCats from "./components/OwnedCats";
import Quests from "./components/Quests";

function App() {

    const dispatch = useDispatch();
    const blockchain = useSelector((state) => state.blockchain);
    const data = useSelector((state) => state.data);

    return (
        <div>
            <ConnectButton dispatch={dispatch} blockchain={blockchain} />
            <MintButton dispatch={dispatch} blockchain={blockchain} data={data} />
            <OwnedCats dispatch={dispatch} blockchain={blockchain} data={data} />
            <Quests dispatch={dispatch} blockchain={blockchain} data={data} />
        </div>
    );
}

export default App;