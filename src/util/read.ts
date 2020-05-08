import read from 'read';

export default async (opts: read.Options = {}): Promise<string> => (
  new Promise<string>((resolve, reject) => {
    read(opts, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  })
);
