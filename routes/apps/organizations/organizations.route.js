const express = require("express");

const Operations = require("./organizations.operation");

const router = express.Router();

router.get("/", Operations.list);

module.exports = router;