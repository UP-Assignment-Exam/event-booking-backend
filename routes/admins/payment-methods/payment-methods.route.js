const express = require("express");

const Operations = require("./rights.operation");

const router = express.Router();

router.get("/", Operations.list);

module.exports = router;