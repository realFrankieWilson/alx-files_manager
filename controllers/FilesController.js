const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    // Validate user based on token
    const token = req.headers['x-token'];
    const user = await dbClient.getUserByToken(token); // Assuming you have a method to fetch user by token
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input fields
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Check parentId if present
    let parentFile = null;
    if (parentId !== 0) {
      parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }
      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    const fileDoc = {
      userId: ObjectId(user._id),
      name,
      type,
      isPublic,
      parentId: parentId === 0 ? '0' : ObjectId(parentId),
    };

    if (type === 'folder') {
      // Add folder to the database
      const result = await dbClient.db.collection('files').insertOne(fileDoc);
      return res.status(201).json({ id: result.insertedId, ...fileDoc });
    } else {
      // Handle file or image
      const fileName = uuidv4();
      const filePath = `${FOLDER_PATH}/${fileName}`;

      // Create folder if not exists
      if (!fs.existsSync(FOLDER_PATH)) {
        fs.mkdirSync(FOLDER_PATH, { recursive: true });
      }

      // Decode and save the file
      const fileContent = Buffer.from(data, 'base64');
      fs.writeFileSync(filePath, fileContent);

      // Save file in the database
      fileDoc.localPath = filePath;
      const result = await dbClient.db.collection('files').insertOne(fileDoc);
      return res.status(201).json({ id: result.insertedId, ...fileDoc });
    }
  }
}

module.exports = FilesController;
