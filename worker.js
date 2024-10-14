/* eslint-disable */

import Bull from 'bull';
import imageThumbnail from 'image-thumbnail';
import fs from 'fs';
import { ObjectId } from 'mongodb';
import path from 'path';
import dbClient from './utils/db';

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job, done) => {
  const { fileId, userId } = job.data;

  // Check if fileId and userId exist in the job
  if (!fileId) {
    throw new Error('Missing fileId');
  }
  if (!userId) {
    throw new Error('Missing userId');
  }

  // Find the file in the database
  const fileDocument = await dbClient.db
    .collection('files')
    .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

  if (!fileDocument) {
    throw new Error('File not found');
  }

  const filePath = fileDocument.localPath;
  if (!fs.existsSync(filePath)) {
    throw new Error('File not found');
  }

  try {
    // Generate thumbnails
    const sizes = [500, 250, 100];
    for (const size of sizes) {
      const thumbnail = await imageThumbnail(filePath, { width: size });
      const thumbnailPath = `${filePath}_${size}`;
      fs.writeFileSync(thumbnailPath, thumbnail);
    }
    done();
  } catch (error) {
    done(error);
  }
});
