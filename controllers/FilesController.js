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
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = '0', isPublic = false, data,
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Validate parentId if set
    if (parentId !== '0') {
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

    // Prepare file data for saving to the database
    const fileData = {
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId: parentId === '0' ? '0' : new ObjectId(parentId),
    };

    // Handle folder type
    if (type === 'folder') {
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
    }

    // Determine the storage path
    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    // Create a local path for the file and write the file to disk
    const localPath = `${folderPath}/${uuidv4()}`;
    fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

    // Update fileData with localPath and save to the database
    fileData.localPath = localPath;
    const result = await dbClient.db.collection('files').insertOne(fileData);
    fileData.id = result.insertedId;

    return res.status(201).json({
      id: fileData.id,
      userId: fileData.userId,
      name: fileData.name,
      type: fileData.type,
      isPublic: fileData.isPublic,
      parentId: fileData.parentId,
      localPath: fileData.localPath,
    });
  }
}

module.exports = FilesController;
