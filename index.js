const express = require('express');
const app = express()
const server = require('http').Server(app)
const io=require('socket.io')(server)
const findsomeone=require('./looksomeone.js')
app.use(express.static(__dirname + '/'));
app.get('/', (req, res) => {
  res.sendFile(__dirname+'/index.html')
})
app.get('/chat',(req,res) => {
  res.sendFile(__dirname+'/chat.html')
})


var men = []
var women=[]
const filtWait=(list)=>{
  var filted = [];
  for(i =0;i<list.length;i++){
		if(list[i]['chatstatus']=="wait")
		  filted.push(list[i]);
	}
  return filted;

}
const userGetin={
    "female":function(uinfo){
	women.push(uinfo);
        var someone=findsomeone.find(uinfo,filtWait(women),filtWait(men));
	return someone;
	},
    "male":function(uinfo){
	men.push(uinfo);
	var someone=findsomeone.find(uinfo,filtWait(men),filtWait(women));
	return someone;
	}
  };
const delUser=(socketid)=>{
    for(i =0;i<men.length;i++){
	        var menitem=men[i]
	        if(menitem==undefined)
		continue
                if(menitem.socketid==socketid)
                  men.splice(i,1)
        }

	for(j =0;j<women.length;j++){
		var womenitem=women[i]
		if(womenitem==undefined)
		continue
                if(womenitem.socketid==socketid)
			women.splice(j,1)
        }
}
const updateChatStatus={
    "female":function(user,status){
	var index=women.indexOf(user)
	user['chatstatus']=status
	women[index]=user

    },
    "male":function(user,status){
	var index=men.indexOf(user)
	user['chatstatus']=status
	men[index]=user

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
       "common":function(news,uinfo,someone){
	updateChatStatus[uinfo['gender']](uinfo,"chat")
	updateChatStatus[someone['gender']](someone,"chat")
        news.to(uinfo['socketid']).emit('yourmeethuman',someone);
	news.to(someone['socketid']).emit('yourmeethuman',uinfo);
       },
       "self":function(news,uinfo,someone){
       news.to(uinfo['socketid']).emit('lineinwithself','no female online');
       },
       "male":function(news,uinfo,someone){
	updateChatStatus[uinfo['gender']](uinfo,"chat")
	updateChatStatus[someone['gender']](someone,"chat")
        news.to(uinfo['socketid']).emit('lineinwithnofemale','no female online');
	news.to(uinfo['socketid']).emit('yourmeethuman',someone);
	news.to(someone['socketid']).emit('yourmeethuman',uinfo);
       },
       "female":function(news,uinfo,someone){
        updateChatStatus[uinfo['gender']](uinfo,"chat")
	updateChatStatus[someone['gender']](someone,"chat")
        news.to(uinfo['socketid']).emit('lineinwithnomale','no male online');
	news.to(uinfo['socketid']).emit('yourmeethuman',someone);
	news.to(someone['socketid']).emit('yourmeethuman',uinfo);
       }
}

/////////////////////////////////////////////////////////////////	
var news = io
  .of('/news')
  .on('connection', function (socket) {
    socket.on('getin',uinfo=>{
	console.log('news:(user get in:' + uinfo.name+' and gender is '+uinfo.gender+')')
	uinfo['socketid']=socket.id
	uinfo['chatstatus']="wait"
        var someone
        someone=userGetin[uinfo.gender](uinfo);
	meetTypenews[meetType(uinfo,someone)](news,uinfo,someone)

    })
    socket.on('push chat message',msg=>{
    console.log("receive (push message)->"+msg.to)
    if(msg.to){
      news.to(msg.to).emit('chat message',msg)
    }

    })
 
    socket.on('opponent gone away',(userself)=>{
    if(userself==undefined)
    return
      if(userself.gender=="female"){
	      for(var i=0;i<women.length;i++){
		      if(women[i]==undefined)
			   continue
		      if(women[i].name==userself.name&&women[i].socketid==socket.id)
			   women[i]['chatstatus']="wait"
	      }
      }else{
	      for(var j=0;j<men.length;j++){
                      if(men[j]==undefined)
                           continue
                      if(men[j].name==userself.name&&men[j].socketid==socket.id)
                           men[j]['chatstatus']="wait"
              }


      }
    

    })
    socket.on('disconnect', function () {
      news.emit('user disconnected',socket.id)
      delUser(socket.id)
      console.log('id:'+socket.id+',disconnected')
     })
    
  });


var pubchat=io
  .of('/pubchat')
  .on('connection',socket=>{
    socket.on('chat message',msg =>{
	    pubchat.emit('chat message',msg)
    })
}) 
server.listen(4000, () => {
  console.log('The server is running: http://localhost:4000')
})

