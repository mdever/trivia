import { useState } from "react";

export default function PlayerAvatar(props: {username: string}) {
    const [useDefaultAvatar, setUseDefaultAvatar] = useState(true);

    return (
        <img alt="User Avatar" onError={() => setUseDefaultAvatar(true)} src={useDefaultAvatar ? '/user.png' : `/api/users/${props.username}/avatar`} style={{height: '80px'}}></img>
    )
}