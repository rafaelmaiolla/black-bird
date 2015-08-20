'use babel';

import {CompositeDisposable} from 'atom';
import {EventEmitter} from 'events';
import uuid from 'node-uuid';
import mkdirp from 'mkdirp';
import path from 'path';
import os from 'os';
import fs from 'fs';
import StatusMessage from './StatusMessage';

class Session extends EventEmitter {
  constructor(socket, ignoredNames) {
    super();

    this.socket = socket;
    this.ignoredNames = ignoredNames;

    this.socket.on('error', (err) => {
      console.error(err);
    });

    this.socket.on('disconnect', () => {
      console.log('[black-bird]', 'Disconnected');
      this.emit('disconnected');
    });

    this.socket.on('black-bird:cmd', (data) => {
      console.info('[black-bird]', 'black-bird:cmd', data);
      if (this['command' + data.cmd]) {
        this['command' + data.cmd].apply(this, data.arguments);
      }
    });

    this.socket.on('black-bird:connect', () => {
      console.info('[black-bird]', 'black-bird:connect');
      this.emit('connected');
    });
  }

  atomOpenFile(options) {
    console.log('[black-bird]', 'Atom open file', options);

    atom.workspace.open(options.temporaryFile).then((editor) => {
      this.handleEditor(options, editor);
    });
  }

  handleEditor(options, editor) {
    console.log('[black-bird]', 'Handle editor');
    var buffer = editor.getBuffer();

    var subscriptions = new CompositeDisposable();
    subscriptions.add(buffer.onDidSave(() => { this.handleEditorSave(options); }));
    subscriptions.add(buffer.onDidDestroy(() => { this.handleEditorClose(options); }));
  }

  handleEditorSave(options) {
    console.log('[black-bird]', 'Handle editor save');

    console.log('[black-bird]', 'Saving...');
    this.emit('saving', options.basename);

    var fileContent = fs.readFileSync(options.temporaryFile);
    this.sendCommand('Save', [options, fileContent]);
  }

  handleEditorClose(options) {
    console.log('[black-bird]', 'Handle editor close');

    console.log('[black-bird]', 'Close file', options.basename);
    this.emit('closing', options.basename);

    this.sendCommand('Close', [options]);
  }

  createTemporaryFile(options) {
    console.log('[black-bird]', 'Create temporary file', options);

    options.temporaryFile = path.join(os.tmpdir(), uuid.v4(), options.basename);
    console.log('[black-bird]', 'Temporary file', options.temporaryFile);

    var directoryName = path.dirname(options.temporaryFile)
    mkdirp.sync(directoryName);
    return fs.openSync(options.temporaryFile, 'w');
  }

  sendCommand(command, commandArguments) {
    console.log('[black-bird]', 'Sending command', command, commandArguments);

    this.socket.emit('black-bird:cmd',  {
      cmd: command,
      arguments: commandArguments
    });
  }

  commandOpen(options, fileContent) {
    console.log('[black-bird]', 'Command Open', options);

    this.emit('opened');

    var fd = this.createTemporaryFile(options);
    fs.writeSync(fd, fileContent);
    fs.closeSync(fd);
    this.atomOpenFile(options);
  }

  commandList(fileList) {
    console.log('[black-bird]', 'File list', fileList);

    this.emit('listed');

    // TODO: Create tree in project
    var options = {basename: "fileList"};
    var fd = this.createTemporaryFile(options);
    fs.writeSync(fd, fileList.join('\n'));
    fs.closeSync(fd);
    this.atomOpenFile(options);
  }

  commandConfirmSave(options) {
    console.log('[black-bird]', 'File saved', options.basename);
    this.emit('saved', options.basename);
  }

  commandConfirmClose(options) {
    console.log('[black-bird]', 'File closed', options.basename);
    this.emit('closed', options.basename);
  }
  
  commandChanged(options) {
    console.log('[black-bird]', 'File changed', options.basename);
    this.emit('changed', options.basename);
  }

  openFile(filePath) {
    console.log('[black-bird]','Open file', filePath);
    this.emit('opening', path.basename(filePath));
    this.sendCommand('Open', [filePath]);
  }

  listFiles(remotePath) {
    console.log('[black-bird]','List files', remotePath);
    this.emit('listing');
    this.sendCommand('List', [remotePath, this.ignoredNames]);
  }
}

export default Session
