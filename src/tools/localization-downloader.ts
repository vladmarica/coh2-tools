import path from 'path';
import fs from 'fs';
import dayjs from 'dayjs';
import createExtractor, { DataExtractorFunc, DataExtractorResult } from './base-data-extractor';
import downloadDepot from '../util/depot-downloader';
import steamdb from '../util/steamdb';
import logger from '../util/logger';

const LOCALIZATION_APP_ID = 231430;
const LOCALIZATION_DEPOT_ID = 231432;
const DATE_FORMAT = 'DD-MM-YYYY';
const FILE_FILTER = ['CoH2/Locale/English/'];

const LocalizationDownloader: DataExtractorFunc = async (opts) => {
  const lastUpdatedDate = await steamdb.getDepotUpdateDate(LOCALIZATION_DEPOT_ID);
  const lastUpdatedDateString = lastUpdatedDate.format(DATE_FORMAT);
  const outputDirPath = path.join(opts.outputPath, lastUpdatedDateString);

  const result: DataExtractorResult = {
    metadata: {
      extractedOn: dayjs().toString(),
      lastUpdated: lastUpdatedDate.toString(),
    },
    finalOutputPath: outputDirPath,
    completed: false,
  };

  if (!fs.existsSync(outputDirPath)) {
    logger.info(`Downloading localization data for ${lastUpdatedDateString}`);

    await downloadDepot(outputDirPath, LOCALIZATION_APP_ID, LOCALIZATION_DEPOT_ID, {
      files: FILE_FILTER,
      stripFilePrefixes: true,
    });

    result.completed = true;
  } else {
    logger.warn(`Localization data already downloaded for ${lastUpdatedDateString}`);
    result.completed = false;
  }
  return result;
};

export default createExtractor(LocalizationDownloader);
