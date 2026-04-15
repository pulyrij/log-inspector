const timestamp = Date.now();
const datetime = new Date(timestamp).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 16)
console.log(datetime);