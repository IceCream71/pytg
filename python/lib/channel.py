
class Channel(object):
    posts = []
    def __init__(self, peer):
        self.peer = peer
        self.posts = []
        self.last_id = ""
