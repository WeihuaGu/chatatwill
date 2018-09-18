$(() => {

    var $loginPage = $('.login.page'); // The login page
    var $chatPage = $('.chat.page'); // The chatroom page
    var $usernameInput = $('.usernameInput'); 
  // Prompt for setting a username
    var username;
    var socket = io()
    
    const setUsername = () => {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $chatPage.show();
      $loginPage.off('click');
      $currentInput = $inputMessage.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
    }

    $('form').submit(() => {
      socket.emit('chat message', $('#m').val())
      $('#m').val('')

      return false
    })

    socket.on('chat message', msg => {
      $('#messages').append($('<li>').text(msg))
    })
    
    
    
    
    
    
    
  })
