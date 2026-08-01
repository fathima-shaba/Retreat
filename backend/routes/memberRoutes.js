const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.use(authMiddleware); // Protect all member routes

router.get('/', memberController.getAllMembers);
router.get('/:id', memberController.getMemberById);
router.post('/', requireAdmin, memberController.createMember);
router.put('/:id', requireAdmin, memberController.updateMember);
router.delete('/:id', requireAdmin, memberController.deleteMember);

module.exports = router;
