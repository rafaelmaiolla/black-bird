'use babel';

import {CompositeDisposable} from 'atom';
import {EventEmitter} from 'events';
import path from 'path';
import StatusMessage from './StatusMessage';
import RemoteFile from './RemoteFile';
import md5 from 'md5';

class Session extends EventEmitter {
  constructor(socket) {
    super();

    this.remoteFileMap = new Map();

    this.socket = socket;
    this.handleSocketEvents();
  }

  handleSocketEvents() {
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
        process.nextTick(()=>{
          this['command' + data.cmd].apply(this, data.arguments);
        });
      }
    });

    this.socket.on('black-bird:connect', () => {
      console.info('[black-bird]', 'black-bird:connect');
      this.emit('connected');
    });
  }

  atomOpenFile(remoteFile) {
    console.log('[black-bird]', 'Atom open file', remoteFile);

    atom.workspace.open(remoteFile.getPath()).then((editor) => {
      this.handleEditor(remoteFile, editor);
    });
  }

  handleEditor(remoteFile, editor) {
    console.log('[black-bird]', 'Handle editor');

    var editorBuffer = editor.getBuffer()

    remoteFile.setEditorBuffer(editorBuffer);

    var subscriptions = new CompositeDisposable();
    subscriptions.add(editorBuffer.onDidSave(() => { this.handleEditorSave(remoteFile); }));
    subscriptions.add(editorBuffer.onDidDestroy(() => { this.handleEditorClose(remoteFile); }));
  }

  handleEditorSave(remoteFile) {
    console.log('[black-bird]', 'Handle editor save');

    console.log('[black-bird]', 'Saving...');
    this.emit('saving', remoteFile.getBaseName());

    this.sendCommand('Save', [remoteFile.getRemotePath(), remoteFile.readSync()]);
  }

  handleEditorClose(remoteFile) {
    console.log('[black-bird]', 'Handle editor close');

    console.log('[black-bird]', 'Close file', remoteFile.getBaseName());
    this.emit('closing', remoteFile.getBaseName());

    this.remoteFileMap.delete(remoteFile.getId());

    this.sendCommand('Close', [remoteFile.toJSON()]);
  }

  sendCommand(command, commandArguments) {
    console.log('[black-bird]', 'Sending command', command, commandArguments);

    this.socket.emit('black-bird:cmd',  {
      cmd: command,
      arguments: commandArguments
    });
  }

  commandOpen(filePath, fileContent) {
    console.log('[black-bird]', 'Command Open', filePath);

    var remoteFile = this.remoteFileMap.get(filePath);

    if (remoteFile) {
      if (remoteFile.getEditorBuffer().isModified()) {
        var editorBuffer = remoteFile.getEditorBuffer();

        atom.confirm({
          message: "'" + remoteFile.getBaseName() + "' has changed in the Remote host, what do you want to do?",
          detailedMessage: "You will lose your changes if you click 'Load remote'.",
          buttons: {
            'Keep local': () => {},
            'Load remote': () => {
              remoteFile.writeSync(fileContent);
              editorBuffer.reload();
            }
          }
        })

      } else {
        remoteFile.writeSync(fileContent);
        this.emit('reloaded', remoteFile.getBaseName());
      }

    } else {
      remoteFile = new RemoteFile(filePath);
      remoteFile.create();
      remoteFile.writeSync(fileContent);

      this.remoteFileMap.set(filePath, remoteFile);

      this.atomOpenFile(remoteFile);

      this.emit('opened', remoteFile.getBaseName());
    }
  }

  commandList(directoryPath, fileList) {
    console.log('[black-bird]', 'File list', fileList);

    // TODO: Create tree in project

    var remoteFile = new RemoteFile(directoryPath + ".list");
    remoteFile.create();
    remoteFile.writeSync(fileList.join('\n'));

    this.atomOpenFile(remoteFile);

    this.fileList = fileList;

    atom.project.addPath("black-bird://" + directoryPath);

    this.emit('listed');
  }

  commandDiff(directoryPath, diff) {
    console.log('[black-bird]', 'Files diff', diff);

    var remoteFile = new RemoteFile(directoryPath + ".diff");
    remoteFile.create();
    remoteFile.writeSync(diff);

    this.atomOpenFile(remoteFile);

    this.emit('diffed');
  }

  commandConfirmSave(filePath) {
    console.log('[black-bird]', 'File saved', path.basename(filePath));
    this.emit('saved', path.basename(filePath));
  }

  commandConfirmClose(filePath) {
    console.log('[black-bird]', 'File closed', path.basename(filePath));
    this.emit('closed', path.basename(filePath));
  }

  commandChanged(filePath, fileMD5) {
    console.log('[black-bird]', 'File changed', path.basename(filePath));

    var remoteFile = this.remoteFileMap.get(filePath);

    if (remoteFile) {
      var buffer;
      var editorBuffer = remoteFile.getEditorBuffer();
      var buffer = editorBuffer.getText();
      if (fileMD5 != md5(buffer)) {
        this.emit('changed', path.basename(filePath));
        this.openFile(filePath, true);
      }
    }
  }

  commandCreated(filePath) {
    console.log('[black-bird]', 'File created', filePath);
    this.emit('created', filePath);
  }

  commandRemoved(filePath) {
    console.log('[black-bird]', 'File removed', filePath);
    this.emit('removed', filePath);

    var remoteFile = this.remoteFileMap.get(filePath);
    if (remoteFile) {
      // TODO: Do something
    }
  }

  openFile(filePath, reload) {
    console.log('[black-bird]','Open file', filePath);
    this.emit(reload? 'reloading' : 'opening', path.basename(filePath));
    this.sendCommand('Open', [filePath]);
  }

  listFiles(directoryPath, ignoredNames) {
    console.log('[black-bird]','List files', directoryPath, ignoredNames);
    this.emit('listing');
    this.sendCommand('List', [directoryPath, ignoredNames]);
  }

  diffFiles(directoryPath, respositoryType) {
    console.log('[black-bird]','Diff files', directoryPath, respositoryType);
    this.emit('diffing');
    this.sendCommand('Diff', [directoryPath, respositoryType]);
  }

  rejectConnect() {
    console.log('[black-bird]','Reject connect');
    this.emit('rejecting');
    this.sendCommand('Reject', []);
  }
}

export default Session
