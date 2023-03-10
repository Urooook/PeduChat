import {useCallback, useEffect, useRef, useState} from "react";

export const useStateWithCallback = initialState => {
    const [state, setState] = useState(initialState);
    const cbRef = useRef(null);

    const updateCallback = useCallback((newState, cb) => {
        cbRef.current = cb;

        setState(prev => typeof newState === 'function' ? newState(prev) : newState);
    }, []);

    useEffect(() => {
        if(cbRef.current != null) {
            cbRef.current(state);
            cbRef.current = null;
        }
    }, [state]);

    return [state, updateCallback];
}