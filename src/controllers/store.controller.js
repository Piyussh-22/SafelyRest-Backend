import { Favourite } from "../models/favourite.js";
import { House } from "../models/house.js";

// GET: All houses
export const getHouses = async (req, res) => {
  try {
    const houses = await House.find();
    res.json({ success: true, data: houses });
  } catch (err) {
    console.error("Error fetching houses:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch houses" });
  }
};

// GET: House details by ID
export const getHouseDetails = async (req, res) => {
  const { houseId } = req.params;
  try {
    const house = await House.findById(houseId);
    if (!house)
      return res
        .status(404)
        .json({ success: false, message: "House not found" });
    res.json({ success: true, data: house });
  } catch (err) {
    console.error("Error fetching house details:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch house details" });
  }
};

// GET: Favourite houses for logged-in user
export const getFavouriteList = async (req, res) => {
  try {
    const favourites = await Favourite.find({ userId: req.user._id }).populate(
      "houseId"
    );
    const favouriteHouses = favourites.map((fav) => ({
      ...fav.houseId.toObject(),
      isFav: true,
    }));
    res.json({ success: true, data: favouriteHouses });
  } catch (err) {
    console.error("Error fetching favourites:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch favourites" });
  }
};

// POST: Toggle favourite (add/remove)
export const toggleFavourite = async (req, res) => {
  const { houseId } = req.body;
  if (!houseId) {
    return res
      .status(400)
      .json({ success: false, message: "House ID is required" });
  }

  try {
    let message = "";
    const existing = await Favourite.findOne({ houseId, userId: req.user._id });

    if (existing) {
      await Favourite.findOneAndDelete({ houseId, userId: req.user._id });
      //console.log("house remove");
      message = `Removed from favourites house:${houseId}`;
    } else {
      try {
        await Favourite.create({ houseId, userId: req.user._id });
        //console.log("house added");
        message = `Added to favourites house:${houseId}`;
      } catch (err) {
        // If unique index violation → house already favourited
        if (err.code === 11000) {
          message = "House already in favourites";
        } else {
          throw err;
        }
      }
    }

    // Always return the updated favourites list
    const favourites = await Favourite.find({ userId: req.user._id }).populate(
      "houseId"
    );
    const favouriteHouses = favourites.map((fav) => ({
      ...fav.houseId.toObject(),
      isFav: true,
    }));

    res.json({ success: true, message, data: favouriteHouses });
  } catch (err) {
    console.error("Error toggling favourite:", err.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to toggle favourite" });
  }
};
