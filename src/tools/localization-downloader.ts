import path from 'path';
import fs from 'fs';
import { DataExtractor, DataExtractorResult } from './base-data-extractor';
import downloadDepot from '../util/depot-downloader';
import steamdb from '../util/steamdb';
import logger from '../util/logger';

const LOCALIZATION_APP_ID = 231430;
const LOCALIZATION_DEPOT_ID = 231432;
const DATE_FORMAT = 'DD-MM-YYYY';
const FILE_FILTER = ['CoH2/Locale/English/'];

const LocalizationDownloader: DataExtractor = async (opts) => {
  const dateString = (await steamdb.getDepotUpdateDate(LOCALIZATION_DEPOT_ID)).format(DATE_FORMAT);
  const outputDirPath = path.join(opts.outputPath, dateString);

  const result: DataExtractorResult = { outputId: dateString, completed: false };
  if (!fs.existsSync(outputDirPath)) {
    logger.info(`Downloading localization data for ${dateString}`);

    await downloadDepot(outputDirPath, LOCALIZATION_APP_ID, LOCALIZATION_DEPOT_ID, {
      files: FILE_FILTER,
      stripFilePrefixes: true,
    });

    result.completed = true;
  } else {
    logger.warn(`Localization data already downloaded for ${dateString}`);
    result.completed = false;
  }
  return result;
};

export default LocalizationDownloader;
