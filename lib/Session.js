'use babel';

import {CompositeDisposable} from 'atom';
import {EventEmitter} from 'events';
import uuid from 'node-uuid';
import mkdirp from 'mkdirp';

class Session extends EventEmitter {
  constructor(socket) {
    super();

    this.socket = socket;

    this.socket.on('error', (err) => {
      console.error(err);
    });

    this.socket.on('black-bird:cmd', (data) => {
      console.info('[black-bird]', 'black-bird:cmd', data);
      if (this['command' + data.f]) {
        this['command' + data.f].apply(this, data.arguments);
      }
    });

    this.socket.on('black-bird:connect', () => {
      console.info('[black-bird]', 'black-bird:connect');
      this.emit('connect');
    });
  }
  atomOpenFile() {
    console.log('[black-bird]', 'opening file');

    atom.workspace.open(this.temporaryFile).then((editor) => {
      this.handleEditor(editor)
    })
  }
  handleEditor(editor) {
    var buffer = editor.getBuffer();

    var subscriptions = new CompositeDisposable();
    subscriptions.add(buffer.onDidSave(this.save));
    subscriptions.add(buffer.onDidDestroy(this.close));
  }
  createTemporaryFile() {
    this.temporaryFile = path.join(os.tmpdir(), uuid.v4(), this.basename);
    var directoryName = path.dirname(this.temporaryFile)
    mkdirp.sync(directoryName);
    this.fd = fs.openSync(this.temporaryFile, 'w');
  }
  commandOpen(data) {
    this.token = data.token;
    this.displayName = data.displayName;
    this.remoteAddress = data.remoteAddress;
    this.baseName = data.baseName;
    this.createTemporaryFile();
    fs.writeSync(this.fd, data.fileContent);
    fs.closeSync(fd);
    this.atomOpenFile();
  }
}

export default Session
