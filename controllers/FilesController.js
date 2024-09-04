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
}

module.exports = FilesController;
