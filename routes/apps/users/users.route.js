const express = require("express");
const { upload, uploadFileHandler } = require('.././../../services/upload.service');

const Operations = require("./users.operation");

const router = express.Router();

router.get("/me", Operations.getMe);
router.put("/cover", Operations.updateCover);
router.put("/basic", Operations.updateBasic);
router.put('/change-password', Operations.changePassword);
router.post('/upload', upload.single('file'), uploadFileHandler);


module.exports = router;