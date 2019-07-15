document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

        function txMessage() {
            let message = document.querySelector("#message").value;
            if (message !== "" ){
            socket.emit('submit message', { 'selection': message });
            document.querySelector("#message").value = "";
        }
        }
        // Detect button press
        document.querySelector("#sendmessage").onclick = () => {
            txMessage();
        };
        //Detect Enter Key
        document.addEventListener('keypress', () => {
            if (event.key === "Enter") {
                txMessage();
            }
        });
    });

    // Annouce messace to everyone
    socket.on('announce message', data => {

        var username = "username";

        function createDiv()
        {
            var newDiv = document.createElement("div"); 
            newDiv.className = "alert alert-primary mt-2 mb-0 publishedmessage"
            newDiv.innerHTML = `<h6 class="alert-heading">${username}</h6> ${data.selection}`;
            return newDiv
        }

        function rxMessage()
        {
            var messages = message = document.querySelectorAll(".publishedmessage");
            var lastmessage = messages[messages.length];
            var parentDiv = document.getElementById("messagebox");
            parentDiv.insertBefore(createDiv(), lastmessage); 
        }

        rxMessage();
                
    });

});
