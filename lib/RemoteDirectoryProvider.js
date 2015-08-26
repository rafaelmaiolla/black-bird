'use babel';

import RemoteDirectory from './RemoteDirectory';

class RemoteDirectoryProvider {
  directoryForURISync(uri) {
    if (!uri.startsWith('black-bird://')) {
      return null;
    }

    return new RemoteDirectory(uri);
  }

  directoryForURI(uri) {
    return Promise.resolve(this.directoryForURISync(uri));
  }
}

export default RemoteDirectoryProvider;
