/* eslint-disable */
import { v4 as uuidv4 } from 'uuid'; // for generating UUIDs
import { ObjectId } from 'mongodb';
import fs from 'fs';
import mime from 'mime-types'; // For detecting file types
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    const { name, type, isPublic = false, parentId = 0, data } = req.body;

    // Step 1: Check for token and get the user
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Step 2: Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    const validTypes = ['folder', 'file', 'image'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Step 3: Check parentId if provided
    let parentFile = null;
    if (parentId !== 0) {
      parentFile = await dbClient.db
        .collection('files')
        .findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    // Step 4: File creation logic
    const newFile = {
      userId: ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? '0' : ObjectId(parentId),
    };

    if (type === 'folder') {
      // Step 5: Insert folder into DB
      const result = await dbClient.db.collection('files').insertOne(newFile);
      return res.status(201).json({
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
      });
    }

    // Step 6: File or image handling
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const fileUUID = uuidv4();
    const localPath = path.join(folderPath, fileUUID);

    try {
      const decodedData = Buffer.from(data, 'base64');
      fs.writeFileSync(localPath, decodedData);
    } catch (error) {
      return res.status(500).json({ error: 'Error saving the file' });
    }

    // Add local path to the file metadata
    newFile.localPath = localPath;
    const result = await dbClient.db.collection('files').insertOne(newFile);

    return res.status(201).json({
      id: result.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
      localPath,
    });
  }
  static async getShow(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const fileId = req.params.id;

    try {
      const file = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId),
        userId: ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
        localPath: file.localPath,
      });
    } catch (error) {
      return res.status(404).json({ error: 'Not found' });
    }
  }
  static async getIndex(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const parentId = req.query.parentId || '0';
    const page = req.query.page ? parseInt(req.query.page, 10) : 0; // default page = 0
    const pageSize = 20;

    try {
      const files = await dbClient.db
        .collection('files')
        .aggregate([
          { $match: { userId: ObjectId(userId), parentId } },
          { $skip: page * pageSize },
          { $limit: pageSize },
        ])
        .toArray();

      return res.status(200).json(
        files.map((file) => ({
          id: file._id,
          userId: file.userId,
          name: file.name,
          type: file.type,
          isPublic: file.isPublic,
          parentId: file.parentId,
          localPath: file.localPath,
        }))
      );
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
  static async putPublish(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const fileId = req.params.id;

    try {
      const file = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId),
        userId: ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      await dbClient.db
        .collection('files')
        .updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: true } });

      const updatedFile = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId),
      });

      return res.status(200).json({
        id: updatedFile._id,
        userId: updatedFile.userId,
        name: updatedFile.name,
        type: updatedFile.type,
        isPublic: updatedFile.isPublic,
        parentId: updatedFile.parentId,
        localPath: updatedFile.localPath,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  static async putUnpublish(req, res) {
    const token = req.header('X-Token');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const fileId = req.params.id;

    try {
      const file = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId),
        userId: ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      await dbClient.db
        .collection('files')
        .updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: false } });

      const updatedFile = await dbClient.db.collection('files').findOne({
        _id: ObjectId(fileId),
      });

      return res.status(200).json({
        id: updatedFile._id,
        userId: updatedFile.userId,
        name: updatedFile.name,
        type: updatedFile.type,
        isPublic: updatedFile.isPublic,
        parentId: updatedFile.parentId,
        localPath: updatedFile.localPath,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
  // Steps to handle the retrieval of file content, including checking for
  // file existence, ownership, and public access, as well as returning
  // the correct MIME type.
  static async getFile(req, res) {
    const { id } = req.params;
    const token = req.header('X-Token') || null;
    let userId = null;

    if (token) {
      userId = await redisClient.get(`auth_${token}`);
    }

    try {
      // Step 1: Find the file by ID
      const file = await dbClient.db.collection('files').findOne({
        _id: ObjectId(id),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Step 2: Check if the file is a folder
      if (file.type === 'folder') {
        return res.status(400).json({ error: "A folder doesn't have content" });
      }

      // Step 3: Check if the file is public or belongs to the user
      if (!file.isPublic && (!userId || file.userId.toString() !== userId)) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Step 4: Check if the file exists locally
      if (!file.localPath || !fs.existsSync(file.localPath)) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Step 5: Determine MIME type and return file content
      const mimeType = mime.lookup(file.name);
      res.setHeader('Content-Type', mimeType);

      // Read and send the file content
      const fileContent = fs.readFileSync(file.localPath);
      return res.status(200).send(fileContent);
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
}

export default FilesController;
