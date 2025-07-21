const express = require("express");
const app = express();

const Operations = require("./events.operation");

const router = express.Router();

router.post("/", Operations.create);
router.get("/", Operations.list);
router.get("/:id", Operations.getOne);
router.put("/:id", Operations.update);
router.delete("/:id", Operations.destory);

module.exports = router;