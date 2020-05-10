import path from 'path';
import fs from 'fs';
import dayjs from 'dayjs';
import createExtractor, { DataExtractorFunc, DataExtractorResult } from './base-data-extractor';
import downloadDepot from '../util/depot-downloader';
import steamdb from '../util/steamdb';
import logger from '../util/logger';

const ATTRIBUTES_APP_ID = 313220;
const ATTRIBUTES_DEPOT_ID = 313221;
const DATE_FORMAT = 'DD-MM-YYYY';
const FILE_FILTER = ['assets/data/attributes/'];

const AttributesDownloader: DataExtractorFunc = async (opts) => {
  const lastUpdatedDate = await steamdb.getDepotUpdateDate(ATTRIBUTES_DEPOT_ID);
  const lastUpdatedDateString = lastUpdatedDate.format(DATE_FORMAT);
  const outputDirPath = path.join(opts.outputPath, lastUpdatedDateString);

  const result: DataExtractorResult = {
    metadata: {
      lastUpdated: lastUpdatedDate.toString(),
      extractedOn: dayjs().toString(),
    },
    finalOutputPath: outputDirPath,
    completed: false,
  };

  if (!fs.existsSync(outputDirPath)) {
    logger.info(`Downloading attributes data for ${lastUpdatedDateString}`);

    await downloadDepot(outputDirPath, ATTRIBUTES_APP_ID, ATTRIBUTES_DEPOT_ID, {
      files: FILE_FILTER,
      stripFilePrefixes: true,
    });

    result.completed = true;
  } else {
    logger.warn(`Attributes data already downloaded for ${lastUpdatedDateString}`);
    result.completed = false;
  }
  return result;
};

export default createExtractor(AttributesDownloader);
