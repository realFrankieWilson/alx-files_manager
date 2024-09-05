"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var _require = require('mongodb'),
    ObjectId = _require.ObjectId;

var fs = require('fs');

var _require2 = require('uuid'),
    uuidv4 = _require2.v4;

var redisClient = require('../utils/redis');

var dbClient = require('../utils/db');

var FilesController =
/*#__PURE__*/
function () {
  function FilesController() {
    _classCallCheck(this, FilesController);
  }

  _createClass(FilesController, null, [{
    key: "postUpload",

    /**
     * Handle file upload (POST /files).
     */
    value: function postUpload(req, res) {
      var token, userId, _req$body, name, type, _req$body$parentId, parentId, _req$body$isPublic, isPublic, data, parentFile, fileData, result, folderPath, localPath, _result;

      return regeneratorRuntime.async(function postUpload$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              // Step 1: Retrieve the user based on the token
              token = req.header('X-Token');

              if (token) {
                _context.next = 3;
                break;
              }

              return _context.abrupt("return", res.status(401).json({
                error: 'Unauthorized'
              }));

            case 3:
              _context.next = 5;
              return regeneratorRuntime.awrap(redisClient.get("auth_".concat(token)));

            case 5:
              userId = _context.sent;

              if (userId) {
                _context.next = 8;
                break;
              }

              return _context.abrupt("return", res.status(401).json({
                error: 'Unauthorized'
              }));

            case 8:
              // Step 2: Extract and validate request body fields
              _req$body = req.body, name = _req$body.name, type = _req$body.type, _req$body$parentId = _req$body.parentId, parentId = _req$body$parentId === void 0 ? 0 : _req$body$parentId, _req$body$isPublic = _req$body.isPublic, isPublic = _req$body$isPublic === void 0 ? false : _req$body$isPublic, data = _req$body.data;

              if (name) {
                _context.next = 11;
                break;
              }

              return _context.abrupt("return", res.status(400).json({
                error: 'Missing name'
              }));

            case 11:
              if (!(!type || !['folder', 'file', 'image'].includes(type))) {
                _context.next = 13;
                break;
              }

              return _context.abrupt("return", res.status(400).json({
                error: 'Missing type'
              }));

            case 13:
              if (!(type !== 'folder' && !data)) {
                _context.next = 15;
                break;
              }

              return _context.abrupt("return", res.status(400).json({
                error: 'Missing data'
              }));

            case 15:
              if (!(parentId !== 0)) {
                _context.next = 29;
                break;
              }

              _context.prev = 16;
              _context.next = 19;
              return regeneratorRuntime.awrap(dbClient.db.collection('files').findOne({
                _id: new ObjectId(parentId)
              }));

            case 19:
              parentFile = _context.sent;

              if (parentFile) {
                _context.next = 22;
                break;
              }

              return _context.abrupt("return", res.status(400).json({
                error: 'Parent not found'
              }));

            case 22:
              if (!(parentFile.type !== 'folder')) {
                _context.next = 24;
                break;
              }

              return _context.abrupt("return", res.status(400).json({
                error: 'Parent is not a folder'
              }));

            case 24:
              _context.next = 29;
              break;

            case 26:
              _context.prev = 26;
              _context.t0 = _context["catch"](16);
              return _context.abrupt("return", res.status(400).json({
                error: 'Invalid parentId'
              }));

            case 29:
              // Step 4: Prepare the file data object for insertion
              fileData = {
                userId: new ObjectId(userId),
                name: name,
                type: type,
                isPublic: isPublic,
                parentId: parentId === 0 ? '0' : new ObjectId(parentId)
              }; // Step 5: Handle creation of folder-type files

              if (!(type === 'folder')) {
                _context.next = 42;
                break;
              }

              _context.prev = 31;
              _context.next = 34;
              return regeneratorRuntime.awrap(dbClient.db.collection('files').insertOne(fileData));

            case 34:
              result = _context.sent;
              fileData.id = result.insertedId;
              return _context.abrupt("return", res.status(201).json({
                id: fileData.id,
                userId: fileData.userId,
                name: fileData.name,
                type: fileData.type,
                isPublic: fileData.isPublic,
                parentId: fileData.parentId
              }));

            case 39:
              _context.prev = 39;
              _context.t1 = _context["catch"](31);
              return _context.abrupt("return", res.status(500).json({
                error: 'Unable to create folder'
              }));

            case 42:
              // Step 6: Handle creation of file or image-type files
              folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

              if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, {
                  recursive: true
                });
              }

              localPath = "".concat(folderPath, "/").concat(uuidv4());
              _context.prev = 45;
              // Convert Base64 data to binary and save it to local file system
              fs.writeFileSync(localPath, Buffer.from(data, 'base64')); // Add localPath to file data

              fileData.localPath = localPath; // Insert the file document into the database

              _context.next = 50;
              return regeneratorRuntime.awrap(dbClient.db.collection('files').insertOne(fileData));

            case 50:
              _result = _context.sent;
              fileData.id = _result.insertedId; // Return the response with the created file object

              return _context.abrupt("return", res.status(201).json({
                id: fileData.id,
                userId: fileData.userId,
                name: fileData.name,
                type: fileData.type,
                isPublic: fileData.isPublic,
                parentId: fileData.parentId,
                localPath: fileData.localPath
              }));

            case 55:
              _context.prev = 55;
              _context.t2 = _context["catch"](45);
              return _context.abrupt("return", res.status(500).json({
                error: 'Unable to save file'
              }));

            case 58:
            case "end":
              return _context.stop();
          }
        }
      }, null, null, [[16, 26], [31, 39], [45, 55]]);
    }
    /**
     * Retrieve a specific file document based on the ID (GET /files/:id).
     */

  }, {
    key: "getShow",
    value: function getShow(req, res) {
      var token, userId, fileId, file;
      return regeneratorRuntime.async(function getShow$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              token = req.header('X-Token');

              if (token) {
                _context2.next = 3;
                break;
              }

              return _context2.abrupt("return", res.status(401).json({
                error: 'Unauthorized'
              }));

            case 3:
              _context2.next = 5;
              return regeneratorRuntime.awrap(redisClient.get("auth_".concat(token)));

            case 5:
              userId = _context2.sent;

              if (userId) {
                _context2.next = 8;
                break;
              }

              return _context2.abrupt("return", res.status(401).json({
                error: 'Unauthorized'
              }));

            case 8:
              _context2.prev = 8;
              fileId = req.params.id;
              _context2.next = 12;
              return regeneratorRuntime.awrap(dbClient.db.collection('files').findOne({
                _id: new ObjectId(fileId),
                userId: new ObjectId(userId)
              }));

            case 12:
              file = _context2.sent;

              if (file) {
                _context2.next = 15;
                break;
              }

              return _context2.abrupt("return", res.status(404).json({
                error: 'Not found'
              }));

            case 15:
              return _context2.abrupt("return", res.status(200).json({
                id: file._id,
                userId: file.userId,
                name: file.name,
                type: file.type,
                isPublic: file.isPublic,
                parentId: file.parentId
              }));

            case 18:
              _context2.prev = 18;
              _context2.t0 = _context2["catch"](8);
              return _context2.abrupt("return", res.status(500).json({
                error: 'Server error'
              }));

            case 21:
            case "end":
              return _context2.stop();
          }
        }
      }, null, null, [[8, 18]]);
    }
    /**
     * Retrieve all user file documents for a specific parentId with pagination (GET /files).
     */

  }, {
    key: "getIndex",
    value: function getIndex(req, res) {
      var token, userId, parentId, page, limit, query, files, formattedFiles;
      return regeneratorRuntime.async(function getIndex$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              token = req.header('X-Token');

              if (token) {
                _context3.next = 3;
                break;
              }

              return _context3.abrupt("return", res.status(401).json({
                error: 'Unauthorized'
              }));

            case 3:
              _context3.next = 5;
              return regeneratorRuntime.awrap(redisClient.get("auth_".concat(token)));

            case 5:
              userId = _context3.sent;

              if (userId) {
                _context3.next = 8;
                break;
              }

              return _context3.abrupt("return", res.status(401).json({
                error: 'Unauthorized'
              }));

            case 8:
              parentId = req.query.parentId || '0';
              page = parseInt(req.query.page, 10) || 0;
              limit = 20;
              _context3.prev = 11;
              query = {
                userId: new ObjectId(userId)
              };

              if (parentId !== '0') {
                query.parentId = new ObjectId(parentId);
              } else {
                query.parentId = '0';
              }

              _context3.next = 16;
              return regeneratorRuntime.awrap(dbClient.db.collection('files').aggregate([{
                $match: query
              }, {
                $skip: page * limit
              }, {
                $limit: limit
              }]).toArray());

            case 16:
              files = _context3.sent;
              formattedFiles = files.map(function (file) {
                return {
                  id: file._id,
                  userId: file.userId,
                  name: file.name,
                  type: file.type,
                  isPublic: file.isPublic,
                  parentId: file.parentId
                };
              });
              return _context3.abrupt("return", res.status(200).json(formattedFiles));

            case 21:
              _context3.prev = 21;
              _context3.t0 = _context3["catch"](11);
              return _context3.abrupt("return", res.status(500).json({
                error: 'Server error'
              }));

            case 24:
            case "end":
              return _context3.stop();
          }
        }
      }, null, null, [[11, 21]]);
    }
    /* -----------------Edit-------------------*/

    /**
     * Publish a file document based on the ID (PUT /files/:id/publish).
    */

  }, {
    key: "putPublish",
    value: function putPublish(req, res) {
      var token, userId, fileId, file;
      return regeneratorRuntime.async(function putPublish$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              token = req.header('X-Token');

              if (token) {
                _context4.next = 3;
                break;
              }

              return _context4.abrupt("return", res.status(401).json({
                error: 'Unauthorized'
              }));

            case 3:
              _context4.next = 5;
              return regeneratorRuntime.awrap(redisClient.get("auth_".concat(token)));

            case 5:
              userId = _context4.sent;

              if (userId) {
                _context4.next = 8;
                break;
              }

              return _context4.abrupt("return", res.status(401).json({
                error: 'Unauthorized'
              }));

            case 8:
              _context4.prev = 8;
              fileId = req.params.id;
              _context4.next = 12;
              return regeneratorRuntime.awrap(dbClient.db.collection('files').findOne({
                _id: new ObjectId(fileId),
                userId: new ObjectId(userId)
              }));

            case 12:
              file = _context4.sent;

              if (file) {
                _context4.next = 15;
                break;
              }

              return _context4.abrupt("return", res.status(404).json({
                error: 'Not found'
              }));

            case 15:
              _context4.next = 17;
              return regeneratorRuntime.awrap(dbClient.db.collection('files').updateOne({
                _id: new ObjectId(fileId)
              }, {
                $set: {
                  isPublic: true
                }
              }));

            case 17:
              return _context4.abrupt("return", res.status(200).json({
                id: file._id,
                userId: file.userId,
                name: file.name,
                type: file.type,
                isPublic: true,
                parentId: file.parentId
              }));

            case 20:
              _context4.prev = 20;
              _context4.t0 = _context4["catch"](8);
              return _context4.abrupt("return", res.status(500).json({
                error: 'Server error'
              }));

            case 23:
            case "end":
              return _context4.stop();
          }
        }
      }, null, null, [[8, 20]]);
    }
    /**
     * Unpublish a file document based on the ID (PUT /files/:ID/unpublish).
    */

  }, {
    key: "putUnpublish",
    value: function putUnpublish(req, res) {
      var token, userId;
      return regeneratorRuntime.async(function putUnpublish$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              token = req.header('X-Token');

              if (token) {
                _context5.next = 3;
                break;
              }

              return _context5.abrupt("return", res.status(401).json({
                error: 'Unauthorized'
              }));

            case 3:
              _context5.next = 5;
              return regeneratorRuntime.awrap(redisClient.get("auth_".concat(token)));

            case 5:
              userId = _context5.sent;

              if (userId) {
                _context5.next = 8;
                break;
              }

              return _context5.abrupt("return", res.status(401).json({
                error: 'Unauthorized'
              }));

            case 8:
            case "end":
              return _context5.stop();
          }
        }
      });
    }
  }]);

  return FilesController;
}();

module.exports = FilesController;