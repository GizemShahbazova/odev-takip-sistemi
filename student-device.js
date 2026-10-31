/* Optional name on this device only. No network or Firebase access. */
(function (root) {
  'use strict';
  const namespace = 'odev-takip-sistemi-6652a:student-name:v1:';
  function key(uid, code) {
    if (typeof uid !== 'string' || !uid || uid.length > 128 || !/^btal[1-9][0-9]{5}$/.test(code)) throw new Error('invalid-account');
    return namespace + encodeURIComponent(uid) + ':' + code;
  }
  function normalize(value) {
    if (typeof value !== 'string') throw new Error('invalid-name');
    const label = value.trim().normalize('NFC');
    if (label.length > 80 || /\p{C}|[\r\n\t]/u.test(label)) throw new Error('invalid-name');
    return label.replace(/ {2,}/g, ' ');
  }
  function read(storage, uid, code) {
    try {return normalize(storage.getItem(key(uid, code)) || '');} catch {return '';}
  }
  function write(storage, uid, code, value) {
    const label = normalize(value), accountKey = key(uid, code);
    if (label) storage.setItem(accountKey, label); else storage.removeItem(accountKey);
    return label;
  }
  function remove(storage, uid, code) {storage.removeItem(key(uid, code));}
  const core = {key, normalize, read, write, remove};
  root.StudentDeviceLabel = core;
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
})(typeof window !== 'undefined' ? window : globalThis);
