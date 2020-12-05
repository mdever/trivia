const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function roomCode() {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += alphabet[Math.floor(Math.random() * 26)];
    }
    return code;
    
}

module.exports = {
    roomCode
}