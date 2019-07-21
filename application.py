import os
import datetime
from flask import Flask, render_template, json, jsonify, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# Channel name storage variable, start with two dummy channels
channels = [(1, 'Main Channel'), (2, 'Side Channel')]
# Messaged storage variable
allmessages = []

# Main landing page
@app.route("/")
def index():
    return render_template("index.html")

# route used to pull all messages for a given channel in json format
@app.route("/getmessages", methods=["GET"])
def getmessages():
    channel = request.args.get("channel")
    json_output = []
    for a, b, c, d in allmessages:
        if (a == int(channel)):
            json_output.append(
                {'channel': a, 'username': b, 'message': c, 'timestamp': d})
    return (jsonify(json_output))

# route used to pull list of all channels in json format
@app.route("/getchannels", methods=["GET"])
def getchannels():
    json_output = []
    for a, b in channels:
        json_output.append({'id': a, 'channel': b})
    return (jsonify(json_output))

# route used to create a new channel, returns creation status in json format
@app.route("/createchannel", methods=["GET"])
def createchannel():
    channelname = request.args.get("channelname")
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

#socket used for receving and publishing messages, also monitors 100 message limit
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

