import fetch from 'node-fetch';
import cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import date from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import logger from '../util/logger';
import { DataExtractor, DataExtractorResult } from './base-data-extractor';

date.extend(customParseFormat);

type UnitVeterancyMap = { [unitName: string]: string[] };
type VeterancyData = {
  lastUpdated: string;
  data: { [armyName: string]: UnitVeterancyMap };
};

const VETERANCY_URL = 'https://www.coh2.org/guides/29892/the-company-of-heroes-2-veterancy-guide';
const VETERANCY_DATE_FORMAT = 'M-D-YY';
const OUTPUT_FILE_NAME = 'veterancy.json';

async function downloadVeterancyData(): Promise<VeterancyData> {
  const response = await fetch(VETERANCY_URL);
  const html = await response.text();
  const query = cheerio.load(html);
  const content = query('.guide > .content');
  const introSection = content.find('.section').first().find('h3');

  // Extract the 'last updated date' from the page
  const dateMatch = introSection.text().match(/\d+-\d+-\d+/g);
  if (dateMatch === null) {
    throw new Error('Could not parse last updated date from page');
  }

  const lastUpdated = date(dateMatch[0], VETERANCY_DATE_FORMAT);
  if (!lastUpdated.isValid()) {
    throw new Error(`Could not parse date: ${dateMatch[0]}`);
  }

  logger.info(`Last updated: ${date().diff(lastUpdated, 'day')} days ago`);

  const result: VeterancyData = {
    data: {},
    lastUpdated: lastUpdated.format('DD-MM-YYYY'),
  };

  let currentArmyName = '';
  const sections = content.find('.section').slice(1);
  for (const element of sections.toArray()) {
    const section = query(element).first();
    const header = section.find(':first-child').first();

    // If the header is an H1, then we have moved to parsing a new army
    if (header.hasClass('h1')) {
      const text = header.text().trim();
      // The section headed by 'RIP' is the end of the useful date
      if (text === 'RIP') {
        break;
      }

      currentArmyName = header.text();
      logger.debug(currentArmyName);
      result.data[currentArmyName] = {};
    } else {
      const tables = section.find('.post_content_table');
      const armyName = currentArmyName;
      tables.each((i, tableElement) => {
        const table = query(tableElement).first();
        const unitName = table.find('tbody > tr:first-child > td:nth-child(2)').text();
        result.data[armyName][unitName] = new Array<string>(3);
        logger.debug(`\t${unitName}`);

        const vetElements = table.find('tbody > tr').slice(1).find('td:nth-child(2)');
        vetElements.each((_, rowElement) => {
          result.data[armyName][unitName][i] = query(rowElement).text();
        });
      });
    }
  }

  return result;
}

const VeterancyDownloader: DataExtractor = async (opts) => {
  logger.info('Downloading latest veterancy data...');

  const veterancyData = await downloadVeterancyData();
  const outputDirPath = path.join(opts.outputPath, veterancyData.lastUpdated);
  const result: DataExtractorResult = {
    outputId: veterancyData.lastUpdated,
    completed: false,
  };

  if (!fs.existsSync(outputDirPath)) {
    fs.mkdirSync(outputDirPath);
    fs.writeFileSync(path.join(outputDirPath, OUTPUT_FILE_NAME), JSON.stringify(veterancyData, null, 2), 'utf8');
    result.completed = true;
  } else {
    logger.warn(`Veterancy data already downloaded for ${veterancyData.lastUpdated}`);
    result.completed = false;
  }

  return result;
};

export default VeterancyDownloader;
