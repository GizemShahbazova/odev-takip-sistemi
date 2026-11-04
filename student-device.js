/* Remove the retired student labels from this browser; never read the values. */
(() => {
  const prefix = 'odev-takip-sistemi-6652a:student-name:v1:';
  try {
    const storage = window.localStorage;
    for (let i = storage.length - 1; i >= 0; i--) {
      const key = storage.key(i);
      if (key?.startsWith(prefix)) storage.removeItem(key);
    }
  } catch { /* Storage may be disabled. */ }
})();
