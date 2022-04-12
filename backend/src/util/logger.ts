import bunyan from "bunyan";
import fs from 'fs';
import moment from "moment";

const logDir = `${process.cwd()}/logs`;
if (!fs.existsSync(logDir)){
    fs.mkdirSync(logDir);
}

const now = new Date();

export const logger = bunyan.createLogger({
    name: 'stakehound-backend',
    streams: [
        {
            level: 'info',
            stream: process.stdout,
        },
        {
            level: 'debug',
            path: `${logDir}/${moment().format("YYYYMMDD-HHmmSSS")}.log`,
        }
    ]
})