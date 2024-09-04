const { ObjectId } = require('mongodb');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class FilesController {
  /**
   * Handle file upload (POST /files).
   */
  static async postUpload(req, res) {
    // Step 1: Retrieve the user based on the token
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Step 2: Extract and validate request body fields
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Step 3: Validate parentId if provided
    if (parentId !== 0) {
      try {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      } catch (err) {
        return res.status(400).json({ error: 'Invalid parentId' });
      }
    }

    // Step 4: Prepare the file data object for insertion
    const fileData = {
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? '0' : new ObjectId(parentId),
    };

    // Step 5: Handle creation of folder-type files
    if (type === 'folder') {
      try {
        const result = await dbClient.db.collection('files').insertOne(fileData);
        fileData.id = result.insertedId;
        return res.status(201).json({
          id: fileData.id,
          userId: fileData.userId,
          name: fileData.name,
          type: fileData.type,
          isPublic: fileData.isPublic,
          parentId: fileData.parentId,
        });
      } catch (error) {
        return res.status(500).json({ error: 'Unable to create folder' });
      }
    }

    // Step 6: Handle creation of file or image-type files
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const localPath = `${folderPath}/${uuidv4()}`;
    try {
      // Convert Base64 data to binary and save it to local file system
      fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

      // Add localPath to file data
      fileData.localPath = localPath;

      // Insert the file document into the database
      const result = await dbClient.db.collection('files').insertOne(fileData);
      fileData.id = result.insertedId;

      // Return the response with the created file object
      return res.status(201).json({
        id: fileData.id,
        userId: fileData.userId,
        name: fileData.name,
        type: fileData.type,
        isPublic: fileData.isPublic,
        parentId: fileData.parentId,
        localPath: fileData.localPath,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Unable to save file' });
    }
  }

  /**
   * Retrieve a specific file document based on the ID (GET /files/:id).
   */
  static async getShow(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });

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
      });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  /**
   * Retrieve all user file documents for a specific parentId with pagination (GET /files).
   */
  static async getIndex(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId || '0';
    const page = parseInt(req.query.page, 10) || 0;
    const limit = 20;

    try {
      const query = { userId: new ObjectId(userId) };
      if (parentId !== '0') {
        query.parentId = new ObjectId(parentId);
      } else {
        query.parentId = '0';
      }

      const files = await dbClient.db.collection('files')
        .aggregate([
          { $match: query },
          { $skip: page * limit },
          { $limit: limit },
        ]).toArray();

      const formattedFiles = files.map((file) => ({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      }));

      return res.status(200).json(formattedFiles);
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  static async putPublish(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
  }

    const userId = awiat redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({ _id: new ObjectId(fileId), userId: new ObjectId(userId) });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      await dbClient.db.collection('files').updateOne(
        { _id: new ObjectId(fileId) },
        { $set: { isPublic: true } }
      );

      // Updated file document
      return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: true,
        parentId: file.parentId,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }

    try {
      const fileId = req.params.id;
      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId), userId: new ObjectId(userId)
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      // Update isPublic to false
      await dbClient.db.collection('files').updateOne(
        { _id: new ObjectId(fileId) },
        { $set: { isPublic: false } }
      );

      // Returns Updated file document
      return res.status(200).json({
        id: file._id,
        userId: file.userId,
        name: file.name,
        type: file.type,
        isPublic: false,
        parentId: file.parentId,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }
}

module.exports = FilesController;
