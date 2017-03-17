from threading import Timer
from utils.db import insert
import time


current_milli_time = lambda: int(round(time.time() * 1000))

class Track(object):
    def __init__(self, date, views):
        self.date = date
        self.views = views

class Message(object):
    count = 0
    DB_FILENAME = 'db.json'
    def __init__(self, msg, channel):
        # self.service = msg.service
        # self.event = msg.event
        # self.id = msg.id
        # self.flags = msg.flags
        # self.to = msg.to
        # self.media = msg.media
        # self.post_id = msg.post_id
        # setattr(self, 'from', (getattr(msg, 'from')))
        # self.out = msg.out
        # self.unread = msg.unread
        # self.date = msg.date
        # self.views = msg.views
        # self.link = msg.link
        self.msg = msg
        self.id = msg.id
        self.tracks = []
        self.tracks.append(
            Track( (self.msg.date * 1000), 0) #self.msg.views
        )
        self.channel = channel
        self.count = 0

    def tracker(self, sender):
        if self.count < 60 :
            postponed_tracker = Timer(30.0, self.tracker, (sender, ))
            postponed_tracker.start()
        else:
            insert(self)
        track_result = sender.message_get(self.id)
        self.tracks.append(
            Track(current_milli_time(), track_result.views)
        )
        self.count += 1
