import mongoose from "mongoose";

const addressSchema = mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please enter name"],
      maxLength: [30, "Name can not exceed 30 characters"],
      minLength: [4, "Name should have 4 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "Please enter valid email Id"],
    },
    phoneNumber: {
        type: String,
        required: [true, "Phone Number is required"]
    },
    companyName: {
      type: String,
    },
    isBusiness: {
      type: Boolean,
      default: false,
    },

    address: {
      type: string,
    },
    address2: {
      type: string,
    },
    city: {
      type: string,
    },
    zip: {
      type: string,
    },
    province: {
      type: string,
    },
    country: {
      type: string,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);
export default Address