const express = require("express");

const Operations = require("./promocodes.operation");

const router = express.Router();

router.get("/", Operations.searchCode);

module.exports = router;