const express = require("express");
const app = express();

const Operations = require("./roles.operation");

const router = express.Router();

router.get("/all", Operations.getAll);

router.post("/", Operations.create);
router.get("/", Operations.list);
router.put("/status/:id", Operations.updateStatus);
router.put("/:id", Operations.update);
router.delete("/:id", Operations.destory);

module.exports = router;