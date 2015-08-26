'use babel';

class RemoteDirectory {
  constructor(directoryPath, symlink=false) {
    this.path = directoryPath;
  }

  create(mode=0777) {
    debugger;
    return;
  }

  onDidChange(callback) {
    debugger;
    return;
  }

  isFile()  {
    return false;
  }

  isDirectory()  {
    return true;
  }

  exists()  {
    debugger;
    return;
  }

  existsSync()  {
    debugger;
    return;
  }

  isRoot()  {
    debugger;
    return;
  }

  getPath()  {
    debugger;
    return this.path;
  }

  getRealPathSync()  {
    debugger;
    return;
  }

  getBaseName()  {
    debugger;
    return;
  }

  relativize()  {
    debugger;
    return;
  }

  getParent() {
    debugger;
    return;
  }

  getFile(filename) {
    debugger;
    return;
  }

  getSubdirectory(dirname) {
    debugger;
    return;
  }

  getEntriesSync() {
    debugger;
    return;
  }

  getEntries(callback) {
    debugger;
    return;
  }

  contains(pathToCheck) {
    debugger;
    return;
  }
}

export default RemoteDirectory;
