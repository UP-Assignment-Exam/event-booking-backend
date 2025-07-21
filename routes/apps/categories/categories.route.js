const express = require("express");
const app = express();

const Operations = require("./categories.operation");

const router = express.Router();

router.get("/", Operations.list);

module.exports = router;