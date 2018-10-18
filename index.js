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

const showUserList=()=>{
      var menstr=""
      for(let menitem of men){
	     menstr=menstr+"("+menitem.name+","+menitem.chatstatus+") "
      }
      var womenstr=""
      for(let womenitem of women){
	     womenstr=womenstr+"("+womenitem.name+","+womenitem.chatstatus+") "
      }
      return {"menlist":menstr,"womenlist":womenstr} 

}

const findItemByMayOutdated=(user)=>{
      var gender=user.gender
      var useritem;
      if(gender=="female"){
	 for(let itemfemale of women){
		if(itemfemale.name==user.name&&itemfemale.socketid==user.socketid)
		useritem=itemfemale
         }
      }else{
	  for(let itemmale of men){
		if(itemmale.name==user.name&&itemmale.socketid==user.socketid)
		useritem=itemmale
         }
      }
      return useritem;
}

const filtWait=(list)=>{
  var filted = [];
  for(let listitem of list){
		if(listitem['chatstatus']=="wait")
		  filted.push(listitem);
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

const findSomeoneForMatchAgain={
    "female":function(uinfo){
        var someone=findsomeone.find(uinfo,filtWait(women),filtWait(men));
        return someone;
        },
    "male":function(uinfo){
        var someone=findsomeone.find(uinfo,filtWait(men),filtWait(women));
        return someone;
        }
}

const matchAgain=(usermayoutdated)=>{
	var user=findItemByMayOutdated(usermayoutdated)
	if(user==undefined)
		return
        var someone=findSomeoneForMatchAgain[user.gender](user);
        meetTypenews[meetType(user,someone)](news,user,someone)
	
    }
const delUser=(socketid)=>{
    for(let menitem of men){
	        if(menitem==undefined)
		continue
                if(menitem.socketid==socketid){
		  var i=men.indexOf(menitem)
                  men.splice(i,1)
		}
        }

    for(let womenitem of women){
		if(womenitem==undefined)
		continue
                if(womenitem.socketid==socketid){
			var j=women.indexOf(womenitem)
			women.splice(j,1)
		}
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

const updateChatStatusBySocketid={
    "female":function(name,socketid,status){
	 for(let womenitem of women){
		      if(womenitem.name==name&&womenitem.socketid==socketid)
			   womenitem['chatstatus']=status
	    }

    },
    "male":function(name,socketid,status){
	for(let menitem of men){
                      if(menitem.name==name&&menitem.socketid==socketid)
                           menitem['chatstatus']=status
              }

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
	news.to(uinfo['socketid']).emit('update userself',uinfo)
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
	      for(let womenitem of women){
		      if(womenitem.name==userself.name&&womenitem.socketid==socket.id)
			   womenitem['chatstatus']="wait"
	      }
      }else{
	      for(let menitem of men){
                      if(menitem.name==userself.name&&menitem.socketid==socket.id)
                           menitem['chatstatus']="wait"
              }


      }
      matchAgain(userself)
    

    })
    
    socket.on('disconnect', function () {
      news.emit('user disconnected',socket.id)
      delUser(socket.id)
      news.emit('show user list',showUserList())
      console.log('id:'+socket.id+',disconnected')
     })
    socket.on('change human',(resuser)=>{
      news.emit('user disconnected',socket.id)
      updateChatStatusBySocketid[resuser.gender](resuser.name,socket.id,"wait")
      matchAgain(resuser)
      news.emit('show user list',showUserList())
      console.log('id:'+socket.id+',change human')
     })
    socket.on('switch pub',(userself)=>{
	    updateChatStatusBySocketid[userself.gender](userself.name,socket.id,"pub")
	    news.emit('user disconnected',socket.id)
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

