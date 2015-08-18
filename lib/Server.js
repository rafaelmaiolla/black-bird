'use babel';

import Session from './Session'

class Server {
  constructor() {
  }
  static startServer() {
    console.info('[black-bird]', 'startServer');
  }
  static stopServer() {
    console.info('[black-bird]', 'stopServer');
  }
  static openFile() {
    console.info('[black-bird]', 'openFile');
  }
  static listFiles() {
    console.info('[black-bird]', 'listFiles');
  }
}

export default Server
