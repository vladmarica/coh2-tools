import fs from 'fs';
import path from 'path';
import logger from '../util/logger';

const METADATA_FILE_NAME = 'metadata.json';

export type DataExtractorOptions = {
  outputPath: string;
  stripFolderPrefixes? : boolean;
};

export type Metadata = {
  lastUpdated: string;
  extractedOn: string;
  [key: string]: any;
};

export type DataExtractorResult = {
  metadata: Metadata;
  finalOutputPath: string;
  completed: boolean;
};

export type DataExtractorFunc = (opts: DataExtractorOptions) => Promise<DataExtractorResult>;

export default function createExtractor(func: DataExtractorFunc): DataExtractorFunc {
  return async (opts: DataExtractorOptions) => {
    const result = await func(opts);

    // write metadata to file
    if (result.completed) {
      if (!fs.existsSync(result.finalOutputPath)) {
        logger.error(`Could not write metadata file - output path ${result.finalOutputPath} does not exist`);
      } else {
        fs.writeFileSync(
          path.join(result.finalOutputPath, METADATA_FILE_NAME),
          JSON.stringify(result.metadata, null, 2),
          'utf8',
        );
      }

      logger.info(`Output written to ${result.finalOutputPath}`);
    }

    return result;
  };
}
