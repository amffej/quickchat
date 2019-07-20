import os

from flask import Flask, render_template, json, jsonify, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = [(1, 'Main Channel'), (2, 'Side Channel')]
# allmessages = [(1,'jeff', 'This is a message','9:46 7/18/2019'), (2,'user2', 'this is another message, a much longer message','9:46 7/18/2019'), (1,'user3', 'hey, this is just random text place here','9:46 7/18/2019'),(1,'jeff', 'This is a message','9:46 7/18/2019'), (2,'user2', 'this is another message, a much longer message','9:46 7/18/2019'), (1,'user3', 'hey, this is just random text place here','9:46 7/18/2019')]
allmessages = []


@app.route("/getmessages", methods=["GET"])
def getmessages():
    channel = request.args.get("channel")
    messages = []
    for a, b, c, d in allmessages:
        if (a == int(channel)):
            messages.append(tuple((a, b, c, d)))
    json_ouput = jsonify(messages)
    return (json_ouput)


@app.route("/getchannels", methods=["GET", "POST"])
def getchannels():
    json_output = []
    for a, b in channels:
        json_output.append({'id': a, 'channel': b})
    return (jsonify(json_output))


@app.route("/createchannel", methods=["GET"])
def createchannel():
    channelname = request.args.get("channelname")
    print(channelname)
    lastID = channels[-1][0]
    newID = lastID + 1
    for a, b in channels:
        if(b == channelname):
            return ("Channel Taken")
    channels.append(tuple((newID, channelname)))
    return (f"Channel ID: {newID} Channel name: {channelname}")


@app.route("/")
def index():
    # return ("OK")
    return render_template("index.html")


@socketio.on("submit message")
def vote(data):
    # PUBLISH PUBLIC MESSAGES
    message = data["message"]
    username = data["username"]
    channel = int(data["channel"])
    print("received")
    print(channel)
    # TODO FIX TIME STAMP AND GET CHANNEL INPUT
    timestamp = "stamphere"
    allmessages.append(tuple((channel,username,message,timestamp)))
    # print(selection);
    emit("announce message", {"username": username, "message": message}, broadcast=True)
    
    # TODO PUBLISH PRIVATE MESSAGES
