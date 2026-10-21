/* Kodla giriş ve tek kullanımlık şifre oluşturma. Yönetici sırrı içermez. */
(function (root) {
  'use strict';
  const domain = 'odev-takip-sistemi-6652a.invalid';
  function fail(code) { const e = new Error(code); e.code = code; throw e; }
  function alias(code, suffix) {
    if (!/^[1-9][0-9]{5}$/.test(String(code))) fail('parent/invalid-code');
    if (suffix !== undefined && !/^[a-f0-9]{24}$/.test(suffix)) fail('parent/unknown-code');
    return 'veli-' + code + (suffix === undefined ? '' : '-' + suffix) + '@' + domain;
  }
  function validEmail(code, email) {
    alias(code);
    return typeof email === 'string' && new RegExp('^veli-' + code + '-[a-f0-9]{24}@' + domain.replaceAll('.', '\\.') + '$').test(email);
  }
  async function resolve(fs, db, code) {
    alias(code);
    let record;
    try {record = await fs.getDocFromServer(fs.doc(db, 'parentLogins', code));}
    catch(error) {if (error.code === 'permission-denied') fail('parent/unknown-code'); throw error;}
    const email = record.exists() ? record.data().email : '';
    if (!validEmail(code, email)) fail('parent/unknown-code');
    return email;
  }
  function actionCode(key) {
    if (!/^YENI-[A-Za-z0-9_-]{16,512}$/.test(key)) fail('parent/invalid-key');
    return key.slice(5);
  }
  function passwordValid(value) {
    return typeof value === 'string' && !value.startsWith('YENI-') && value.length >= 10 && value.length <= 128 && /\p{L}/u.test(value) && /[0-9]/.test(value);
  }
  async function verify(api, auth, code, key, expected) {
    if (!validEmail(code, expected)) fail('parent/unknown-code');
    const token = actionCode(key);
    const email = await api.verifyPasswordResetCode(auth, token);
    if (email.toLowerCase() !== expected) fail('parent/key-account-mismatch');
    return {email: expected, token};
  }
  async function complete(api, auth, code, key, password, expected) {
    if (!passwordValid(password) || password === key) fail('parent/weak-password');
    const checked = await verify(api, auth, code, key, expected);
    await api.confirmPasswordReset(auth, checked.token, password);
    // Authentication can be retried normally if the network drops after this step.
    return api.signInWithEmailAndPassword(auth, checked.email, password);
  }
  function sessionAllowed(profile, claims) {
    if (profile.authVersion === undefined) return true; // Existing email accounts.
    return Number.isSafeInteger(profile.authVersion) && profile.authVersion >= 1 &&
      profile.accessReady === true && claims.parentAuthVersion === profile.authVersion &&
      Number.isSafeInteger(claims.auth_time) && claims.auth_time > profile.requireAuthAfter;
  }
  const core = {alias, resolve, actionCode, passwordValid, verify, complete, sessionAllowed};
  root.ParentCodeAuth = core;
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
})(typeof window !== 'undefined' ? window : globalThis);
