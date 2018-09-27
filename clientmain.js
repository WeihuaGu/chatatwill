$(() => {
    var $window=$(window);
    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page
    var $usernameInput = $('.usernameInput'); 
    var $currentInput = $usernameInput.focus();
    var $inputMessage = $('#m');

    var username;
    var someonechatwith;
    var chat = io.connect('/chat');
    var news= io.connect('/news');

    
    const setUsername = () => {
      username = cleanInput($usernameInput.val().trim());
    }
    const gotoChatPage=()=>{
      if (username) {
        // Tell the server your username
        if($("input[name='1']:checked").val()!=undefined){
        $loginPage.fadeOut();
        $chatPage.show();
        $loginPage.off('click');
        $currentInput = $inputMessage.focus();
        news.emit('getin', {gender:$("input[name='1']:checked").val(),name:username});
	eventListening();
        }
	else
	alert("请先选择性别");
     }
    }  
    const cleanInput = (input) => {
    return $('<div/>').text(input).html();
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

    $('form').submit(() => {
      sendChatMessage($('#m').val())
      $('#m').val('')
      return false
    })

   $usernameInput.keypress((e) => { 
     if (e.which == 13) { 
        setUsername()
	gotoChatPage()
     } 
   });
    
   $window.keydown(event => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
   });    
    
    
 })
