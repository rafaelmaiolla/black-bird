'use babel';

import {EventEmitter} from 'events';
import path from 'path';
import RemoteFile from './RemoteFile';
import RemoteDirectory from './RemoteDirectory';

class RemoteFileManager extends EventEmitter {
  constructor() {
    super();

    this.remoteEntryMap = new Map();
  }

  setHostname(hostname) {
    this.hostname = hostname;
  }

  parseURI(uri) {
    var parts = uri.replace(RemoteFileManager.PROTOCOL + "//", "").split(":");
    return {
      hostname: parts[0],
      entryPath: path.normalize(parts.splice(1).join(":"))
    }
  }

  getURIOfRemotePath(entryPath) {
    return RemoteFileManager.PROTOCOL + "//" + this.hostname + ":" + path.normalize(entryPath);
  }

  getDirectory(remotePath, exist, root) {
    var uri = this.getURIOfRemotePath(remotePath);
    return this.createDirectory(uri, exist, root);
  }

  createDirectory(uri, exist, root) {
    var {entryPath} = this.parseURI(uri);

    var remoteDirectory = this.remoteEntryMap.get(entryPath);

    if (!remoteDirectory || remoteDirectory.getRemotePath() !== entryPath) {
      remoteDirectory = new RemoteDirectory(this, uri);
      remoteDirectory.setExist(exist);
      remoteDirectory.setRoot(root);
      this.remoteEntryMap.set(entryPath, remoteDirectory);
    }

    if (remoteDirectory && remoteDirectory.isFile()) {
      throw new Error('Path is not a directory:' + uri);
    }

    return remoteDirectory;
  }

  getFile(remotePath) {
    var uri = this.getURIOfRemotePath(remotePath);
    return this.createFile(uri);
  }

  createFile(uri) {
    var {entryPath} = this.parseURI(uri);

    var remoteFile = this.remoteEntryMap.get(entryPath);
    if (!remoteFile || remoteFile.getRemotePath() !== entryPath) {
      remoteFile = new RemoteFile(this, this.getURIOfRemotePath(entryPath));
      this.remoteEntryMap.set(entryPath, remoteFile);
    }

    if (remoteFile.isDirectory()) {
      throw new Error('Path is not a file' + uri);
    }

    return remoteFile;
  }

  getEntries(remotePath) {
    var entries = [];

    this.remoteEntryMap.forEach((entry, entryPath) => {
      if ((entry.isFile() && entry.getDirectory() == remotePath) ||
          (entry.isDirectory() && entry.getLocalPath() == remotePath)) {
        entries.push(entry);
      }
    });

    return entries;
  }

  static canOpen(uri) {
    return uri.startsWith(RemoteFileManager.PROTOCOL);
  }
}

RemoteFileManager.PROTOCOL = "black-bird:";

export default RemoteFileManager;
