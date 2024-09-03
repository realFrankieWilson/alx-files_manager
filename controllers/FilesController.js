const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class FilesController {
  // POST /files
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, type, parentId = '0', isPublic = false, data } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Check if parentId exists and is a folder
    if (parentId !== '0') {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: new ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileData = {
      userId: new ObjectId(userId),
      name,
      type,
      isPublic,
      parentId,
      createdAt: new Date(),
    };

    if (type === 'folder') {
      const result = await dbClient.db.collection('files').insertOne(fileData);
      return res.status(201).json({ id: result.insertedId, ...fileData });
    } else {
      // Handle file/image
      const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const localPath = `${folderPath}/${new ObjectId()}`;

      const buffer = Buffer.from(data, 'base64');
      await fs.promises.mkdir(folderPath, { recursive: true });
      await fs.promises.writeFile(localPath, buffer);

      fileData.localPath = localPath;

      const result = await dbClient.db.collection('files').insertOne(fileData);
      return res.status(201).json({ id: result.insertedId, ...fileData });
    }
  }

  // GET /files/:id
  static async getShow(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;

    try {
      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(fileId),
        userId: new ObjectId(userId),
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
        createdAt: file.createdAt,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Server error' });
    }
  }

  // GET /files
  static async getIndex(req, res) {
    const token = req.header('X-Token');
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId || '0';
    const page = parseInt(req.query.page, 10) || 0;
    const limit = 20;

    try {
      const files = await dbClient.db.collection('files')
        .aggregate([
          { $match: { userId: new ObjectId(userId), parentId: parentId === '0' ? '0' : new ObjectId(parentId) } },
          { $skip: page * limit },
          { $limit: limit },
        ])
        .toArray();

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
}

module.exports = FilesController;
