'use strict';
const prompt = require('prompt');

let functions = {
  cloneSO: (obj) => {
    if (null === obj || undefined === obj || 'object' !== typeof obj) {
      return obj;
    }
    if (obj instanceof Date) {
      let copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }
    if (obj instanceof Array) {
      let copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = cloneSO(obj[i]);
      }
      return copy;
    }
    if (obj instanceof Object) {
      var copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) {
          copy[attr] = cloneSO(obj[attr]);
        }
      }
      return copy;
    }
    throw new Error('Unable to copy obj! Its type isn\'t supported.');
  }

};

const input = cfg => new Promise(
  (rs, rj) =>
    prompt.get(
      cfg,
      (err, res) => err
        ? rj(err)
        : rs(res)))


const inputField = field =>
  input([{ name: field, required: true }])
    .then(res => res[field])

prompt.start();

module.exports = {
  inputField,
  input
};