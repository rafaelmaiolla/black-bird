'use babel';

import Server from './Server';
import RemoteFileManager from './RemoteFileManager';
import StatusMessage from './StatusMessage';

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

    debugger;

    // TODO: The connection will probably not exists
    // Add the file as pending file
    // Assign it to the connection when it is open

    return atom.project.open(uri, options);
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
