$(() => {
    var $window=$(window);
    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page
    var $usernameInput = $('.usernameInput'); 
    var $currentInput = $usernameInput.focus();
    var $inputMessage = $('#m');

    // Prompt for setting a username
    var username;
    var chat = io.connect('/chat');
    var news= io.connect('/news');
    
    setUsername = () => {
      username = cleanInput($usernameInput.val().trim());

      // If the username is valid
      if (username) {
        // Tell the server your username
        if($("input[name='1']:checked").val()!=undefined){
        $loginPage.fadeOut();
        $chatPage.show();
        $loginPage.off('click');
        $currentInput = $inputMessage.focus();
        news.emit('getin', {gender:$("input[name='1']:checked").val(),name:username});
        }
	else
	alert("请先选择性别");
      }
    }
    
    const cleanInput = (input) => {
    return $('<div/>').text(input).html();
    }

    $('form').submit(() => {
      chat.emit('chat message', $('#m').val())
      $('#m').val('')

      return false
    })

    chat.on('chat message', msg => {
      $('#messages').append($('<li>').text(msg))
    })
    
    
    news.on('lineinwithnomale',tip=>{
      console.log("这会儿没有男人")
      alert(tip)

    })    
    news.on('yourmeethuman',someone=>{
	alert(someone.gender+":"+someone.name)
    })
   $window.keydown(event => {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
      } else {
        setUsername();
      }
    }
   });    
    
    
 })
