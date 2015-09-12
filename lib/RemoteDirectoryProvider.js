'use babel';

import RemoteDirectory from './RemoteDirectory';
import RemoteConnection from './RemoteConnection';

class RemoteDirectoryProvider {
  directoryForURISync(uri) {
    if (!uri.startsWith("black-bird:")) {
      return null;
    }

    return RemoteConnection.getInstance().createDirectory(uri);
  }

  directoryForURI(uri) {
    return Promise.resolve(this.directoryForURISync(uri));
  }
}

export default RemoteDirectoryProvider;
