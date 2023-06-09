require('dotenv').config();
const express = require("express")
const app = express()
const cors = require("cors")
const http = require('http').Server(app);
const PORT = process.env.PORT;
const path = require('path');   
const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:6542"
    }
});

app.use(cors())
let users = []

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`)  
    socket.on("message", data => {
      socketIO.emit("messageResponse", data)
    })

    socket.on("typing", data => (
      socket.broadcast.emit("typingResponse", data)
    ))

    socket.on("newUser", data => {
      users.push(data)
      socketIO.emit("newUserResponse", users)
    })
 
    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
      users = users.filter(user => user.socketID !== socket.id)
      socketIO.emit("newUserResponse", users)
      socket.disconnect()
    });
});

app.use(express.static(path.join(__dirname, '../client/build')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});