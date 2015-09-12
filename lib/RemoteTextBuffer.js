'use babel';

import {TextBuffer} from 'atom';
import {File} from 'pathwatcher';

class RemoteTextBuffer extends TextBuffer {
  constructor(remoteFile) {
    super({
      text: remoteFile.readSync()
    });
    this.remoteFile = remoteFile;

    this.setPath();
    this.load(true);
  }

  getPath() {
    return this.remoteFile.getPath();
  }

  getUri() {
    return this.remoteFile.getPath();
  }

  setPath(filePath) {
    this.file = new File(this.remoteFile.getLocalPath());
    this.file.setEncoding(this.getEncoding());
    this.subscribeToFile();

    this.emitter.emit('did-change-path', this.getPath());
  }

  saveAs(filePath) {
    filePath = this.remoteFile.getLocalPath();
    this.emitter.emit('will-save', {path: this.getPath()})

    try {
      this.file.writeSync(this.getText())
    } catch (error) {
      throw error
    }

    this.cachedDiskContents = this.getText()
    this.conflict = false
    this.emitModifiedStatusChanged(false)
    this.emitter.emit('did-save', {path: this.getPath()});
  }
}

export default RemoteTextBuffer;
