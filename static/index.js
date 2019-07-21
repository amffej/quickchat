document.addEventListener('DOMContentLoaded', () => {
    const channelTemplate = Handlebars.compile(document.querySelector('#channels').innerHTML);
    const messageTemplate = Handlebars.compile(document.querySelector('#newmessage').innerHTML);

    localStorage.setItem("channel", 1);
    loadChannelMessages(1);
    //Check if a username was created
    if (localStorage.getItem("username") == null) {
        $('#usernameEntry').modal({
            backdrop: "static",
            keyboard: false
        });
        //localStorage.getItem("lastname");
        //localStorage.setItem("lastname", "Smith");
    }

    function validateInput(input, minlen, allowspace) {

        if (allowspace) {
            var letters = /^[A-Za-z\d\s]+$/;
        } else {
            var letters = /^[A-Za-z\d]+$/;
        }

        if (input.value.match(letters) && input.value.length > minlen) {
            return true;
        }
        else {
            return false;
        }
    }

    document.querySelector("#saveUser").onclick = () => {

        var username = document.querySelector("#username");

        if (validateInput(username, 2, false)) {
            localStorage.setItem("username", username.value);
            $('#usernameEntry').modal('hide');
        }
        else {
            username.className = "form-control is-invalid";
            var alertfeeback = document.querySelector("#userError");
            alertfeeback.innerHTML = "Only alphanumeric and at least 3 characters!";
        }
    };

    document.querySelector("#saveChannel").onclick = () => {
        var channelname = document.querySelector("#channelname");
        if (validateInput(channelname, 3, true)) {
            createChannel(channelname.value);
        } else {
            channelname.className = "form-control is-invalid";
            var alertfeeback = document.querySelector("#channelError");
            alertfeeback.innerHTML = "Only alphanumeric and at least 4 characters!";
        }
        function createChannel(channelname) {

            const Http = new XMLHttpRequest();
            const url = '/createchannel?channelname=' + channelname;
            Http.open("GET", url);
            Http.send();
            Http.onload = () => {
                const data = JSON.parse(Http.responseText);
                if (data.success) {
                    getChannels();
                    $('#channelEntry').modal('hide');
                } else {
                    var channelname = document.querySelector("#channelname");
                    channelname.className = "form-control is-invalid";
                    var alertfeeback = document.querySelector("#channelError");
                    alertfeeback.innerHTML = "Problem creating channel, Name might be taken!";
                }
            }
        }

    }
    function getChannels() {

        const Http = new XMLHttpRequest();
        const url = '/getchannels';
        Http.open("GET", url);
        Http.send();
        Http.onload = () => {
            const data = JSON.parse(Http.responseText);
            const currentChannel = localStorage.getItem("channel");
            document.querySelector('#channellist').innerHTML = "";
            for (var key in data) {
                var active = "";
                var unreadvisible = "visible";
                if (currentChannel == data[key].id) {
                    active = "active";
                }
                var channelUnread = localStorage.getItem(data[key].id);
                if (channelUnread == 0 || channelUnread == null) {
                    unreadvisible = "invisible";
                }
                const content = channelTemplate({ 'channelurl': data[key].id, 'channelname': data[key].channel, 'unreadmessages': channelUnread, 'isactive': active, 'visibility': unreadvisible });
                document.querySelector('#channellist').innerHTML += content;
            }
            document.querySelectorAll('.list-group-item').forEach(button => {
                button.onclick = () => {
                    localStorage.setItem("channel", button.dataset.channel);
                    getChannels();
                    loadChannelMessages(button.dataset.channel);
                    if (window.screen.width < 768) {
                        $('.collapse').collapse("toggle");
                    }
                };
            });
        };

    };

    function loadChannelMessages(channel) {
        document.querySelector('#messagebox').innerHTML = "";
        const Http = new XMLHttpRequest();
        const url = '/getmessages?channel=' + channel;
        Http.open("GET", url);
        Http.send();
        Http.onload = () => {
            const data = JSON.parse(Http.responseText);
            for (var k in data) {
                publishMessage(data[k].username, data[k].message, data[k].timestamp)
            }
        }
        localStorage.setItem(channel, 0);
    }

    function publishMessage(username, message, timestamp) {
        const content = messageTemplate({ 'username': username, 'message': message, 'timestamp': timestamp });
        var messagesDiv = document.querySelector('#messagebox');
        messagesDiv.innerHTML += content;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
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
        // Detect refresh channels button press
        document.querySelector("#refreshbutton").onclick = () => {
            getChannels();
        };
        // Detect create channel button press
        document.querySelector("#createchannel").onclick = () => {
            var channelname = document.querySelector("#channelname");
            channelname.className = "form-control";
            var alertfeeback = document.querySelector("#userError");
            alertfeeback.innerHTML = "";
            channelname.value = ""
            $('#channelEntry').modal();
        }
        // Detect send message button press
        document.querySelector("#sendmessage").onclick = () => {
            txMessage();
        };

        // Detect if screen is clicked and collape menu on mobile
        $('#messagebox').click(function () {
            if (window.screen.width < 768) {
                $('.collapse').collapse("toggle");
            }
        });

        //Detect Enter Key press
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
        var currentChannel = localStorage.getItem("channel");
        if (data.channel == currentChannel) {
            publishMessage(username, data.message, data.timestamp);
        } else {
            var channelUnread = localStorage.getItem(data.channel);
            channelUnread++;
            localStorage.setItem(data.channel, channelUnread);
            var DOMunread = document.querySelector("#ch" + data.channel);
            DOMunread.className = "badge badge-danger badge-pill d-flex justify-content-between align-items-center visible"
            DOMunread.innerHTML = channelUnread;
        }
    });
    getChannels();
});
