const express = require('express');
const fetch = require("node-fetch");
const { generateUsername } = require("unique-username-generator");
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const d = []

var usernames = new Map();
var teams = new Map()
var ratelimit = new Map()

var authenticated = []

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

// make random easier
Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
}

const colors = ["#FFAA00","#55FF55","#55FFFF","#FF5555","#FF55FF","#FFFF55","#FFFFFF"]

function getOnline(){
  var x = {
    "count":teams.size,
    "players":[]
  }

  usernames.forEach((username, socket) => {
    x.players.push(
      {
        "username":username,
        "team":teams.get(socket)
      }
    )
  })
  return x
}

x = 0
while(x<=400){
  d[x]=getRandomInt(0,7)
  x+=1
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/frontend.js', (req, res) => {
  res.sendFile(__dirname + '/frontend.js');
});

app.get('/socket.io.js', (req, res) => {
  res.sendFile(__dirname + '/socket.io.js');
});

app.get('/colors', (req, res) => {
  res.send({"colors":colors})
})


io.on('connection', (socket) => {
  setTimeout(function() {
    if(!(authenticated.includes(socket))){
      socket.disconnect()
    }
  }, 2000);
  socket.on("auth", (token) => {
    (async () => {
    let response = await fetch("https://www.google.com/recaptcha/api/siteverify?secret="+process.env['CAPTCHA']+"&response="+token);
    if(response.ok){
      let json = await response.json();
      if(json.success){
        authenticated.push(socket)
        // randomly generate a username for the player
        usernames.set(socket, generateUsername())
        // randomly select a team for the player
        teams.set(socket, colors.sample())
        // send generated team and username back to the player
        socket.emit("new-identity", {
          "team":teams.get(socket),
          "username":usernames.get(socket)
        })
        // update online count for everyone
        io.emit('online', getOnline())
        // send the map
        socket.emit('map', d)
        // when the socket disconnects
        console.log('a user connected, id: '+socket.id);
      }else{
        socket.emit("disconnect")
        socket.disconnect()
      }
    } else {
      alert("HTTP-Error: " + response.status);
      socket.emit("disconnect")
      socket.disconnect()
    }
    })()
  })

  socket.on('disconnect', () =>{
    if(authenticated.includes(socket)){
      // update online count for everyone
      usernames.delete(socket)
      teams.delete(socket)
      io.emit('online', getOnline())
      console.log('a user disconnected, id: '+socket.id);
    }
  })
  
  // user clicked a block
  socket.on('paint', (a,b) => {
    if(authenticated.includes(socket)){
      if(ratelimit.has(socket)){
        if(ratelimit.get(socket)+250>new Date().getTime()){
          socket.emit('paint', a, d[a])
          return;
        }
      } 
      ratelimit.set(socket, new Date().getTime())
      console.log(a+":"+b)
      // validation
      if(a>=0 && a<626){
        // update board for everyone
        d[a]=b
        io.emit('paint', a, b)
      }else{
        socket.emit('close')
      } 
    }
  })
});

server.listen(80, () => {
  console.log('listening on *:80');
});
