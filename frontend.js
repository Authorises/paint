var socket = io();

var ccolor = 0

var colors = ["#000000", "#0000AA", "#00AA00", "#00AAAA","#AA0000","#AA00AA","#FFAA00","#AAAAAA","#555555","#5555FF","#55FF55","#55FFFF","#FF5555","#FF55FF","#FFFF55","#FFFFFF"]

var identity

const container = document.getElementById("container");

const colorsd = document.getElementById("colors")
const specialcolorsd = document.getElementById("colorsspecial")

var map

function updateLeaderboard(){
  colorCounts = []
  for (var i = 0; i < colors.length; i++) {
    colorCounts[i]= 0
  }
  map.forEach((value, key) => {
    //console.log(colorCounts.get(value))
    colorCounts[value]= colorCounts[value]+1
  })
  colorsd.innerHTML=''
  specialcolorsd.innerHTML=''
  for (var i = 0; i < colors.length; i++) {
    var d = colors[i]
    colorsd.innerHTML+=`<div style="background-color: ${d};height:30px;width:30px;display:inline-block;"></div>${Math.round((colorCounts[i]/400)*100)}%<p>`
  }
}

/**
function addcolors(selectedcolor){
    colorsd.innerHTML=''
    specialcolorsd.innerHTML=''
    for (var i = 0; i < colors.length; i++) {
      var d = colors[i]
      if(d.startsWith('special:')){
        d=d.replace(/special:/g, '')
        if(d.startsWith('#')){
          specialcolorsd.style.setProperty('--grid-rows', 20);
          specialcolorsd.style.setProperty('--grid-cols', 10);
          if(selectedcolor==i){
              specialcolorsd.innerHTML+=`<div class="grid-item" onclick="setColor(${i})" style="background-color: ${colors[i]};"></div>`
          }else{
              specialcolorsd.innerHTML+=`<div class="grid-item" onclick="setColor('${i}')" style="background-color: ${colors[i]}"></div>`
          }
        }else if(d.startsWith('char:')){
          specialcolorsd.style.setProperty('--grid-rows', 20);
          specialcolorsd.style.setProperty('--grid-cols', 10);
          var t = d
          t=t.replace(/char:/g,'')
          if(selectedcolor==i){
              specialcolorsd.innerHTML+=`<div class="grid-item" onclick="setColor(${i})" style="white-space: nowrap;">${t}</div>`
          }else{
              specialcolorsd.innerHTML+=`<div class="grid-item" onclick="setColor('${i}')" style="white-space: nowrap;">${t}</div>`
          }
        }else{
          specialcolorsd.style.setProperty('--grid-rows', 20);
          specialcolorsd.style.setProperty('--grid-cols', 10);
          if(selectedcolor==i){
            specialcolorsd.innerHTML+=`<div class="grid-item" onclick="setColor(${i})" style="background-image: url(${d});background-size:100%"></div>`
          }else{
            specialcolorsd.innerHTML+=`<div class="grid-item" onclick="setColor('${i}')" style="background-image: url(${d});background-size:100%;"></div>`
          }
        }
      }else{
               if(d.startsWith('#')){
          colorsd.style.setProperty('--grid-rows', 20);
          colorsd.style.setProperty('--grid-cols', 10);
          if(selectedcolor==i){
              colorsd.innerHTML+=`<div class="grid-item" onclick="setColor(${i})" style="background-color: ${colors[i]};"></div>`
          }else{
              colorsd.innerHTML+=`<div class="grid-item" onclick="setColor('${i}')" style="background-color: ${colors[i]}"></div>`
          }
        }else if(d.startsWith('char:')){
          colorsd.style.setProperty('--grid-rows', 20);
          colorsd.style.setProperty('--grid-cols', 10);
          var t = colors[i]
          t=t.replace(/char:/g,'')
          if(selectedcolor==i){
              colorsd.innerHTML+=`<div class="grid-item" onclick="setColor(${i})" style="white-space: nowrap;">${t}</div>`
          }else{
              colorsd.innerHTML+=`<div class="grid-item" onclick="setColor('${i}')" style="white-space: nowrap;">${t}</div>`
          }
        }else{
          colorsd.style.setProperty('--grid-rows', 20);
          colorsd.style.setProperty('--grid-cols', 10);
          if(selectedcolor==i){
            colorsd.innerHTML+=`<div class="grid-item" onclick="setColor(${i})" style="background-image: url(${colors[i]});background-size:100%"></div>`
          }else{
            colorsd.innerHTML+=`<div class="grid-item" onclick="setColor('${i}')" style="background-image: url(${colors[i]});background-size:100%;"></div>`
          }
        } 
      }
     }
}

*/


function addcolors(selectedcolor){
  colorsd.innerHTML=''
  specialcolorsd.innerHTML=''
  for (var i = 0; i < colors.length; i++) {
    var d = colors[i]
    colorsd.innerHTML+=`<div style="background-color: ${d};height:30px;width:30px;margin:2px"></div>`
  }
}


fetch('/colors').then(function (response) {
	// The API call was successful!
	return response.json();
}).then(function (data) {
	// This is the JSON from our response
  colors = data.colors
  addcolors(ccolor)
}).catch(function (err) {
	// There was an error
	console.warn('Something went wrong.', err);
});


function makeRows(rows, cols, map) {
  container.innerHTML=''
  container.style.setProperty('--grid-rows', rows);
  container.style.setProperty('--grid-cols', cols);
  for (c = 0; c < (rows * cols); c++) {
    var d = colors[map[c]]
    container.innerHTML+=`<div id="${c}" class="grid-item" onclick="paint(${c})" style="background-color: ${colors[map[c]]}"></div>`

  };
};

function paint(coord){
  document.getElementById('click').innerHTML=""
  socket.emit('paint', coord, ccolor)
  rpaint(coord, ccolor)
}

function rpaint(coords,color){
  
  map[coords]=color
  updateLeaderboard()
  var c = colors[color]
    var d = document.getElementById(`${coords}`)
    d.removeAttribute('style')
    d.style.setProperty('--grid-rows', 20);
    d.style.setProperty('--grid-cols', 20);
    d.style.setProperty('background-color', c);
}

socket.on('paint', (coords, color) => {
  console.log(`received paint: ${coords} ${color}`)
  rpaint(coords, color)
})

socket.on('close', () => {
  window.close()
})

socket.on('online', (online) =>{
  document.getElementById('online').innerHTML=`${online.count}`

  newVal = ``
  online.players.forEach((x) => {
    if(x.username!=identity.username){
      newVal+=`
      <span style="border: 2px solid ${x.team}; padding:4px; color:${x.team}">${x.username}</span><p>
    `
    }else{
      newVal+=`
        <span style="color:white; font-size:20px;">\> </span><span style="border: 2px solid ${x.team}; padding:4px; color:${x.team}">${x.username}</span><p>
      `
    }

  })
  document.getElementById('online-list').innerHTML=newVal
  
})

socket.on('new-identity', (id) => {
  identity = id
  ccolor=colors.indexOf(id.team)
})

socket.on('connect', () => {
  console.log('connected!')
})

socket.on('map', (m) => {
  console.log('got map')
  makeRows(20, 20, m);
  map=m
  updateLeaderboard()
})
grecaptcha.enterprise.ready(function() {
    grecaptcha.enterprise.execute('6LddcH0iAAAAAL0VZq3yeOm2Bvo9vGOioMX5qRGh', {action: 'login'}).then(function(token) {
       socket.emit("auth", token)
    });
});
