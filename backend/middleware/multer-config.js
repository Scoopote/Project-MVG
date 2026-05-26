const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('image');

// Dossier de sortie
const outputDir = path.join(__dirname, '..', 'images');

module.exports = (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return next();

    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const baseName = req.file.originalname
        .toLowerCase()
        .replace(/\s+/g, '_')
        .split('.')[0];

      const fileName = `${baseName}_${Date.now()}.webp`;
      const outputPath = path.join(outputDir, fileName);

      await sharp(req.file.buffer)
        .resize(parseInt(800))
        .webp({ quality: parseInt(80) })
        .toFile(outputPath);

      req.file.filename = fileName;

      next();
    } catch (error) {
      next(error);
    }
  });
};