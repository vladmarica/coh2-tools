import fetch from 'node-fetch';
import dayjs from 'dayjs';
import cheerio from 'cheerio';
import logger from './logger';

const QUERY_STRING = 'body.page-depots .body-content > .container #manifests .table tbody tr';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138';

async function getDepotUpdateDate(depot: number): Promise<dayjs.Dayjs> {
  const response = await fetch(`https://steamdb.info/depot/${depot}/manifests/`, {
    headers: {
      'User-Agent': UA,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get depot history: HTTP code ' + response.status);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const dateString = $(QUERY_STRING).first().find('.timeago').attr('title');

  logger.debug(`Depot ${depot} was last updated on ${dateString}`);

  return dayjs(dateString);
}

export default {
  getDepotUpdateDate,
};
