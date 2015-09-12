'use babel';

import {CompositeDisposable} from 'atom';
import path from 'path';
import uuid from 'node-uuid';
import fs from 'fs';
import mkdirp from 'mkdirp';
import os from 'os';
import {EventEmitter} from 'events';

class RemoteFile extends EventEmitter {
  constructor(connection, uri) {
    super();

    this.connection = connection;
    this.uri = uri;
    var {entryPath, hostname} = this.connection.parseURI(uri);
    this.filePath = entryPath;
    this.hostname = hostname;
    this.open = false;
  }

  create() {
    this.createLocalPath();
    mkdirp.sync(this.getLocalDirectory());
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
    return this.uri;
  }

  getRemotePath() {
    return this.filePath;
  }

  getLocalPath() {
    return this.localPath;
  }

  getBaseName() {
    return path.basename(this.getLocalPath());
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
    var fd = fs.openSync(this.getLocalPath(), 'w');
    fs.writeSync(fd, text);
    fs.closeSync(fd);
  }

  readSync() {
    return fs.readFileSync(this.getLocalPath(), "utf8");
  }

  createLocalPath() {
    var parsedpath = path.parse(this.filePath);
    var localFilePath = this.filePath.replace(parsedpath.root, '');

    this.localPath = path.join(os.tmpdir(), RemoteFile.LOCAL_FOLDER, this.hostname, localFilePath);
  }

  getDirectory() {
    return path.dirname(this.filePath);
  }

  getLocalDirectory() {
    return path.dirname(this.getLocalPath());
  }

  isEditing() {
    return !!this.editor;
  }

  edit() {
    console.log('[black-bird]', 'Edit', this);

    // TODO: User getPath to open the uri using the opener
    return atom.workspace.open(this.getPath()).then((editor) => {
      this.handleEditor(editor);
    });
  }

  onDidSave(callback) {
    this.on('didSave', callback);
  }

  onDidDestroy(callback) {
    this.on('didDestroy', callback);
  }

  handleEditor(editor) {
    console.log('[black-bird]', 'Handle editor');

    this.setEditor(editor);

    var subscriptions = new CompositeDisposable();
    subscriptions.add(this.getEditorBuffer().onDidSave(() => { this.handleEditorSave(); }));
    subscriptions.add(this.getEditorBuffer().onDidDestroy(() => { this.handleEditorClose(); }));
  }

  handleEditorSave() {
    console.log('[black-bird]', 'Handle editor save');
    this.emit('didSave', this);
  }

  handleEditorClose() {
    console.log('[black-bird]', 'Handle editor close');
    this.setEditor(null);
    this.emit('didDestroy', this);
  }

  setEditor(editor) {
    this.editor = editor;
  }

  getEditorBuffer() {
    return this.editor.getBuffer();
  }

  setRemotePathList() {
    this.remotePathList = true;
  }

  isRemotePathList() {
    return !!this.remotePathList;
  }

  toString() {
    return this.filePath;
  }
}

RemoteFile.LOCAL_FOLDER = "black-bird";

export default RemoteFile
