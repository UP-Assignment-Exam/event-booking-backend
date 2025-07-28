const express = require("express");

const Operations = require("./payment-methods.operation");

const router = express.Router();

router.get("/", Operations.list);

module.exports = router;