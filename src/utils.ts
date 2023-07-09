// let playerKey = request.headers['sec-websocket-key'];
// console.log(new Date() + ' | A new client is connected.');
// // Assign player Id to connected client.
// var uuidPlayer = id + 1;
// // Registering player with the session.
// let sessionMsg = {
//   type: '',
//   method: '',
//   sessionId: 0,
//   uuidPlayer: 0,
// }
// sessionMsg.type = "register";
// sessionMsg.method = "register";
// // Gathering player connection key.
// // let playerKey = request.headers['sec-websocket-key'];
// sessionMsg.sessionId = playerKey;
// sessionMsg.uuidPlayer = uuidPlayer;
// // Sending confirm message to the connected client.
// ws.send(JSON.stringify(sessionMsg));

export const messageParser = (message: string) => {
    const {type, data } = JSON.parse(message);
    const m = data ?? JSON.parse(data);
    return {
        type,
        m,
    }
}