const express = require("express");
const app = express();

const Operations = require("./admin-user-requests.operation");

const router = express.Router();

router.get("/", Operations.list);
router.put("/:id", Operations.update);

module.exports = router;