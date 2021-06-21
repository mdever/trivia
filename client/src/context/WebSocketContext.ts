import { createContext } from "react";

let ws: WebSocket | null = null;

export const WebSocketContext = createContext({ getWs: () => ws, setWs: (ws_: WebSocket) => ws = ws_});