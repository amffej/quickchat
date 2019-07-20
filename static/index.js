document.addEventListener('DOMContentLoaded', () => {
    const template = Handlebars.compile(document.querySelector('#channels').innerHTML);
    localStorage.setItem("channel", 1);
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
    };

    function getChannels() {

        const Http = new XMLHttpRequest();
        const url = '/getchannels';
        Http.open("GET", url);
        Http.send();
        Http.onload = () => {
            const data = JSON.parse(Http.responseText);
            document.querySelector('#channellist').innerHTML = "";
            for (var key in data) {
                const content = template({ 'channelurl': data[key].id, 'channelname': data[key].channel, 'unreadmessages': 0 });
                document.querySelector('#channellist').innerHTML += content;
            }
            document.querySelectorAll('.list-group-item').forEach(button => {
                button.onclick = () => { 
                    localStorage.setItem("channel", button.dataset.channel);
                    //TODO ADD ACTION FOR WHEN CHANNEL GETS CLICKED;
                };
            });
        };

    };
    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected
    socket.on('connect', () => {

        function txMessage() {
            const username = localStorage.getItem("username");
            const channel = localStorage.getItem("channel");
            let message = document.querySelector("#message").value;
            if (message !== "") {
                socket.emit('submit message', { "channel": channel, "username": username, "message": message });
                document.querySelector("#message").value = "";

            }
        }

        document.querySelector("#refreshbutton").onclick = () => {
            getChannels();
        };

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
    getChannels();
});
