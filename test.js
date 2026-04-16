const timestamp = Date.now();
const _date = new Date(timestamp);
const date = _date.toLocaleDateString();
const time = _date.toLocaleTimeString();
console.log(_date);
console.log(date);
console.log(new Date(timestamp).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16),);