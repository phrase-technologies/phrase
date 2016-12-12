// ============================================================================
// Serve with Forever
// ============================================================================
/* eslint no-var: 0 */
console.log("⌛ Loading forever-monitor...")
var forever = require('forever-monitor')
var child = new(forever.Monitor)('index.js', {
  'silent': false,
  'watch': true,
  'watchDirectory': './src',      // Top-level directory to watch from.
  'logFile': 'logs/forever.log',  // Path to log output from forever process (when daemonized)
  'outFile': 'logs/forever.out',  // Path to log output from child stdout
  'errFile': 'logs/forever.err',
})
child.start()
