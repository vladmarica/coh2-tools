import { program } from 'commander';
import mkdirp from 'mkdirp';
import path from 'path';
import fs from 'fs';
import { DataExtractorFunc } from './tools/base-data-extractor';
import VeterancyDownloader from './tools/veterancy-downloader';
import LocalizationDownloader from './tools/localization-downloader';
import AttributesDownloader from './tools/attributes-downloader';
import logger from './util/logger';

enum DataTypes {
  Localization = 'localization',
  Veterancy = 'veterancy',
  Attributes = 'attributes',
}

async function main() {
  try {
    const validTypesString = Object.values(DataTypes).map((t) => `'${t}'`).join(', ');

    program.exitOverride();
    program.requiredOption('--output-dir <path>', 'The output folder');
    program.requiredOption('--type <datatype>', `Type of data to download. Valid types are ${validTypesString}`);
    program.parse();

    let extractor: DataExtractorFunc;
    switch (program.type) {
      case DataTypes.Veterancy: {
        extractor = VeterancyDownloader;
        break;
      }
      case DataTypes.Localization: {
        extractor = LocalizationDownloader;
        break;
      }
      case DataTypes.Attributes: {
        extractor = AttributesDownloader;
        break;
      }
      default: {
        throw new Error(`Unknown data type: '${program.type}'. Valid types are ${validTypesString}`);
      }
    }

    const outputDir = path.join(program.outputDir, program.type);
    await mkdirp(outputDir);

    const result = await extractor({ outputPath: outputDir });
    if (result.completed) {
      // Create 'latest' symlink
      const symlinkPath = path.join(outputDir, 'latest');
      const symlinkTargetPath = path.relative(outputDir, result.finalOutputPath);
      if (fs.existsSync(symlinkPath)) {
        fs.unlinkSync(symlinkPath);
      }
      fs.symlinkSync(symlinkTargetPath, symlinkPath, 'dir');


      logger.info(`Successfully finished extracting: ${program.type}`);
    } else {
      logger.error(`Extracting '${program.type}' did not complete successfully`);
    }
  } catch (err) {
    let msg = err;
    if (err instanceof Error) {
      msg = err.message;
    }
    logger.error(msg);
  }
}

main();
