import { Inject, Injectable } from "injection-js";
import * as AWS from "aws-sdk";
import { AccessKeyId, SecretAccessKey, Region } from "./models/AWSSecretsConfig";
import { Stream } from "stream";
import { ManagedUpload } from "aws-sdk/clients/s3";

@Injectable()
export class AWSS3Service {
  protected readonly s3: AWS.S3;
  constructor(
    @Inject(Region) protected readonly region: string,
    @Inject(AccessKeyId) protected readonly accessKeyId: string,
    @Inject(SecretAccessKey) protected readonly secretAccessKey: string,
  ) {
    this.s3 = new AWS.S3({
      region: this.region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  public async put(Bucket: string, Key: string, Body: string | Buffer | Stream) {
    return new Promise((resolve, reject) => {
      const uploadParams = {
        Bucket,
        Key,
        Body, 
      };

      this.s3.upload(uploadParams, (err: Error, data: ManagedUpload.SendData) => {
        if (err) {
          reject(err);
        }

        resolve(data);
      })

    })      
  }
}