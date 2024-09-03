const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { ObjectId } = require('mongodb');
const { mkdirSync, writeFileSync } = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

class FilesController {
  /**
   * Upload a new file or folder
   */
  static async postUpload(req, res) {
    // Retrieve user token from header
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get userId from Redis using the token
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Extract parameters from request body
    const { name, type, parentId = '0', isPublic = false, data } = req.body;

    // Validate required fields
    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Validate parentId if provided
    if (parentId !== '0') {
      try {
        const parentFile = await dbClient.db.collection('files').findOne({
          _id: new ObjectId(parentId),
        });

        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      } catch (error) {
        console.error('Error validating parentId:', error);
        return res.status(400).json({ error: 'Invalid parentId' });
      }
    }

    // Prepare the new file or folder document
    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId,
      createdAt: new Date(),
    };

    // If type is 'folder', save the folder in the database
    if (type === 'folder') {
      try {
        const result = await dbClient.db.collection('files').insertOne(newFile);
        newFile.id = result.insertedId;
        return res.status(201).json(newFile);
      } catch (error) {
        console.error('Error creating folder:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      // Handle 'file' or 'image' type
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      mkdirSync(folderPath, { recursive: true }); // Create the directory if it does not exist

      // Create a unique file path
      const localPath = path.join(folderPath, uuidv4());

      try {
        // Decode base64 data and save the file
        const fileData = Buffer.from(data, 'base64');
        writeFileSync(localPath, fileData);

        newFile.localPath = localPath;
        const result = await dbClient.db.collection('files').insertOne(newFile);
        newFile.id = result.insertedId;

        return res.status(201).json(newFile);
      } catch (error) {
        console.error('Error saving file:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }

  /**
   * Get a specific file by ID
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

    const fileId = req.params.id;

    try {
      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId,
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json(file);
    } catch (error) {
      console.error('Error fetching file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Get all files for a user with optional parentId and pagination
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

    const parentId = req.query.parentId || '0'; // Default to root if not provided
    const page = parseInt(req.query.page, 10) || 0; // Default to page 0 if not provided

    try {
      const skip = page * 20; // Calculate documents to skip for pagination

      const files = await dbClient.db.collection('files').aggregate([
        { $match: { userId, parentId } }, // Filter files by user and parentId
        { $skip: skip }, // Skip documents for pagination
        { $limit: 20 }, // Limit documents to 20 per page
      ]).toArray();

      return res.status(200).json(files);
    } catch (error) {
      console.error('Error fetching files:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
