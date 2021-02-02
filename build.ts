"use strict";
var build = require("gatsby/dist/commands/build");
import path from "path";
import fs from "fs";
import json from "./package.json";
import { APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import readdir from "recursive-readdir";
import mime from "mime-types";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    console.log(`EVENT: ${JSON.stringify(event)}`);
    console.log("DIR NAME", __dirname);
    const directoryPath = path.join(__dirname, "./");
    const files = fs.readdirSync(directoryPath);
    console.log("FILES", files);
    console.log(process.env.NODE_PATH);
    // move all files to the tmp folder, only folder with write persmissions
    const tmpPath = path.join(__dirname, "./gatsby");
    const dirPath = `/tmp/`;
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
    const finalDirPath = dirPath + "/gatsby";
    copyFolderRecursiveSync(tmpPath, dirPath);
    process.chdir(finalDirPath);
    const directory = finalDirPath;
    const siteInfo = {
      directory,
      browserslist: [`>0.25%`, `not dead`],
      sitePackageJson: json,
    };
    try {
      await build(siteInfo).catch((err) => {
        throw err;
      });
    } catch (err) {
      if (err.code === "ENOENT") {
        // try again if it fails because of ENOENT the first time
        await build(siteInfo);
      } else {
        throw err;
      }
    }
    await uploadFiles();
    const response: APIGatewayProxyResult = {
      statusCode: 200,
      body: "site published",
    };
    return response;
  } catch (err) {
    console.error(err);
    const response: APIGatewayProxyResult = {
      statusCode: 400,
      body: JSON.stringify(err),
    };
    return response;
  }
};
const getFiles = (uploadFolder: string): string[] => {
  return fs.existsSync(uploadFolder) ? readdir(uploadFolder) : [];
};

const deploy = async (uploadFolder: string): Promise<void> => {
  const s3 = new AWS.S3();
  const filesToUpload = await getFiles(path.resolve(__dirname, uploadFolder));
  await Promise.all(
    filesToUpload.map((file) => {
      const Key = file;
      const contentType = mime.lookup(Key);
      return s3
        .upload({
          Key,
          Bucket: process.env.PUBLIC_SITE_BUCKET,
          Body: fs.readFileSync(file),
          ContentType:
            contentType !== false && contentType !== true
              ? contentType
              : "application/octet-stream",
        })
        .promise();
    })
  );
  return;
};

const uploadFiles = (): Promise<boolean> => {
  const uploadFolder = `/tmp/gatsby/public`;

  return deploy(uploadFolder)
    .then(() => {
      return true;
    })
    .catch((err) => {
      console.error(err.message);
      return false;
    });
};

const copyFileSync = (source, target) => {
  var targetFile = target;
  //if target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
};

const copyFolderRecursiveSync = (source: string, target: string) => {
  var files: string[] = [];
  //check if folder needs to be created or integrated
  var targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }
  //copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach((file) => {
      var curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
};
