document.addEventListener('DOMContentLoaded', () => {

    // Connect to websocket
    var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port);

    // When connected, configure buttons
    socket.on('connect', () => {

        function sendMessage() {
            let message = document.querySelector("#message").value;
            socket.emit('submit message', { 'selection': message });
            document.querySelector("#message").value = "";
        }
        // Detect button press
        document.querySelector("#sendmessage").onclick = () => {
            sendMessage();
        };
        //Detect Enter Key
        document.addEventListener('keypress', () => {
            if (event.key === "Enter") {
                sendMessage();
            }
        });
    });

    // Annouce messace to everyone
    socket.on('announce message', data => {
        const li = document.createElement('li');
        li.innerHTML = `Message: ${data.selection}`;
        document.querySelector('#temp').append(li);
    });

});
