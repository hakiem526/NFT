// log
import store from "../store";

const fetchDataRequest = () => {
    return {
        type: "CHECK_DATA_REQUEST",
    };
};

const fetchDataSuccess = (payload) => {
    return {
        type: "CHECK_DATA_SUCCESS",
        payload: payload,
    };
};

const fetchDataFailed = (payload) => {
    return {
        type: "CHECK_DATA_FAILED",
        payload: payload,
    };
};

export const fetchData = (account) => {
    return async (dispatch) => {
        let allOwnedCats;
        dispatch(fetchDataRequest());
        try {
            allOwnedCats = await store
                .getState()
                .blockchain.contract.methods.getAllCatsByOwner(account)
                .call();
        } catch (err) {
            console.log(err);
            dispatch(fetchDataFailed("Could not load data from contract."));
        }
        console.log(allOwnedCats);
        dispatch(fetchDataSuccess(allOwnedCats));
    };
};
