import json
from threading import Timer
from pymongo import MongoClient
mongo_client = MongoClient()

class Sample(object):
    def get_list(self):
        return 1

class Test(object):
    def __init__(self):
        self.count = 0

    def json_convert(self):
        return json.dumps(self.__dict__)

    def folan(self, input):
        result = input.get_list()
        print result
        loop = Timer(2, self.folan, (input,))
        loop.start()

test = Test()
sample = Sample()
test.folan(sample)
# test = Test()
# db = mongo_client.telegram
# db.telegram_data.insert(test.__dict__)
# with open('./channels.json', mode='r') as json_file:
#     file = json.load(json_file)
# with open('./channels.json', mode='w') as json_file:
#     file["2"] = (test.json_convert())
#     json.dump(file, json_file)
#     json_file.close()