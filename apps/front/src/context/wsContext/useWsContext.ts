import { useContext } from 'react';
import { WsContext } from '.';

export const useWsContext = () => {
    const ctx = useContext(WsContext);
    if (!ctx) throw new Error('Missing Context');
    return ctx;
};