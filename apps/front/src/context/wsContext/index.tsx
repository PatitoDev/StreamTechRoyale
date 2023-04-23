import { EventBase, EventType } from "@streamtechroyale/models";
import { createContext, useCallback, useEffect, useState } from "react";

type SubscribeToEventCallback = (event: EventBase) => void;

interface WsContextData {
    sendMessage: (msg: string) => void,
    subscribeToEvent: (event: EventType, callback:SubscribeToEventCallback) => void,
}

export const WsContext = createContext<WsContextData | null>(null);

export interface WsContextProviderProps {
    children: React.ReactNode,
}

//const WS_URL = 'ws://localhost:8090';
const WS_URL = 'wss://api.streamtechroyale.com';


const parseWebsocketMessage = (message: unknown) => {
    if (typeof message === 'string') return message;
    if (typeof message === 'object') {
        return new TextDecoder().decode(message as ArrayBuffer);
    }
}

export const WsContextProvider = ({ children }: WsContextProviderProps) => {
    const [ws, setWs] = useState(new WebSocket(WS_URL));
    const [subscriptions, setSubscriptions] = useState<Record<EventType, Array<SubscribeToEventCallback>>>({
        "channels-live": [],
    });

    useEffect(() => {
        ws.onmessage = (e) => {
            const msg = parseWebsocketMessage(e.data);
            if (!msg) return;
            const msgData = (JSON.parse(msg) as EventBase);
            console.log(msgData.type, msgData.content);
            for (const sub of subscriptions[msgData.type]) {
                sub(msgData);
            }
        }
    }, [ws]);

    const sendMessage = useCallback((msg: string) => { ws.send(JSON.stringify(msg)) }, [ws]);

    const subscribeToEvent:WsContextData['subscribeToEvent'] = (type: EventType, callback: SubscribeToEventCallback) => {
        setSubscriptions((prev) => {
            const newData = { ...prev };
            newData[type].push(callback);
            return newData;
        })
    }

    return (
        <WsContext.Provider
            value={{
                sendMessage,
                subscribeToEvent,
            }}
        >
            {children}
        </WsContext.Provider>
    );
} 