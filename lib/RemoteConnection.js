'use babel';

import {EventEmitter} from 'events';
import path from 'path';
import StatusMessage from './StatusMessage';
import RemoteFileManager from './RemoteFileManager';
import md5 from 'md5';

class RemoteConnection extends EventEmitter {
  constructor(socket, remoteFileManager) {
    super();

    this.socket = socket;
    this.remoteFileManager = remoteFileManager;

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

    this.socket.on('black-bird:connect', (hostname) => {
      console.info('[black-bird]', 'black-bird:connect');
      process.nextTick(()=>{
        this.remoteFileManager.setHostname(hostname);
        this.emit('connected');
      });
    });
  }

  handleRemoteFileEvents(remoteFile) {
    remoteFile.onDidSave((remoteFile) => {
      console.log('[black-bird]', 'Saving...');
      this.emit('saving', remoteFile.getBaseName());
      this.sendCommand('Save', [remoteFile.getRemotePath(), remoteFile.readSync()]);
    });

    remoteFile.onDidDestroy((remoteFile) => {
      console.log('[black-bird]', 'Close file', remoteFile.getBaseName());
      this.emit('closing', remoteFile.getBaseName());
      this.sendCommand('Close', [remoteFile.getRemotePath()]);
    });
  }

  sendCommand(command, commandArguments) {
    console.log('[black-bird]', 'Sending command', command, commandArguments);

    this.socket.emit('black-bird:cmd',  {
      cmd: command,
      arguments: commandArguments
    });
  }

  needConfirmBeforeReload(remoteFile) {
    if (remoteFile.isRemotePathList()) {
      return false;
    }

    if (remoteFile.getEditorBuffer().isModified()) {
      return true;
    }

    return false;
  }

  commandOpen(filePath, fileContent) {
    console.log('[black-bird]', 'Command Open', filePath);

    var remoteFile = this.remoteFileManager.getFile(filePath);

    if (remoteFile.isEditing()) {
      if (this.needConfirmBeforeReload(remoteFile)) {
        atom.confirm({
          message: "'" + remoteFile.getBaseName() + "' has changed in the Remote host, what do you want to do?",
          detailedMessage: "You will lose your changes if you click 'Load remote'.",
          buttons: {
            'Keep local': () => {},
            'Load remote': () => {
              remoteFile.writeSync(fileContent);
              remoteFile.getEditorBuffer().reload();
            }
          }
        })

      } else {
        remoteFile.writeSync(fileContent);
        remoteFile.getEditorBuffer().reload();
        this.emit('reloaded', remoteFile.getBaseName());
      }

    } else {
      remoteFile.create();
      remoteFile.writeSync(fileContent);
      remoteFile.edit();

      this.handleRemoteFileEvents(remoteFile);

      this.emit('opened', remoteFile.getBaseName());
    }
  }

  commandList(directoryPath, entriesList) {
    console.log('[black-bird]', 'File list', entriesList);

    debugger;

    var remoteDirectory = this.remoteFileManager.getDirectory(directoryPath, true, true);

    entriesList
    .sort((a, b) => {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    })
    .forEach((entry) => {
      var remoteFile = this.remoteFileManager.getFile(entry);
      this.remoteFileManager.createDirectory(remoteFile.getDirectory(), true);
    });

    // TODO: Create tree view
    // atom.project.addPath(this.getURIOfRemotePath(directoryPath));

    this.commandOpen(remoteDirectory.getRemotePath() + ".list", entriesList.join('\n'));

    this.emit('listed');
  }

  commandDiff(directoryPath, diff) {
    console.log('[black-bird]', 'Files diff', diff);

    var fileDiffName = path.normalize(directoryPath) + ".diff";
    this.commandOpen(fileDiffName, diff);

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

    var remoteFile = this.remoteFileManager.getFile(filePath);

    if (remoteFile && remoteFile.isEditing()) {
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

    // TODO: Do something
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

export default RemoteConnection
