# QuickChat - Simple chat application

![Mobile Image](/static/img/app.png)

## Objective

The goal of this project was to build an online messaging service using Flask. The application was to be designed similar in spirit such as Slack. The users should have the ability to sign into the site with a display name, create channels to communicate in, as well as see existing channels. Once the user selects a channel, they should be able to see previous messages within that channel as well as send and receive messages with other users in the channel in real time.

### File Structure

```
project2-jeffmaldo27/
├── templates/
│   ├── index.html      # Main page
├── static/
│   ├── img/
│   │   └──  app.png    # Image used in readme
│   ├── index.js        # Main JavaScript File for the chat
│   └── style.css       # Custom CSS file
├── application.py      # Main flask application file
├── README.md           # This file!
├── .gitignore          # Git ignore configuration file
└── requirements.txt    # List required packages
```

### Features

* Single page design - All content is loaded within one main page (Personal Touch)
* Mobile friendly - Automatically hide channels on mobile view. (Personal Touch)
* Unread message counters - Badge showing unread messages per channel (Personal Touch)
* Save up to 100 messages per channel
* User can create custom channels
* No need to sign in again if browser is closed
