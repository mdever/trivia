import { createContext } from "react";

let ws: WebSocket | null = null;

export const WebSocketContext = createContext({ getWs: () => ws, setWs: (ws_: WebSocket | null) => ws = ws_});