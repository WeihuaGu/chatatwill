/**
 *
 * socketio client main js
 */

$(() => {
    var $window=$(window); 
    var $chatPage = $('.chat.page'); // The chatroom page
    var $inputMessage = $('#m');
    var $currentInput = $inputMessage.focus();
    var $chatArea = $('#messages');
    var $waitanim = $('#waitanimation');
    var $changehumanbutton=$('#changehuman')
    var $quitrefresh=$('#quitrefresh')
    var userself;
    var someonechatwith;
    var pubchat = io.connect('/pubchat');
    var news= io.connect('/news');
    var pubflag=false;
    var onlyslefflag=true;

    ///////////////////////////////////////////////////////    
    const getcookie= (objname)=>{//获取指定名称的cookie的值
	var arrstr = document.cookie.split("; ");
	for(var i = 0;i < arrstr.length;i ++){
	    var temp = arrstr[i].split("=");
	    if(temp[0] == objname) 
		return unescape(temp[1]);
	}
    }
    const changeHuman=()=>{
	
	onlyslefflag=true
	someonechatwith=undefined
	news.emit('change human',userself)
	$waitanim.fadeIn()
	M.toast({html: '开始重新匹配,请耐心等待...'})

    }
    const quitRefresh=()=>{
	    window.location.href = "/";
    }
    const addToChatArea=(msg,pos="left")=>{
	  if(pos=="right")
	  $chatArea.append($('<li class="card white-text blue-grey darken-1">').text(msg))
          else
          $chatArea.append($('<li class="card">').text(msg))
	  slt1()

    }
    const eventListening = ()=>{
    pubchat.on('chat message', msg => {
        if(pubflag)
        $('#messages').append($('<li>').text(msg.content))
    })
    news.on('chat message',msg=>{
	console.log("收到来自特定用户("+someonechatwith.name+")的消息:"+msg.content)
	if(!pubflag){
	addToChatArea(someonechatwith.name+":"+msg.content,"right")
	}

    })
    news.on('lineinwithnomale',tip=>{
      console.log("这会儿没有男人")
      M.toast({html: '这会儿没有男人!'})
      onlyslefflag=true      
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
	onlyslefflag=false
        someonechatwith=someone
	cleanChatArea();
    })
    news.on('update userself',updateduserself=>{
	    userself=updateduserself
    })
    news.on('user disconnected',socketid=>{
	    if(onlyslefflag)
		    return 
	    if(someonechatwith.socketid=socketid){
		console.log("对面下线,请等待新用户匹配")
		M.toast({html: "对面下线,请等待新用户匹配"})
		someonechatwith=undefined
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
      if(onlyslefflag){
	     addToChatArea("自己跟自己聊,很~:"+$('#m').val())
	     return
      }
      
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
      addToChatArea("me:"+msg.content)
      console.log("push chat message to:"+msg.to)
      }
      }
    }

    const cleanChatArea=()=>{
      $chatArea.find('li').remove();
    }
    ///////////////////////////////////////////////////////////////
    eventListening();
    $changehumanbutton.click(()=>{
	    changeHuman()
    });
    $quitrefresh.click(function(){ 
      quitRefresh()
    });  
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
		  news.emit('switch pub',userself);
		  $waitanim.fadeOut();

          }else{
   		  pubflag=false;
                  changeHuman();

          }
	  console.log("pubflag change"+pubflag); 
	  cleanChatArea();
   }); 
 })
