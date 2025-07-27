const express = require("express");

const Operations = require("./admin-user-requests.operation");

const router = express.Router();

router.get("/statistics", Operations.getStatic);
router.get("/", Operations.list);
router.put("/:id", Operations.update);

module.exports = router;