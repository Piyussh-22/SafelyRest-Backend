import { House } from "../models/house.js";
import cloudinary from "../config/cloudinary.config.js";
import mongoose from "mongoose";

// Get all houses owned by the logged-in host
export const getHostHouses = async (req, res) => {
  try {
    const houses = await House.find({ owner: req.user._id });
    return res.json({ success: true, data: houses });
  } catch (err) {
    console.error("Error fetching host houses:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch houses" });
  }
};

// Add a new house
export const addHouse = async (req, res) => {
  try {
    // Validate uploaded files
    if (!req.files?.length) {
      return res
        .status(400)
        .json({ success: false, message: "At least 1 photo is required" });
    }
    if (req.files.length > 2) {
      return res
        .status(400)
        .json({ success: false, message: "Maximum 2 photos allowed" });
    }

    // Validate required fields
    const { name, price, location, description } = req.body;
    if (!name || !price || !location || !description) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Get uploaded photo paths from multer-storage-cloudinary
    const uploadedPhotos = req.files.map((file) => file.path);

    // Create new house document
    const newHouse = await House.create({
      name,
      price: Number(price),
      location,
      description,
      photos: uploadedPhotos,
      owner: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "House added successfully",
      data: newHouse,
    });
  } catch (err) {
    console.error("Error adding house:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to add house" });
  }
};

// Delete house (owner-only, also removes favourites and Cloudinary images)
export const deleteHouse = async (req, res) => {
  try {
    const { houseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(houseId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid house ID" });
    }

    const house = await House.findOne({ _id: houseId, owner: req.user._id });
    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found or not owned by you",
      });
    }

    // Delete images from Cloudinary
    for (const url of house.photos) {
      try {
        const parts = url.split("/");
        const filename = parts[parts.length - 1].split(".")[0]; // remove extension
        const folder = parts[parts.length - 2]; // e.g., 'houses'
        const public_id = `${folder}/${filename}`;
        await cloudinary.uploader.destroy(public_id);
      } catch (err) {
        console.warn(`Failed to delete Cloudinary image: ${url}`, err.message);
        // Continue with next image
      }
    }

    // Delete house (pre-hook removes favourites)
    await House.findByIdAndDelete(houseId);

    return res.json({
      success: true,
      message:
        "House deleted successfully (removed from favourites and Cloudinary)",
    });
  } catch (err) {
    console.error("Error deleting house:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to delete house" });
  }
};
