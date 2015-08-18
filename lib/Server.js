'use babel';

import socketIO from 'socket.io'
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import Session from './Session'

class Server {
  constructor() {
    this.online = false;
    this.connectedSession = null;
    this.server = null;
  }
  startServer(quiet=false) {
    console.info('[black-bird]', 'startServer');

    if (this.online) {
      this.stopServer();
      console.log('[black-bird]', 'Restarting server');

    } else if (!quiet){
      console.log('[black-bird]', 'Starting server');
    }

    var port = atom.config.get('black-bird.port');

    this.server = http.createServer();
    var io = socketIO(this.server);

    this.server.listen(port, 'localhost');

    io.on('connection', this.connectionHandler);
  }
  stopServer() {
    console.info('[black-bird]', 'stopServer');

    if (this.online) {
      this.server.close();
      this.online = false;
    }
  }
  connectionHandler(socket) {
    var session = new Session(socket);

    session.on("connect", () => {
      this.connectedSession = session;
    });
  }
  openFile() {
    console.info('[black-bird]', 'openFile');
  }
  listFiles() {
    console.info('[black-bird]', 'listFiles');
  }
}

export default new Server
