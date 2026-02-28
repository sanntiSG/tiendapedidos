const multer = require('multer');
const path = require('path');
const os = require('os');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, os.tmpdir()); // Directorio temporal del OS
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imagenes (jpeg, jpg, png, webp)'));
    }
});

module.exports = { upload };
