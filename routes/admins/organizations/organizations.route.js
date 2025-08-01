const express = require("express");
const app = express();

const Operations = require("./organizations.operation");

const router = express.Router();

router.get("/all", Operations.getAll);


router.get("/statistics", Operations.getStatic);
router.get("/", Operations.list);
router.put("/:id", Operations.update);

module.exports = router;