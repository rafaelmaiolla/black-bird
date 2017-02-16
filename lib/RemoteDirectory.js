'use babel';

import path from 'path';

class RemoteDirectory {
  constructor(connection, uri) {
    this.connection = connection;
    this.uri = uri;
    var {entryPath, hostname} = this.connection.parseURI(uri);
    this.directoryPath = entryPath;
    this.hostname = hostname;
  }

  create(mode=0o777) {
    return;
  }

  onDidChange(callback) {
    return;
  }

  isFile()  {
    return false;
  }

  isDirectory()  {
    return true;
  }

  setExist(exist) {
    this.exist = !!exist;
  }

  async exists(callback)  {
    return callback(this.existsSync());
  }

  existsSync()  {
    return this.exist;
  }

  isRoot()  {
    return this.root;
  }

  setRoot(root) {
    this.root = !!root;
  }

  getPath()  {
    return this.uri;
  }

  getRemotePath() {
    return this.directoryPath;
  }

  getRealPathSync()  {
    throw "not implemented";
  }

  getBaseName()  {
    return path.basename(this.directoryPath);
  }

  relativize(uri)  {
    if (!uri) {
      return uri;
    }

    var parsed = this.connection.parseURI(uri);
    var subDirectoryPath = parsed.entryPath;
    return path.relative(this.directoryPath, subDirectoryPath);
  }

  getParent() {
    if (this.isRoot()) {
      return this;

    } else {
      var uri = this.connection.getURIOfRemotePath(path.normalize(path.join(this.getRemotePath(), '..')));
      return this.connection.createDirectory(uri);
    }
  }

  getFile(filename) {
    var uri = this.connection.getURIOfRemotePath(path.normalize(path.join(this.getRemotePath(), filename)));
    return this.connection.createFile(uri);
  }

  getSubdirectory(dirname) {
    var uri = this.connection.getURIOfRemotePath(path.normalize(path.join(this.getRemotePath(), dirname)));
    return this.connection.createDirectory(uri);
  }

  getEntriesSync() {
    return this.connection.getEntries(this.getRemotePath());
  }

  async getEntries(callback) {
    callback(null, this.getEntriesSync());
  }

  contains(pathToCheck) {
    if (pathToCheck) {
      return pathToCheck.startsWith(this.getPath());
    } else {
      return false;
    }
  }
}

export default RemoteDirectory;
