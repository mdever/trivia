import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { currentUserSelector } from '../redux/selectors';


export default function Room(props) {

    let { code } = useParams();
    let currentUser = useSelector(currentUserSelector);
    let ws;

    useEffect(() => {
        ws = new WebSocket('ws://localhost:8080/' + code);
        ws.onopen = function () {
            console.log('Connected');
            ws.send('Client ' + currentUser.username + ' connected');
        }
        ws.onmessage = function (msg) {
            console.log('Received message: ' + msg.data);
        }
    }, [code]);

    return (
        <div>In room now</div>
    );
}