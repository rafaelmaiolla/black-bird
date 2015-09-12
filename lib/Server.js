'use babel';

import socketIO from 'socket.io'
import http from 'http';
import fs from 'fs';
import os from 'os';
import path from 'path';
import RemoteConnection from './RemoteConnection';
import RemoteFileManager from './RemoteFileManager';
import StatusMessage from './StatusMessage';

class Server {
  constructor() {
    this.online = false;
    this.connection = null;
    this.server = null;
    this.pendingURIList = [];
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

    this.server.listen(port, 'localhost', () => {
      console.log('[black-bird]', 'Server started port=' + port);
      StatusMessage.display('Server started port=' + port);
    });

    this.online = true;

    io.on('connection', (socket) => {this.connectionHandler(socket)});
  }

  stopServer() {
    console.info('[black-bird]', 'stopServer');

    if (this.online) {
      this.server.close();
      this.online = false;
      StatusMessage.display('Server stopped');
    }
  }

  connectionHandler(socket) {
    console.info('[black-bird]', 'New connection');

    this.fileManager = new RemoteFileManager();
    var connection = new RemoteConnection(socket, this.fileManager);

    connection.on("connected", () => {
      StatusMessage.display('Connected');
      if (!this.connection) {
        console.info('[black-bird]', 'Set connection');
        this.connection = connection;
        this.openPendingFiles();

      } else {
        connection.rejectConnect();
      }
    }.bind(this));

    connection.on("disconnected", () => {
      console.info('[black-bird]', 'Remove connection');
      StatusMessage.display('Disconnected');
      this.connection = null;
    }.bind(this));

    connection.on('saving', (fileName) => {
      StatusMessage.display('Saving ' + fileName);
    }.bind(this));

    connection.on('saved', () => {
      StatusMessage.display('File saved');
    }.bind(this));

    connection.on('closing', (fileName) => {
      StatusMessage.display('Closing ' + fileName);
    }.bind(this));

    connection.on('closed', (fileName) => {
      StatusMessage.display('File closed ' + fileName);
    }.bind(this));

    connection.on('changed', (fileName) => {
      StatusMessage.display('File changed ' + fileName);
    }.bind(this));

    connection.on('reloaded', (fileName) => {
      StatusMessage.display('File reloaded ' + fileName);
    }.bind(this));

    connection.on('opened', (fileName) => {
      StatusMessage.display('File opened ' + fileName);
    }.bind(this));

    connection.on('restored', (fileName) => {
      StatusMessage.display('File restored ' + fileName);
    }.bind(this));

    connection.on('listing', () => {
      StatusMessage.display('Listing');
    }.bind(this));

    connection.on('diffing', () => {
      StatusMessage.display('Diffing');
    }.bind(this));

    connection.on('opening', (fileName) => {
      StatusMessage.display('Opening ' + fileName);
    }.bind(this));

    connection.on('reloading', (fileName) => {
      StatusMessage.display('Reloading ' + fileName);
    }.bind(this));

    connection.on('rejecting', (fileName) => {
      StatusMessage.display('Connection rejected' + fileName);
    }.bind(this));
  }

  addPendingFile(uri) {
    if (this.isConnected()) {
      this.connection.restoreFile(uri);

    } else {
      this.pendingURIList.push(uri);
    }
  }

  openPendingFiles() {
    this.pendingURIList.forEach(uri => {
      this.connection.restoreFile(uri);
    });

    this.pendingURIList = [];
  }

  openFile() {
    console.info('[black-bird]', 'Open file');
    // Get the selected text
    var editor = atom.workspace.getActiveTextEditor()
    var text = editor.getSelectedText()

    if (!text) {
      // Get the text from the line in the cursor position
      text = editor.lineTextForBufferRow(editor.getCursorBufferPosition()['row'])
    }

    // TODO: parse the text so we extract a path from it
    if (this.connection) {
      this.connection.openFile(text);

    } else {
      console.warn('[black-bird]', 'Not connected');
      StatusMessage.display('Not connected');
    }
  }

  listFiles() {
    console.info('[black-bird]', 'List files');
    if (this.connection) {
      var remotePath = atom.config.get('black-bird.remote_project_path');
      var ignoredNames = atom.config.get('core.ignoredNames');
      this.connection.listFiles(remotePath, ignoredNames);

    } else {
      console.warn('[black-bird]', 'Not connected');
      StatusMessage.display('Not connected');
    }
  }

  diffFiles() {
    console.info('[black-bird]', 'Diff files');
    if (this.connection) {
      var remotePath = atom.config.get('black-bird.remote_project_path');
      var respositoryType = atom.config.get('black-bird.repository_type');
      this.connection.diffFiles(remotePath, respositoryType);

    } else {
      console.warn('[black-bird]', 'Not connected');
      StatusMessage.display('Not connected');
    }
  }

  getConnection(hostname) {
    return this.connection;
  }

  getFileManager(hostname) {
    return this.fileManager;
  }

  isConnected() {
    return !!this.connection;
  }
}

export default new Server();
