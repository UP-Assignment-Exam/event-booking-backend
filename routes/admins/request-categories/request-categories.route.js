const express = require("express");
const app = express();

const Operations = require("./request-categories.operation");

const router = express.Router();

router.post("/", Operations.create);
router.get("/", Operations.list);
router.put("/:id", Operations.update);

module.exports = router;