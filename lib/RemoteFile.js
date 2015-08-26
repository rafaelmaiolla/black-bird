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

  onDidChange(callback) {
    throw "not implemented";
  }

  onDidRename(callback) {
    throw "not implemented";
  }

  onDidDelete(callback) {
    throw "not implemented";
  }

  onWillThrowWatchError(callback) {
    throw "not implemented";
  }

  isFile() {
    return true;
  }

  isDirectory() {
    return false;
  }

  exists() {
    throw "not implemented";
  }

  existsSync() {
    throw "not implemented";
  }

  getDigest() {
    throw "not implemented";
  }

  getDigestSync() {
    throw "not implemented";
  }

  setEncoding(encoding) {
    throw "not implemented";
  }

  getEncoding() {
    throw "not implemented";
  }

  getPath() {
    return this.temporaryFilePath;
  }

  getBaseName() {
    return path.basename(this.temporaryFilePath);
  }

  getRealPathSync() {
    throw "not implemented";
  }

  getRealPath() {
    throw "not implemented";
  }

  getParent() {
    throw "not implemented";
  }

  read(flushCache) {
    throw "not implemented";
  }

  write(text) {
    throw "not implemented";
  }

  writeSync(text) {
    var fd = fs.openSync(this.temporaryFilePath, 'w');
    fs.writeSync(fd, text);
    fs.closeSync(fd);
  }

  readSync() {
    return fs.readFileSync(this.temporaryFilePath);
  }

  createTemporaryFilePath() {
    this.temporaryFilePath = path.join(os.tmpdir(), uuid.v4(), path.basename(this.filePath));
  }

  getRemotePath() {
    return this.filePath;
  }

  getDirectory() {
    return path.dirname(this.temporaryFilePath);
  }

  setEditorBuffer(buffer) {
    this.editorBuffer = buffer;
  }

  getEditorBuffer() {
    return this.editorBuffer;
  }

  toString() {
    return this.filePath;
  }
}

export default RemoteFile
