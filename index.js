const express = require('express');
const app = express()
const server = require('http').Server(app)
const io=require('socket.io')(server)
app.use(express.static(__dirname + '/'));
app.get('/', (req, res) => {
  res.sendFile(__dirname+'/index.html')
})
app.get('/chat',(req,res) => {
  res.sendFile(__dirname+'/chat.html')
})
const findsomeone=require('./looksomeone.js')


var men = []
var women=[]
const userGetin={
    "female":function(uinfo){
	women.push(uinfo);
        var someone=findsomeone.find(uinfo,women,men);
	return someone;
	},
    "male":function(uinfo){
	men.push(uinfo);
	var someone=findsomeone.find(uinfo,men,women)
	return someone;
	}
  };

const meetType=(uinfo,someone)=>{
	if(uinfo.gender!=someone.gender)
	return "common"
	if(uinfo.gender==someone.gender){
		if(uinfo==someone)
			return "self"
		else
			return uinfo.gender
	}

}	
const meetTypenews={
	"common":function(){
	},
	"self":function(news,uinfo){
        news.to(uinfo['socketid']).emit('lineinwithself','no female online');
	},
	"male":function(news,uinfo){
	 news.to(uinfo['socketid']).emit('lineinwithnofemale','no female online');
	},
	"female":function(news,uinfo){
	 news.to(uinfo['socketid']).emit('lineinwithnomale','no male online');
	}
}

/////////////////////////////////////////////////////////////////	
var news = io
  .of('/news')
  .on('connection', function (socket) {
    socket.on('getin',uinfo=>{
	console.log('news:user-get-in:' + uinfo.name+' and gender is '+uinfo.gender)
	uinfo['socketid']=socket.id
        var someone
        someone=userGetin[uinfo.gender](uinfo);
	meetTypenews[meetType(uinfo,someone)](news,uinfo)
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

