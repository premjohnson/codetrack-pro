const net = require('net');

/**
 * Checks if a TCP port is currently free to listen on.
 * @param {number} port
 * @returns {Promise<boolean>}
 */
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port);
  });
};

/**
 * Recursively scans ports upwards until an available one is found.
 * @param {number} startPort
 * @returns {Promise<number>}
 */
const findAvailablePort = async (startPort) => {
  let port = parseInt(startPort, 10);
  while (!(await checkPort(port))) {
    port++;
  }
  return port;
};

module.exports = {
  checkPort,
  findAvailablePort,
};
