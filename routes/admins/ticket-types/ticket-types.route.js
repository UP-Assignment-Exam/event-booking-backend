const express = require("express");

const Operations = require("./ticket-types.operation");

const router = express.Router();

router.post("/", Operations.create);
router.get("/", Operations.list);
router.put("/:id", Operations.update);
router.delete("/:id", Operations.destory);

module.exports = router;