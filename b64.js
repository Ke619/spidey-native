const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const lookup = new Uint8Array(256);
for (let i = 0; i < chars.length; i++) lookup[chars.charCodeAt(i)] = i;
exports.decode = function(b64) {
  const clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  let out = '';
  for (let i = 0; i < clean.length; i += 4) {
    const a = lookup[clean.charCodeAt(i)];
    const b = lookup[clean.charCodeAt(i + 1)];
    const c = lookup[clean.charCodeAt(i + 2)];
    const d = lookup[clean.charCodeAt(i + 3)];
    out += String.fromCharCode((a << 2) | (b >> 4));
    if (i + 2 < clean.length) out += String.fromCharCode(((b & 15) << 4) | (c >> 2));
    if (i + 3 < clean.length) out += String.fromCharCode(((c & 3) << 6) | d);
  }
  return out;
};
