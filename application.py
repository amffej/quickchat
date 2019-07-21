import os
import datetime
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
    json_output = []
    for a, b, c, d in allmessages:
        if (a == int(channel)):
            json_output.append(
                {'channel': a, 'username': b, 'message': c, 'timestamp': d})
    return (jsonify(json_output))


@app.route("/getchannels", methods=["GET", "POST"])
def getchannels():
    json_output = []
    for a, b in channels:
        json_output.append({'id': a, 'channel': b})
    return (jsonify(json_output))


@app.route("/createchannel", methods=["GET"])
def createchannel():
    channelname = request.args.get("channelname")
    # print(channelname)
    json_output = []
    lastID = channels[-1][0]
    newID = lastID + 1
    if channelname is None:
        return jsonify({"success": False, "reason": "Empty"})
    for a, b in channels:
        if(b == channelname):
            return jsonify({"success": False, "reason": "Taken"})
    channels.append(tuple((newID, channelname)))
    return jsonify({"success": True, "id": newID, "channel": channelname})


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
    timestamp = datetime.datetime.now().strftime('%H:%M %p %m/%d/%y')
    allmessages.append(tuple((channel, username, message, timestamp)))
    emit("announce message", {"username": username,"message": message, "channel": channel, "timestamp": timestamp}, broadcast=True)
    cleanMessages(channel)
    
# If more than 100 messages in channel remove oldest message of channel
def cleanMessages(channel):
    totalmessages = len([message for message in allmessages if message[0] == int(channel)])
    if totalmessages > 100:
        firstmessage = next((message for message in allmessages if message[0] == int(channel)))
        allmessages.remove(firstmessage) 

