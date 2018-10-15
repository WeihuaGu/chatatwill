$(() => {
    var $window=$(window); 
    var $chatPage = $('.chat.page'); // The chatroom page
    var $inputMessage = $('#m');
    var $currentInput = $inputMessage.focus();
    var $chatArea = $('#messages');
    var $waitanim = $('#waitanimation');
    var userself;
    var someonechatwith;
    var pubchat = io.connect('/pubchat');
    var news= io.connect('/news');
    var pubflag=false;

    ///////////////////////////////////////////////////////    
    const getcookie= (objname)=>{//获取指定名称的cookie的值
	var arrstr = document.cookie.split("; ");
	for(var i = 0;i < arrstr.length;i ++){
	    var temp = arrstr[i].split("=");
	    if(temp[0] == objname) 
		return unescape(temp[1]);
	}
    }
    const eventListening = ()=>{
    pubchat.on('chat message', msg => {
        if(pubflag)
        $('#messages').append($('<li>').text(msg.content))
    })
    news.on('chat message',msg=>{
	console.log("收到来自特定用户的消息:"+msg.content)
	if(!pubflag){
	$chatArea.append($('<li>').text(msg.content))
	}

    })
    news.on('lineinwithnomale',tip=>{
      console.log("这会儿没有男人")
      M.toast({html: '这会儿没有男人!'})
      
    })  
    news.on('lineinwithnofemale',tip=>{
      console.log("这会儿没有女人")
      M.toast({html: '这会儿没有女人'})
      
    })  
    news.on('lineinwithself',tip=>{
      console.log("除了你没有别人了")
      M.toast({html: '这会儿找不下空闲的,和自己聊聊吧...'})
      
    })         
    news.on('yourmeethuman',someone=>{
	//alert(someone.gender+":"+someone.name)
	console.log("遇到了"+someone.name+"他的性别是"+someone.gender+",socketid:"+someone.socketid)
	M.toast({html:"你遇到了"+someone.name+"性别是"+someone.gender})
	$waitanim.fadeOut()
        someonechatwith=someone
	cleanChatArea();
    })
    news.on('update userself',updateduserself=>{
	    userself=updateduserself
    })
    news.on('user disconnected',socketid=>{
	    if(someonechatwith.socketid=socketid){
		console.log("对面下线,请等待新用户匹配")
		M.toast({html: "对面下线,请等待新用户匹配"})
		news.emit('opponent gone away',userself)
		$waitanim.fadeIn()
	    }
    })

    news.on('show user list',userlist=>{
	    console.log("男的列表//////////////")
	    console.log(userlist['menlist'])
	    console.log("女的列表/////////////")
	    console.log(userlist['womenlist'])
	    console.log("--------------------")
    })

    }

    const sendChatMessage=(message)=>{
      
      if(pubflag==true){
      msg={"content":message}
      pubchat.emit('chat message',msg)
      }
      else{
      if(someonechatwith['socketid']){ 
      msg={"to":someonechatwith['socketid'],
           "content":message
          }
      news.emit('push chat message',msg)
      $chatArea.append($('<li>').text(msg.content))
      console.log("push chat message to:"+msg.to)
      }
      }
    }

    const cleanChatArea=()=>{
      $chatArea.find('li').remove();
    }
    ///////////////////////////////////////////////////////////////
    eventListening();
    userself = {gender:getcookie("pre_gender"),name:getcookie("pre_name")}    
    news.emit('getin', userself);
    $('form').submit(() => {
      sendChatMessage($('#m').val())
      $('#m').val('')
      return false
    })

   
   $window.keydown(event => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
   });    
    
   $("#pubchange").change(function() { 
	  if($("input#pubchange").prop("checked") == true){ 
			  // do somethig
		  //
		  pubflag=true;
		  $waitanim.fadeOut();
          }else{
   		  pubflag=false;


          }
	  console.log("pubflag change"+pubflag); 
	  cleanChatArea();
   }); 
 })
