import { ReflectiveInjector } from "injection-js";
import * as env from 'env-var';
import { EnvSource } from "util/env-source";
import { AWSS3Service } from "infrastructure/aws-s3-service/AWSS3Service";
import { AWSS3Setup } from "infrastructure/aws-s3-service/AWSS3CLISetup";
import path from "path";
import fs from "fs";

export class StateLogBackup {
  s3: AWSS3Service;

  constructor() {
    const injector = ReflectiveInjector.resolveAndCreate([ 
      { provide: EnvSource, useValue: env },
      AWSS3Setup,
      AWSS3Service,
    ]);

    this.s3 = injector.get(AWSS3Service) as AWSS3Service;
  }

  public async execute(bucket: string) {
    const directories = ['./state_logs', './exports'];

    return new Promise<void>(async (resolve, reject) => {
      for (const dir of directories) {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const fullPath = path.join(dir, file);
  
          const stream = fs.createReadStream(fullPath);
  
          await this.s3.put(bucket, file, stream);
        }
      }
      
      resolve();
    });
  }
}