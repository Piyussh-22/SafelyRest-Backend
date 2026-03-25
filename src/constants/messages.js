export const MSG = {
  // Auth
  SIGNUP_SUCCESS: "Signup successful",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logged out successfully",
  GOOGLE_LOGIN_SUCCESS: "Google login successful",
  EMAIL_TAKEN: "Email is already registered",
  INVALID_CREDENTIALS: "Invalid email or password",
  GOOGLE_TOKEN_MISSING: "idToken missing",
  GOOGLE_TOKEN_INVALID: "Invalid Google token",
  GOOGLE_EMAIL_UNVERIFIED: "Google email not verified",
  GOOGLE_LOGIN_FAILED: "Google login failed",

  // Auth middleware
  TOKEN_MISSING: "Not authorized, token missing",
  TOKEN_INVALID: "Not authorized, token invalid",
  USER_NOT_FOUND_TOKEN: "The user belonging to this token no longer exists",
  FORBIDDEN: "Forbidden: insufficient permissions",

  // Houses
  HOUSE_ADDED: "House added successfully",
  HOUSE_DELETED: "House deleted successfully",
  HOUSE_NOT_FOUND: "House not found",
  HOUSE_NOT_OWNED: "House not found or not owned by you",
  PHOTO_MIN: "At least 1 photo is required",
  PHOTO_MAX: "Maximum 2 photos allowed",
  FIELDS_REQUIRED: "All fields are required",
  INVALID_HOUSE_ID: "Invalid house ID",
  FETCH_HOUSES_FAIL: "Failed to fetch houses",
  FETCH_HOUSE_DETAIL_FAIL: "Failed to fetch house details",
  ADD_HOUSE_FAIL: "Failed to add house",
  DELETE_HOUSE_FAIL: "Failed to delete house",
  HOUSE_NOT_AVAILABLE: "This house is not available for booking",
  HOUSE_ALREADY_BOOKED: "This house is already booked for the selected dates",
  FETCH_ALL_BOOKINGS_FAIL: "Failed to fetch bookings",

  // Favourites
  HOUSE_ID_REQUIRED: "House ID is required",
  ADDED_FAVOURITE: "Added to favourites",
  REMOVED_FAVOURITE: "Removed from favourites",
  ALREADY_FAVOURITE: "House already in favourites",
  FETCH_FAVOURITES_FAIL: "Failed to fetch favourites",
  TOGGLE_FAVOURITE_FAIL: "Failed to toggle favourite",

  // Admin
  FETCH_STATS_FAIL: "Failed to fetch admin stats",

  // Generic
  INTERNAL_ERROR: "Internal Server Error",
  ROUTE_NOT_FOUND: "Route not found",

  // Bookings
  BOOKING_CREATED: "Booking request sent successfully",
  BOOKING_NOT_FOUND: "Booking not found",
  BOOKING_OVERLAP: "You already have a booking for these dates on this house",
  BOOKING_ALREADY_RESOLVED: "This booking has already been resolved",
  BOOKING_CANCELLED: "Booking cancelled successfully",
  BOOKING_UPDATED: "Booking status updated successfully",
  CANNOT_BOOK_OWN_HOUSE: "You cannot book your own house",
  FETCH_BOOKINGS_FAIL: "Failed to fetch bookings",

  //Admin
  HOUSE_DELETED_ADMIN: "House removed by admin successfully",
};
