import path from 'path';
import fs from 'fs';
import { DataExtractor, DataExtractorResult } from './base-data-extractor';
import downloadDepot from '../util/depot-downloader';
import steamdb from '../util/steamdb';
import logger from '../util/logger';

const ATTRIBUTES_APP_ID = 313220;
const ATTRIBUTES_DEPOT_ID = 313221;
const DATE_FORMAT = 'DD-MM-YYYY';
const FILE_FILTER = ['assets/data/attributes/'];

const AttributesDownloader: DataExtractor = async (opts) => {
  const dateString = (await steamdb.getDepotUpdateDate(ATTRIBUTES_DEPOT_ID)).format(DATE_FORMAT);
  const outputDirPath = path.join(opts.outputPath, dateString);

  const result: DataExtractorResult = { outputId: dateString, completed: false };

  if (!fs.existsSync(outputDirPath)) {
    logger.info(`Downloading attributes data for ${dateString}`);

    await downloadDepot(outputDirPath, ATTRIBUTES_APP_ID, ATTRIBUTES_DEPOT_ID, {
      files: FILE_FILTER,
      stripFilePrefixes: true,
    });

    result.completed = true;
  } else {
    logger.warn(`Attributes data already downloaded for ${dateString}`);
    result.completed = false;
  }
  return result;
};

export default AttributesDownloader;
