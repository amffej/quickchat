document.addEventListener('DOMContentLoaded', () => {

    //Check if a username was created
    if (localStorage.getItem("username") == null) {
        $('#usernameEntry').modal({
            backdrop: "static",
            keyboard: false
        });
        //localStorage.getItem("lastname");
        //localStorage.setItem("lastname", "Smith");
    }
    document.querySelector("#saveUser").onclick = () => {

        var username = document.querySelector("#username");

        if (username.value == "") {
            username.className = "form-control is-invalid";
            var alertfeeback = document.querySelector("#userError");
            alertfeeback.innerHTML = "Please enter a user name";
        } else {
            if (validateUsername(username)) {
                localStorage.setItem("username", username.value);
                $('#saveUser').modal('hide');
                $('#usernameEntry').modal('hide');
            }
            else {
                username.className = "form-control is-invalid";
                var alertfeeback = document.querySelector("#userError");
                alertfeeback.innerHTML = "Only alphanumeric and at least 3 characters!";
            }

            function validateUsername(username) {
                var letters = /^[A-Za-z]+$/;
                if (username.value.match(letters) && username.value.length > 2) {
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        //TODO: CHECK IF USERNAME IS ALREADY TAKEN
    };
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

        var username = localStorage.getItem("username");
        
        function txMessage() {
            let message = document.querySelector("#message").value;
            if (message !== "") {
                socket.emit('submit message', {"username": username, "message": message});
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
                $('#myModal').modal()
            }
        });
    });

    // Annouce messace to everyone
    socket.on('announce message', data => {

        //var username = localStorage.getItem("username");
        var username = data.username;
        //TODO

        function createDiv() {
            var newDiv = document.createElement("div");
            newDiv.className = "alert alert-primary mt-2 mb-0 publishedmessage"
            newDiv.innerHTML = `<h6 class="alert-heading">${username}</h6> ${data.message}`;
            return newDiv
        }

        function rxMessage() {
            var messages = message = document.querySelectorAll(".publishedmessage");
            var lastmessage = messages[messages.length];
            var parentDiv = document.getElementById("messagebox");
            parentDiv.insertBefore(createDiv(), lastmessage);
            parentDiv.scrollTop = parentDiv.scrollHeight;
        }

        rxMessage();

    });

});
