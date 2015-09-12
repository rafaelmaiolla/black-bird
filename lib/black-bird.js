'use babel';

import path from 'path';
import {TextEditor} from 'atom';
import Server from './Server';
import RemoteFileManager from './RemoteFileManager';
import StatusMessage from './StatusMessage';
import RemoteTextBuffer from './RemoteTextBuffer';

export var config = {
  launch_at_startup: {
    type: 'boolean',
    default: false
  },
  keep_alive: {
    type: 'boolean',
    default: false
  },
  port: {
    type: 'integer',
    default: 52698
  },
  remote_project_path: {
    type: 'string',
    default: './'
  },
  repository_type: {
    type: 'string',
    default: 'svn'
  }
};

export function activate(state) {
  console.info('[black-bird]', 'activate', state);

  if (atom.config.get('black-bird.launch_at_startup')) {
    Server.startServer();
  }

  atom.workspace.addOpener((uri, options) => {
    if (!RemoteFileManager.canOpen(uri)) {
      return;
    }

    if (Server.isConnected()) {
      var fileManager = Server.getFileManager();
      var remoteFile = fileManager.getFileForURI(uri);

      return new TextEditor({
        buffer: new RemoteTextBuffer(remoteFile),
        softWrapped: false,
        tabLength: 2,
        softTabs: true,
        mini: false,
        lineNumberGutterVisible: true,
        placeholderText: ""
      });
    }
  });

  atom.workspace.getTextEditors().forEach(editor => {
    var uri = editor.getURI();
    if (!uri || !RemoteFileManager.canOpen(uri)) {
      return;
    }

    var buffer = editor.getBuffer();
    atom.workspace.getPanes().forEach((pane) => {
      pane.getItems().forEach((item) => {
        if (item.buffer === buffer) {
          pane.destroyItem(item);
        }
      });
    });

    uri = RemoteFileManager.fixUri(path.normalize(uri));

    Server.addPendingFile(uri);
  });

  atom.commands.add('atom-workspace', 'black-bird:start-server', () => Server.startServer())
  atom.commands.add('atom-workspace', 'black-bird:stop-server', () => Server.stopServer())
  atom.commands.add('atom-workspace', 'black-bird:list-files', () => Server.listFiles())
  atom.commands.add('atom-text-editor', 'black-bird:open-file', () => Server.openFile())
  atom.commands.add('atom-workspace', 'black-bird:diff-files', () => Server.diffFiles())
}

export function deactivate() {
  console.info('[black-bird]', 'deactivate');

  Server.stopServer();
}

export function consumeStatusBar(statusBar) {
  console.info('[black-bird]', 'statu-bar');

  StatusMessage.setStatusBar(statusBar);
}

export function createRemoteDirectoryProvider() {
  var RemoteDirectoryProvider = require('./RemoteDirectoryProvider');
  return new RemoteDirectoryProvider();
}
