import winston, { createLogger, format } from 'winston';
import TransportStream from 'winston-transport';

const transports: TransportStream[] = [
  new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.printf((info) => {
        const { message, level, timestamp, ...rest } = info;
        return `${timestamp} [${level}] ${message} ${
          Object.keys(rest).length > 0 ? JSON.stringify(rest) : ''}`;
      }),
    ),
  }),
];

const logger = createLogger({ level: 'debug', transports });
export default logger;
