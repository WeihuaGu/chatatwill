$(() => {
    var $window=$(window); 
    var $chatPage = $('.chat.page'); // The chatroom page
    var $inputMessage = $('#m');
    var $currentInput = $inputMessage.focus();
    var username;
    var someonechatwith;
    var chat = io.connect('/chat');
    var news= io.connect('/news');

    
    const getcookie= (objname)=>{//获取指定名称的cookie的值
	var arrstr = document.cookie.split("; ");
	for(var i = 0;i < arrstr.length;i ++){
	    var temp = arrstr[i].split("=");
	    if(temp[0] == objname) 
		return unescape(temp[1]);
	}
    }
    
    const eventListening = ()=>{
    chat.on('chat message', msg => {
        $('#messages').append($('<li>').text(msg.content))
    })
    news.on('lineinwithnomale',tip=>{
      console.log("这会儿没有男人")
      
    })  
    news.on('lineinwithnofemale',tip=>{
      console.log("这会儿没有女人")
      
    })  
    news.on('lineinwithself',tip=>{
      console.log("除了你没有别人了")
      
    })         
    news.on('yourmeethuman',someone=>{
	//alert(someone.gender+":"+someone.name)
	console.log("遇到了"+someone.name+"他的性别是"+someone.gender)
        someonechatwith=someone
    })
    }

    const sendChatMessage=(message)=>{
      msg={"to":someonechatwith.socketid,
           "content":message
          }
      chat.emit('chat message',msg)
    }

    eventListening();
    
    news.emit('getin', {gender:getcookie("pre_gender"),name:getcookie("pre_name")});
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
    
    
 })
