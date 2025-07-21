const express = require("express");
const app = express();

const Operations = require("./events.operation");

const router = express.Router();

router.get("/", Operations.list);
router.get("/:id", Operations.getOne);

module.exports = router;