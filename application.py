import os

from flask import Flask, render_template
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
    #return ("OK")
    return render_template("index.html")

@socketio.on("submit message")
def vote(data):
    selection = data["selection"]
    print(selection);
    emit("announce message", {"selection": selection}, broadcast=True)