const express = require("express");
const app = express();

const Operations = require("./organizations.operation");

const router = express.Router();

router.get("/static", Operations.getStatic);
router.get("/", Operations.list);
router.put("/:id", Operations.update);

module.exports = router;