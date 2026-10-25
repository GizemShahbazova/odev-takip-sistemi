/* Kodla giriş ve tek kullanımlık şifre oluşturma. Yönetici sırrı içermez. */
(function (root) {
  'use strict';
  const domain = 'odev-takip-sistemi-6652a.invalid';
  function fail(code) { const e = new Error(code); e.code = code; throw e; }
  function codeOf(value) {
    const text = String(value).trim().toLowerCase();
    const code = text.startsWith('btal') ? text.slice(4) : text;
    if (!/^[1-9][0-9]{5}$/.test(code)) fail('parent/invalid-code');
    return code;
  }
  function username(value) {return 'btal' + codeOf(value);}
  function alias(value, suffix) {
    const code = codeOf(value);
    if (suffix !== undefined && !/^[a-f0-9]{24}$/.test(suffix)) fail('parent/unknown-code');
    return 'veli-' + code + (suffix === undefined ? '' : '-' + suffix) + '@' + domain;
  }
  function validEmail(value, email) {
    const code = codeOf(value);
    return typeof email === 'string' && new RegExp('^veli-' + code + '-[a-f0-9]{24}@' + domain.replaceAll('.', '\\.') + '$').test(email);
  }
  async function resolve(fs, db, value) {
    const code = codeOf(value);
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
  async function changePassword(api, auth, current, password, isCurrent = () => true) {
    const user = auth.currentUser;
    if (!user?.email || !isCurrent()) fail('parent/session-changed');
    if (!current) fail('parent/current-password-required');
    if (!passwordValid(password)) fail('parent/weak-password');
    if (current === password) fail('parent/same-password');
    const credential = api.EmailAuthProvider.credential(user.email, current);
    await api.reauthenticateWithCredential(user, credential);
    // A logout or another account login must not update a different session.
    if (!isCurrent() || auth.currentUser?.uid !== user.uid) fail('parent/session-changed');
    await api.updatePassword(user, password);
  }
  function sessionAllowed(profile, claims) {
    if (profile.authVersion === undefined) return true; // Existing email accounts.
    return Number.isSafeInteger(profile.authVersion) && profile.authVersion >= 1 &&
      profile.accessReady === true && claims.parentAuthVersion === profile.authVersion &&
      Number.isSafeInteger(claims.auth_time) && claims.auth_time > profile.requireAuthAfter;
  }
  const core = {alias, codeOf, username, resolve, actionCode, passwordValid, verify, complete, changePassword, sessionAllowed};
  root.ParentCodeAuth = core;
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
})(typeof window !== 'undefined' ? window : globalThis);
