const express = require('express');
const app = express()
const server = require('http').Server(app)
const io=require('socket.io')(server)
app.use(express.static(__dirname + '/'));
app.get('/', (req, res) => {
  res.sendFile(__dirname+'/index.html')
})
const findsomeone=require('./looksomeone.js')


var men = []
var women=[]
var news = io
  .of('/news')
  .on('connection', function (socket) {
    socket.on('getin',uinfo=>{
	console.log('news-getin: ' + uinfo.name)
        console.log('user gender is : ' + uinfo.gender)
	uinfo['socketid']=socket.id
        var someone
        if(uinfo.gender=="female"){
	women.push(uinfo);
        someone=findsomeone.find(uinfo,women,men)
	if (!men.length){
        news.to(socket.id).emit('lineinwithnomale','no male online')	
        }
        }
	else{
	men.push(uinfo);
	someone=findsomeone.find(uinfo,men,women)
        }
        news.to(socket.id).emit('yourmeethuman',someone);

    })
  });

var chat=io
  .of('/chat')
  .on('connection',socket=>{
  socket.on('chat message', msg => {
    chat.emit('chat message',msg)
    console.log('message: to' + msg.to+','+msg.content)
  })
})
server.listen(4000, () => {
  console.log('The server is running: http://localhost:4000')
})

