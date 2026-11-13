const Room = require("../Models/room.js");
const { findAvailableRooms } = require("../services/reservationService.js");

module.exports = {
  // Get all rooms or search with date-availability & category filters
  async getRooms(req, res) {
    try {
      const {
        checkInDate,
        checkOutDate,
        category,
        minPrice,
        maxPrice,
        status,
        housekeepingStatus,
        search,
      } = req.query;

      if (checkInDate && checkOutDate) {
        // Date-based availability check
        const availableRooms = await findAvailableRooms({
          checkInDate,
          checkOutDate,
          category,
          minPrice,
          maxPrice,
        });
        return res.json({
          success: true,
          count: availableRooms.length,
          rooms: availableRooms,
        });
      }

      // General query
      const query = { isActive: true };
      if (category && category !== "All") query.category = category;
      if (status) query.status = status;
      if (housekeepingStatus) query.housekeepingStatus = housekeepingStatus;
      if (minPrice || maxPrice) {
        query.basePrice = {};
        if (minPrice) query.basePrice.$gte = Number(minPrice);
        if (maxPrice) query.basePrice.$lte = Number(maxPrice);
      }
      if (search) {
        query.$or = [
          { roomNumber: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      const rooms = await Room.find(query).sort({ roomNumber: 1 });

      res.json({
        success: true,
        count: rooms.length,
        rooms,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Get single room
  async getRoom(req, res) {
    try {
      const room = await Room.findById(req.params.id);
      if (!room) {
        return res.status(404).json({ success: false, message: "Room not found." });
      }
      res.json({ success: true, room });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Create room (Admin, Manager)
  async createRoom(req, res) {
    try {
      const {
        roomNumber,
        title,
        description,
        category,
        floor,
        bedType,
        maxOccupancy,
        basePrice,
        dynamicPricing,
        amenities,
        images,
      } = req.body;

      if (!roomNumber || !title || !category || basePrice === undefined) {
        return res.status(400).json({
          success: false,
          message: "Room number, title, category, and base price are required.",
        });
      }

      const existing = await Room.findOne({ roomNumber: roomNumber.trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Room number ${roomNumber} already exists.`,
        });
      }

      const defaultImages = images && images.length > 0 ? images : [
        {
          url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
          filename: "default-room",
        },
      ];

      const room = await Room.create({
        roomNumber: roomNumber.trim(),
        title,
        description: description || "",
        category,
        floor: Number(floor) || 1,
        bedType: bedType || "King",
        maxOccupancy: maxOccupancy || { adults: 2, children: 1 },
        basePrice: Number(basePrice),
        dynamicPricing: dynamicPricing || {
          weekendMultiplier: 1.15,
          seasonalMultiplier: 1.0,
          surgeThreshold: 0.8,
          surgeMultiplier: 1.2,
        },
        amenities: amenities || ["High-speed WiFi", "Air Conditioning", "Smart TV", "Room Safe"],
        images: defaultImages,
        housekeepingStatus: "clean",
        status: "available",
      });

      res.status(201).json({
        success: true,
        message: "Room created successfully.",
        room,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Update room (Admin, Manager)
  async updateRoom(req, res) {
    try {
      const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!room) {
        return res.status(404).json({ success: false, message: "Room not found." });
      }

      res.json({
        success: true,
        message: "Room updated successfully.",
        room,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Update housekeeping status (Admin, Manager, Receptionist)
  async updateHousekeepingStatus(req, res) {
    try {
      const { housekeepingStatus } = req.body;
      if (!["clean", "dirty", "inspected", "maintenance"].includes(housekeepingStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid housekeeping status. Must be clean, dirty, inspected, or maintenance.",
        });
      }

      const room = await Room.findByIdAndUpdate(
        req.params.id,
        { housekeepingStatus },
        { new: true }
      );

      if (!room) {
        return res.status(404).json({ success: false, message: "Room not found." });
      }

      res.json({
        success: true,
        message: `Housekeeping status updated to '${housekeepingStatus}'.`,
        room,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // Delete / deactivate room (Admin)
  async deleteRoom(req, res) {
    try {
      const room = await Room.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );

      if (!room) {
        return res.status(404).json({ success: false, message: "Room not found." });
      }

      res.json({
        success: true,
        message: "Room marked inactive.",
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
};
