import json
from pymongo import MongoClient
mongo_client = MongoClient()

def insert(message):
    try:
        with open(message.DB_FILENAME, mode='w', encoding='utf-8') as json_file:
            entry = {}
            entry[message.id] = message.convert_to_json()
            json.dump(entry, json_file)
            json_file.close()

        db = mongo_client.telegram
        db.telegram_data.insert(message.__dict__)

    except:
        raise ValueError("Error, probably object has no convert_to_json function attr")