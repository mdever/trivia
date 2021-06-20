import { useEffect } from "react"

export default function OwnerRoom(props: { ws: WebSocket }) {
    const { ws } = props;

    useEffect(() => {
        console.log('Got the websocket: ');
        console.dir(ws);
    }, [ws])

    return (
        <div>
            <p>I'm the owner room</p>
        </div>
    )
}