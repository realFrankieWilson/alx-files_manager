const { ObjectId } = require('mongodb');
const fs = require('fs'); // Import the 'fs' module
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class FilesController {
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
