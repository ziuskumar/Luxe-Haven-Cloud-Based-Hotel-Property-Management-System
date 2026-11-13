/**
 * Seeder script for Luxe Haven Hotel PMS
 * Populates RBAC users, rooms, bookings, and sequential invoices.
 */

const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../Models/user.js");
const Room = require("../Models/room.js");
const Booking = require("../Models/booking.js");
const Invoice = require("../Models/invoice.js");
const Notification = require("../Models/notification.js");
const AuditLog = require("../Models/auditLog.js");

const DEFAULT_LOCAL_DB_URL =
  "mongodb+srv://luckykv17_db_user:HETcndVJlRbg38xS@clusterlx.zfgujix.mongodb.net/THEAIR?retryWrites=true&w=majority&appName=Cluster0";

let dburl = process.env.MONGO_URL || process.env.ATLAS_URI || DEFAULT_LOCAL_DB_URL;

async function seed() {
  console.log("Connecting to database for seeding...");
  await mongoose.connect(dburl);
  console.log("Connected to MongoDB Atlas!");

  // Clear existing PMS collections
  await User.deleteMany({});
  await Room.deleteMany({});
  await Booking.deleteMany({});
  await Invoice.deleteMany({});
  await Notification.deleteMany({});
  await AuditLog.deleteMany({});
  console.log("Cleared existing collections.");

  // 1. Create RBAC Users
  console.log("Creating default users with 4 roles...");
  const adminUser = await User.create({
    name: "Alexander Vance",
    username: "admin",
    email: "admin@luxehaven.com",
    password: "Password@123",
    role: "admin",
    phone: "+1 (555) 019-2834",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  });

  const managerUser = await User.create({
    name: "Elena Rostova",
    username: "manager",
    email: "manager@luxehaven.com",
    password: "Password@123",
    role: "hotel_manager",
    phone: "+1 (555) 018-7712",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
  });

  const receptionistUser = await User.create({
    name: "Marcus Chen",
    username: "reception",
    email: "reception@luxehaven.com",
    password: "Password@123",
    role: "receptionist",
    phone: "+1 (555) 014-9921",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
  });

  const guestUser = await User.create({
    name: "Sophia Montgomery",
    username: "guest",
    email: "guest@luxehaven.com",
    password: "Password@123",
    role: "customer",
    phone: "+1 (555) 012-3456",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
  });

  console.log("Users created successfully!");

  // 2. Create Rooms
  console.log("Creating rooms inventory...");
  const roomData = [
    {
      roomNumber: "101",
      title: "Cozy Garden Standard Room",
      description: "Quiet garden view room with plush queen-size bedding, ergonomic workspace, and high-speed fiber internet.",
      category: "Standard",
      floor: 1,
      bedType: "Queen",
      maxOccupancy: { adults: 2, children: 1 },
      basePrice: 120,
      dynamicPricing: { weekendMultiplier: 1.15, seasonalMultiplier: 1.0, surgeThreshold: 0.8, surgeMultiplier: 1.2 },
      amenities: ["High-speed WiFi", "Air Conditioning", "HD Smart TV", "Mini Fridge", "En-suite Bathroom"],
      images: [
        { url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=80", filename: "r101" },
      ],
      housekeepingStatus: "clean",
      status: "available",
    },
    {
      roomNumber: "102",
      title: "Serenity Standard Twin",
      description: "Comfortable twin-bed configuration ideal for business travelers or friends visiting the coast.",
      category: "Standard",
      floor: 1,
      bedType: "Twin",
      maxOccupancy: { adults: 2, children: 0 },
      basePrice: 130,
      dynamicPricing: { weekendMultiplier: 1.15, seasonalMultiplier: 1.0, surgeThreshold: 0.8, surgeMultiplier: 1.2 },
      amenities: ["High-speed WiFi", "Air Conditioning", "HD Smart TV", "Coffee Maker", "Safe"],
      images: [
        { url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80", filename: "r102" },
      ],
      housekeepingStatus: "clean",
      status: "available",
    },
    {
      roomNumber: "201",
      title: "Azure Coast Deluxe King",
      description: "Spacious deluxe room featuring a private balcony overlooking the marina, marble rainfall shower, and espresso bar.",
      category: "Deluxe",
      floor: 2,
      bedType: "King",
      maxOccupancy: { adults: 2, children: 1 },
      basePrice: 220,
      dynamicPricing: { weekendMultiplier: 1.2, seasonalMultiplier: 1.1, surgeThreshold: 0.8, surgeMultiplier: 1.25 },
      amenities: ["Ocean View Balcony", "King Size Bed", "Marble Shower", "Nespresso Machine", "Smart Home Automation"],
      images: [
        { url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80", filename: "r201" },
      ],
      housekeepingStatus: "inspected",
      status: "occupied",
    },
    {
      roomNumber: "202",
      title: "Sunset Deluxe King",
      description: "West-facing room with panoramic golden hour views, luxury linens, and premium organic bath amenities.",
      category: "Deluxe",
      floor: 2,
      bedType: "King",
      maxOccupancy: { adults: 2, children: 1 },
      basePrice: 240,
      dynamicPricing: { weekendMultiplier: 1.2, seasonalMultiplier: 1.1, surgeThreshold: 0.8, surgeMultiplier: 1.25 },
      amenities: ["Sunset View", "King Bed", "Minibar", "Deep Soaking Tub", "Complimentary Breakfast"],
      images: [
        { url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80", filename: "r202" },
      ],
      housekeepingStatus: "clean",
      status: "available",
    },
    {
      roomNumber: "301",
      title: "Panorama Executive Suite",
      description: "Expansive high-floor suite with separate living parlor, dining lounge, and 270-degree skyline vistas.",
      category: "Executive Suite",
      floor: 3,
      bedType: "King",
      maxOccupancy: { adults: 3, children: 2 },
      basePrice: 450,
      dynamicPricing: { weekendMultiplier: 1.25, seasonalMultiplier: 1.15, surgeThreshold: 0.75, surgeMultiplier: 1.3 },
      amenities: ["Separate Living Area", "Skyline Views", "Executive Club Lounge Access", "Butler Service", "Walk-in Closet"],
      images: [
        { url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80", filename: "r301" },
      ],
      housekeepingStatus: "clean",
      status: "reserved",
    },
    {
      roomNumber: "401",
      title: "The Grand Royal Presidential Suite",
      description: "The pinnacle of luxury. Features a private terrace jacuzzi, grand piano, private chef kitchen, and 24/7 dedicated butler.",
      category: "Presidential Suite",
      floor: 4,
      bedType: "King",
      maxOccupancy: { adults: 4, children: 2 },
      basePrice: 850,
      dynamicPricing: { weekendMultiplier: 1.3, seasonalMultiplier: 1.2, surgeThreshold: 0.7, surgeMultiplier: 1.35 },
      amenities: ["Rooftop Jacuzzi", "Dedicated Butler", "Grand Piano", "Private Bar", "Limousine Airport Transfer"],
      images: [
        { url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80", filename: "r401" },
      ],
      housekeepingStatus: "inspected",
      status: "available",
    },
    {
      roomNumber: "V-1",
      title: "Secluded Oceanfront Pool Villa",
      description: "Private freestanding luxury villa with infinity edge saltwater pool, direct beach access, and outdoor tropical shower.",
      category: "Ocean Villa",
      floor: 1,
      bedType: "King",
      maxOccupancy: { adults: 4, children: 2 },
      basePrice: 1200,
      dynamicPricing: { weekendMultiplier: 1.3, seasonalMultiplier: 1.25, surgeThreshold: 0.7, surgeMultiplier: 1.4 },
      amenities: ["Private Infinity Pool", "Direct Beach Access", "Outdoor Shower", "Cabana Lounge", "Private Chef on Request"],
      images: [
        { url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80", filename: "rv1" },
      ],
      housekeepingStatus: "clean",
      status: "available",
    },
  ];

  const createdRooms = await Room.insertMany(roomData);
  console.log(`Created ${createdRooms.length} rooms.`);

  // 3. Create Bookings & Invoices
  console.log("Generating initial reservations and invoices...");

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 4);

  // Active checked-in booking for Room 201
  const room201 = createdRooms.find((r) => r.roomNumber === "201");
  const booking1 = await Booking.create({
    bookingNumber: "BK-2026-0001",
    room: room201._id,
    guest: guestUser._id,
    guestDetails: {
      name: "Sophia Montgomery",
      email: "guest@luxehaven.com",
      phone: "+1 (555) 012-3456",
      specialRequests: "High floor, late check-out requested",
    },
    checkInDate: yesterday,
    checkOutDate: tomorrow,
    nights: 2,
    numberOfGuests: { adults: 2, children: 0 },
    status: "checked_in",
    checkInTime: yesterday,
    roomKeyIssued: true,
    roomKeyNumber: "KEY-201-A",
    pricing: {
      baseRatePerNight: 220,
      nights: 2,
      subtotal: 440,
      dynamicAdjustment: 35,
      taxRate: 18,
      cgst: 42.75,
      sgst: 42.75,
      taxAmount: 85.5,
      discountAmount: 0,
      discountCode: "",
      extraServicesTotal: 50,
      totalAmount: 610.5,
    },
    extraServices: [
      { name: "Airport Limousine Pickup", cost: 50, date: yesterday },
    ],
    paymentStatus: "paid",
    paymentMethod: "card",
    paidAmount: 610.5,
    transactionId: "TXN-LUXE-98231",
  });

  await Invoice.create({
    invoiceNumber: "INV-2026-0001",
    booking: booking1._id,
    guest: guestUser._id,
    room: room201._id,
    guestName: "Sophia Montgomery",
    guestEmail: "guest@luxehaven.com",
    guestPhone: "+1 (555) 012-3456",
    issueDate: yesterday,
    dueDate: yesterday,
    lineItems: [
      { description: "Room Stay: Azure Coast Deluxe King (Room 201)", quantity: 2, unitPrice: 220, total: 440 },
      { description: "Dynamic Pricing Adjustment (Weekend)", quantity: 1, unitPrice: 35, total: 35 },
      { description: "Extra Service: Airport Limousine Pickup", quantity: 1, unitPrice: 50, total: 50 },
    ],
    subtotal: 525,
    cgst: 42.75,
    sgst: 42.75,
    totalTax: 85.5,
    discount: 0,
    grandTotal: 610.5,
    paidAmount: 610.5,
    balanceDue: 0,
    paymentStatus: "paid",
    paymentMethod: "card",
  });

  // Upcoming confirmed booking for Room 301
  const room301 = createdRooms.find((r) => r.roomNumber === "301");
  const booking2 = await Booking.create({
    bookingNumber: "BK-2026-0002",
    room: room301._id,
    guest: guestUser._id,
    guestDetails: {
      name: "Sophia Montgomery",
      email: "guest@luxehaven.com",
      phone: "+1 (555) 012-3456",
      specialRequests: "Anniversary champagne in room",
    },
    checkInDate: today,
    checkOutDate: nextWeek,
    nights: 4,
    numberOfGuests: { adults: 2, children: 1 },
    status: "confirmed",
    pricing: {
      baseRatePerNight: 450,
      nights: 4,
      subtotal: 1800,
      dynamicAdjustment: 120,
      taxRate: 18,
      cgst: 172.8,
      sgst: 172.8,
      taxAmount: 345.6,
      discountAmount: 192,
      discountCode: "LUXE10",
      extraServicesTotal: 0,
      totalAmount: 2073.6,
    },
    paymentStatus: "paid",
    paymentMethod: "online",
    paidAmount: 2073.6,
    transactionId: "TXN-LUXE-98232",
  });

  await Invoice.create({
    invoiceNumber: "INV-2026-0002",
    booking: booking2._id,
    guest: guestUser._id,
    room: room301._id,
    guestName: "Sophia Montgomery",
    guestEmail: "guest@luxehaven.com",
    guestPhone: "+1 (555) 012-3456",
    issueDate: today,
    dueDate: today,
    lineItems: [
      { description: "Room Stay: Panorama Executive Suite (Room 301)", quantity: 4, unitPrice: 450, total: 1800 },
      { description: "Dynamic Weekend Adjustment", quantity: 1, unitPrice: 120, total: 120 },
    ],
    subtotal: 1920,
    cgst: 172.8,
    sgst: 172.8,
    totalTax: 345.6,
    discount: 192,
    grandTotal: 2073.6,
    paidAmount: 2073.6,
    balanceDue: 0,
    paymentStatus: "paid",
    paymentMethod: "online",
  });

  // 4. Create Notifications
  await Notification.create({
    targetRoles: ["admin", "hotel_manager", "receptionist"],
    type: "booking_created",
    title: "New VIP Reservation BK-2026-0002",
    message: "Sophia Montgomery reserved Room 301 (Panorama Executive Suite) for 4 nights.",
    data: { bookingId: booking2._id },
  });

  await Notification.create({
    targetRoles: ["admin", "receptionist"],
    type: "check_in",
    title: "Guest Checked In: Room 201",
    message: "Sophia Montgomery checked in to Room 201. Key #KEY-201-A issued.",
    data: { bookingId: booking1._id },
  });

  // 5. Create Audit Logs
  await AuditLog.create({
    user: receptionistUser._id,
    userName: "Marcus Chen",
    userRole: "receptionist",
    action: "GUEST_CHECKED_IN",
    entityType: "Booking",
    entityId: booking1._id.toString(),
    details: { bookingNumber: "BK-2026-0001", roomNumber: "201", key: "KEY-201-A" },
  });

  console.log("Database seeded successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
