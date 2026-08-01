const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.use(authMiddleware);

router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);
router.post('/', requireAdmin, roomController.createRoom);
router.put('/:id', requireAdmin, roomController.updateRoom);
router.delete('/:id', requireAdmin, roomController.deleteRoom);

module.exports = router;
