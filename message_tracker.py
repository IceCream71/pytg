from __future__ import absolute_import
from pytg.utils import coroutine
from lib.channel import Channel
from lib.message import Message
from threading import Timer
from pytg import Telegram
import json
from pytg.sender import Sender
from pytg.receiver import Receiver
import time

channels = []
# tg = Telegram(
#     telegram='/home/mohammad/Applications/etcli/bin/telegram-cli',
#     pubkey_file='/home/mohammad/Applications/etcli/tg-server.pub',
#     port=9009)
# r = tg.receiver
# s = tg.sender

r = Receiver(host="localhost", port=4458)
s = Sender(host="localhost", port=4458)
s.default_answer_timeout = 15.0

def __validate_message__(msg):
    if msg.event == 'message' and hasattr(msg, 'to') and hasattr(msg.to, 'peer_type') and msg.to.peer_type == 'channel':
        channel = filter(lambda x: x["peer_id"] == msg.to.peer_id, channels)
        channel = channel[0]
        if channel:
            return channel
    return False

def _generate_channels():
    list = s.channel_list()
    for channel in list:
        temp = Channel(channel)
        channels.append(temp)

def handle_new_messages(channel, message_list, itr):
    now = time.time()
    last_message = message_list[-1]
    if last_message.id != channel["last_id"]:
        for msg in message_list:
            flag = ((now - msg.date > 60) and itr == 1 )
            if not flag:
                if msg.id != channel["last_id"]:
                    new_message = Message(msg, channel)
                    tracker = Timer(30.0, new_message.tracker, (s))
                    tracker.start()
                else:
                    channel["last_id"] = last_message.id
                    break

# @coroutine
# def receive_loop():
#     while True:
#         msg = (yield)
#         print msg
#         channel = __validate_message__(msg)
#         if channel:
#             new_message = Message(msg, channel)
#             channel.posts.append(new_message)
#             tracker = Timer(30.0, new_message.tracker, (s))
#             tracker.start()

def main_loop():
    iterate = 0
    while True:
        iterate += 1
        time.sleep(1)
        for channel in channels:
            result = s.history(channel['print_name'], 10)
            print result
            handle_new_messages(channel, result, iterate)



# _generate_channels()
with open('./channels.json', mode='r') as json_file:
    channels = json.load(json_file)
    for channel in channels:
        channel["last_id"] = ""

s.dialog_list()
main_loop()

# r.start()
# r.message(receive_loop())
