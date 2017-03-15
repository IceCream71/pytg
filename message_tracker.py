from __future__ import absolute_import
from pytg.utils import coroutine
from lib.channel import Channel
from lib.message import Message
from threading import Timer
from pytg import Telegram


channels = []
tg = Telegram(
    telegram='/home/mohammad/Applications/etcli/bin/telegram-cli',
    pubkey_file='/home/mohammad/Applications/etcli/tg-server.pub',
    port=9009)
r = tg.receiver
s = tg.sender
s.default_answer_timeout = 15.0

def __validate_message__(msg):
    if msg.to.peer_type == 'channel':
        channel = filter(lambda x: x.peer.peer_id == msg.to.peer_id, channels)
        if channel:
            return channel
    return False

def _generate_channels():
    list = s.channel_list()
    for channel in list:
        temp = Channel(channel)
        channels.append(temp)


@coroutine
def receive_loop():
    while True:
        msg = (yield)
        print msg
        channel = __validate_message__(msg)
        if channel:
            new_message = Message(msg, channel)
            channel.posts.append(new_message)
            tracker = Timer(30.0, new_message.tracker, (s))
            tracker.start()




_generate_channels()
r.start()
r.message(receive_loop())
