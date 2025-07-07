const express = require("express");
const app = express();

const Operations = require("./promo-codes.operation");

const router = express.Router();

router.post("/generate", Operations.generate);
router.post("/", Operations.create);
router.get("/", Operations.list);
router.put("/:id", Operations.update);
router.delete("/:id", Operations.destory);

module.exports = router;