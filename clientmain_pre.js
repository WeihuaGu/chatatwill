$(() => {
    var $window=$(window);
    var $loginPage = $('.login.page'); 
    var $usernameInput = $('.usernameInput'); 
    var $currentInput = $usernameInput.focus();
    var username;
  
    const setUsername = () => {
      username = cleanInput($usernameInput.val().trim());
    }
    const gotoChatPage=()=>{
      if (username) {
        // Tell the server your username
        if($("input[name='1']:checked").val()!=undefined){
        $loginPage.fadeOut();
        $loginPage.off('click');
	document.cookie="pre_name="+username;
	document.cookie="pre_gender="+$("input[name='1']:checked").val()
	window.location.href = "/chat";
        }
	else
	alert("请先选择性别");
     }
    }  
    const cleanInput = (input) => {
    return $('<div/>').text(input).html();
    }
   
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
