const express = require("express");

const Operations = require("./users.operations");

const router = express.Router();

router.put("/profile", Operations.updateProfile);
router.put("/profile/change-password", Operations.updatePassword);

router.get("/statistics", Operations.getStatic);
router.get("/", Operations.list);
router.post("/", Operations.create);
router.put("/status/:id", Operations.updateStatus)
router.delete("/:id", Operations.destroy);

module.exports = router;