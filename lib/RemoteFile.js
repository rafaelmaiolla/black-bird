'use babel';

import path from 'path';
import uuid from 'node-uuid';
import fs from 'fs';
import mkdirp from 'mkdirp';
import os from 'os';

class RemoteFile {
  constructor(filePath, symlink) {
    this.filePath = filePath;
    this.symlink = symlink;
  }

  create() {
    this.createTemporaryFilePath();
    mkdirp.sync(this.getDirectory());
  }

  createTemporaryFilePath() {
    this.temporaryFilePath = path.join(os.tmpdir(), uuid.v4(), path.basename(this.filePath));
  }

  writeSync(content) {
    var fd = fs.openSync(this.temporaryFilePath, 'w');
    fs.writeSync(fd, content);
    fs.closeSync(fd);
  }

  readSync() {
    return fs.readFileSync(this.temporaryFilePath);
  }

  setEditorBuffer(buffer) {
    this.editorBuffer = buffer;
  }

  getEditorBuffer() {
    return this.editorBuffer;
  }

  getId() {
    return this.filePath;
  }

  getPath() {
    return this.temporaryFilePath;
  }

  getRemotePath() {
    return this.filePath;
  }

  getBasename() {
    return path.basename(this.temporaryFilePath);
  }

  getDirectory() {
    return path.dirname(this.temporaryFilePath);
  }

  toJSON() {
    return {
      file: this.filePath,
      hostname: this.hostname,
      basename: this.getBasename()
    }
  }

  toString() {
    return this.filePath;
  }
}

export default RemoteFile
