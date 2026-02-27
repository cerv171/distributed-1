const distribution = require('./distribution.js')();
const nids = [
  distribution.util.id.getNID({ip: '192.168.0.1', port: 8000}),
  distribution.util.id.getNID({ip: '192.168.0.2', port: 8000}),
  distribution.util.id.getNID({ip: '192.168.0.3', port: 8000}),
  distribution.util.id.getNID({ip: '192.168.0.4', port: 8000}),
  distribution.util.id.getNID({ip: '192.168.0.5', port: 8000}),
];


