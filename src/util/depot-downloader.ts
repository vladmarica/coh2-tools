import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import logger from './logger';
import read from './read';

const DEPOT_DOWNLOADER_PATH = 'external/depot-downloader/DepotDownloader.dll';
const FILE_LIST_FILE_NAME = 'filelist.txt';

export type DepotDownloaderOptions = {
  files?: string[],
  stripFilePrefixes?: boolean;
};

function isDotnetRuntimeAvailable(): boolean {
  const result = spawnSync('dotnet', ['--info']);
  return result.status === 0;
}

async function downloadDepot(outputDir: string, app: number, depot: number, opts: DepotDownloaderOptions = {}) {
  if (!isDotnetRuntimeAvailable()) {
    throw new Error('Could not start DepotDownloader - the Dotnet runtime is not installed');
  }

  const depotDownloaderFullPath = path.join(process.cwd(), DEPOT_DOWNLOADER_PATH);
  if (!fs.existsSync(depotDownloaderFullPath)) {
    throw new Error(`Could not find DepotDownloader.dll, should be at ${depotDownloaderFullPath}`);
  }

  const username = await read({ prompt: 'Enter Steam username: ' });
  const password = await read({ prompt: 'Enter Steam password: ', silent: true });

  return new Promise<void>((resolve, reject) => {
    const params = [depotDownloaderFullPath, '-app', app.toString(), '-depot', depot.toString(),
      '-username', username, '-password', password, '-dir', outputDir];

    // If the 'files' option is specified, we write the array to a temp file to pass to
    // the DepotDownloader using the '-filelist' flag
    let fileListTempDirPath: string | undefined;
    if (opts.files && opts.files.length > 0) {
      fileListTempDirPath = fs.mkdtempSync('depot-downloader');
      const fileListPath = path.join(fileListTempDirPath, FILE_LIST_FILE_NAME);

      fs.writeFileSync(fileListPath, opts.files.join('\n'), 'utf8');
      logger.debug('File list temp path: ' + fileListPath);

      params.push('-filelist', fileListPath);
    }

    // Execute 'dotnet DepotDownloader.dll' and wait for the process to finish
    const downloaderProcess = spawn('dotnet', params, {
      stdio: [process.stdin, process.stdout, process.stderr],
    });

    downloaderProcess.on('exit', (code) => {
      logger.info(`Download depot ${depot} finished. Cleaning up...`);
      if (fileListTempDirPath) {
        fs.rmdirSync(fileListTempDirPath, { recursive: true });
      }

      fs.rmdirSync(path.join(outputDir, '.DepotDownloader'), { recursive: true });

      if (opts.stripFilePrefixes && opts.files) {
        for (const filePath of opts.files) {
          const finalOutputPath = path.join(outputDir, filePath);

          if (fs.existsSync(finalOutputPath)) {
            for (const fileToMove of fs.readdirSync(path.join(outputDir, filePath))) {
              fs.renameSync(path.join(finalOutputPath, fileToMove), path.join(outputDir, fileToMove));
            }
          }

          const filePathBase = filePath.split(path.sep)[0];
          fs.rmdirSync(path.join(outputDir, filePathBase), { recursive: true });
        }
      }

      if (code !== 0) {
        return reject(new Error(`Failed to download depot ${depot}.  Process exited with code ${code}`));
      }
      return resolve();
    });
  });
}

export default downloadDepot;
