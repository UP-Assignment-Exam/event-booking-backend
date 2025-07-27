const express = require("express");

const Operations = require("./payment-methods.operation");

const router = express.Router();

router.get("/statistics", Operations.getStatic);
router.get("/", Operations.list);
router.post("/", Operations.create);
router.put("/status/:id", Operations.updateStatus);
router.put("/:id", Operations.update);
router.delete("/:id", Operations.destory);

module.exports = router;