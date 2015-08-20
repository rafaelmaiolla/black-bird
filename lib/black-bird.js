'use babel';

import Server from './Server';
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
  }
};

export function activate(state) {
  console.info('[black-bird]', 'activate', state);

  if (atom.config.get('black-bird.launch_at_startup')) {
    Server.startServer();
  }

  atom.commands.add('atom-workspace', 'black-bird:start-server', () => Server.startServer())
  atom.commands.add('atom-workspace', 'black-bird:stop-server', () => Server.stopServer())
  atom.commands.add('atom-workspace', 'black-bird:list-files', () => Server.listFiles())
  atom.commands.add('atom-text-editor', 'black-bird:open-file', () => Server.openFile())
}

export function deactivate() {
  console.info('[black-bird]', 'deactivate');

  Server.stopServer();
}

export function consumeStatusBar(statusBar) {
  console.info('[black-bird]', 'statu-bar');

  StatusMessage.setStatusBar(statusBar);
}
