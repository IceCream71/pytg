'use strict';
const path = require('path');
const os = require('os');
const channels = require('../config/channels.json');
const trackingMessages = [];
const Queue = require('promise-queue');
const MTProto = require('telegram-mtproto').MTProto;
const inputField = require('./utils/fixtures').inputField;

/*const app = {
  id: 49631,
  hash: 'fb050b8f6771e15bfda5df2409931569'
};*/
const app = {
  id: 77459,
  hash: '8bcc25e37e63274ec6b38616a0f83b64'
};


const api = {
  invokeWithLayer: 0xda9b0d0d,
  layer          : 57,
  initConnection : 0x69796de9,
  api_id         : app.id
};

const phone = {
  num: '+989131985157'
};

const server = {
  dev: false,
  webogram: false
};

const client = MTProto({ server, api });

async function connect(){
  console.log("in connect");
  /*const { phone_code_hash } = await client('auth.sendCode', {
    phone_number  : phone.num,
    current_number: false,
    api_id        : app.id,
    api_hash      : app.hash
  }/*, { createNetworker: true });
  /*console.log(phone_code_hash);
  const code = await inputField('code');
  const { user } = await client('auth.signIn', {
    phone_number   : '+989131985157',
    phone_code_hash: phone_code_hash,
    phone_code     : code
  });*/

  const { phone_code_hash } = await client('auth.sendCode', {
    phone_number  : phone.num,
    current_number: false,
    api_id        : app.id,
    api_hash      : app.hash
  }, { dcID: 4 });
  console.log(phone_code_hash);
  const code = await inputField('code');
  const { user } = await client('auth.signIn', {
    phone_number   : '+989131985157',
    phone_code_hash: phone_code_hash,
    phone_code     : code
  }, { dcID: 4 });
  console.log('signed as ', user)
}

connect();



// const Client = new TelegramAPI(config);
//
// const startTracking = (connection, channel) => {
//   return new Promise((resolve, reject) => {
//     try {
//       connection.history(channel.print_name, 1, 0).then(list => {
//         if (!channel.posts) {
//           channel.posts = [];
//         }
//         let last = list[list.length - 1];
//         let time = (new Date()).getTime();
//         time = parseInt(time / 1000);
//         for (let i = list.length - 1; i >= 0; i--){
//           if ((Math.abs(time - list[i].date) < 60) || true ) {
//             if (channel.last_id != list[i].id) {
//               let message = Object.assign({}, list[i]);
//               channel.posts.push(message);
//               trackingMessages.push(message);
//               message.tracks.push({
//                 date: message.date,
//                 views: 0
//               });
//               setTimeout(message.update, 30000);
//             } else {
//               channel.last_id = last.id;
//               break;
//             }
//           }
//         }
//         if (channel.last_id === undefined || channel.last_id === null){
//           channel.last_id = last.id;
//         }
//         resolve();
//       });
//     } catch (error){
//       reject(error);
//     }
//   });
// };


// const trackLoop = (connection) => {
//   if (global.LOCK == false) {
//     global.LOCK = true;
//     startTracking(connection, channels[0]).then(() => {
//       global.LOCK = false;
//       console.log(`${channels[0].print_name} Done.`);
//       console.log(trackingMessages);
//       // setTimeout(trackLoop, 5000, connection);
//       /*startTracking(connection, channels[1]).then(() => {
//        console.log(`${channels[1].print_name} Done.`);
//        startTracking(connection, channels[2]).then(() => {
//        console.log(`${channels[2].print_name} Done.`);
//        });
//        });*/
//     });
//   } else {
//     setTimeout(trackLoop, 5000, connection);
//   }
// };

// let maxConcurrent = 1;
// let maxQueue = Infinity;
// let queue = new Queue(maxConcurrent, maxQueue);
// let getMessageUpdate = function(connection ,message){
//   return new Promise((resolve, reject) => {
//     if (true) {
//       connection.getMessage(message.id).then(update => {
//         resolve(update);
//       });
//       // connection.stdin.write("get_message \n");
//       /*if (message.tracks.length < 60) {
//         connection.getMessage(message.id).then(update => {
//           message.tracks.push({
//             date: update.date,
//             views: update.views
//           });
//           connection._executeCommand('');
//           resolve(message);
//         }).catch((error) => {
//           reject(error);
//         });
//       } else {
//         fs.writeFileSync(__dirname + '/data/db.txt', obj, 'utf-8');
//       }*/
//     }
//   });
// };


// Client.connect((connection, child) => {
//   /*connection.on('message', message => {
//     console.log(message);
//   });*/
//   connection.channelList().then(channels => {
//     // console.log("dialogs:", dialogs);
//     // trackLoop(connection);
//     connection.history(channels[0].print_name, 10, 0).then((list) => {
//       getMessageUpdate(connection, list[0])
//         .then((result) => {
//           console.log(result);
//           getMessageUpdate(connection, list[1])
//             .then((result) => {
//               console.log(result);
//             });
//         });
//     });
//   });
// });

// list.forEach((element, index) => {
//   console.log(index);
//   globalMessage = element;
//   queue.add(getMessageUpdate)
//     .then((message) => {
//       console.log(`message with id ${message.id} updated`);
//       console.log('Pending ' + queue.pendingPromises + '/' + queue.maxPendingPromises + ' Queued ' + queue.queue.length + '/' + queue.maxQueuedPromises);
//     }, (err) => {
//       console.log(err);
//     });
// });
