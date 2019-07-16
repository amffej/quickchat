import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = []

@app.route("/")
def index():
    #return ("OK")
    return render_template("index.html")

@socketio.on("submit message")

def vote(data):
    #PUBLISH PUBLIC MESSAGES
    message = data["message"]
    username = data["username"] 
    #print(selection);
    emit("announce message", {"username": username, "message": message}, broadcast=True)
    
    #TODO PUBLISH PRIVATE MESSAGES