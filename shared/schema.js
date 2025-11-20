import { z } from "zod";

// Try-On Request Schema
export const tryOnRequestSchema = z.object({
  clothing: z.object({
    shirt: z.object({
      type: z.string().min(1, "Shirt type is required"),
      color: z.string().min(1, "Shirt color is required"),
    }).optional(),
    pants: z.object({
      type: z.string().min(1, "Pants type is required"),
      color: z.string().min(1, "Pants color is required"),
    }).optional(),
    shoes: z.object({
      type: z.string().min(1, "Shoes type is required"),
      color: z.string().min(1, "Shoes color is required"),
    }).optional(),
    coat: z.object({
      type: z.string().min(1, "Coat type is required"),
      color: z.string().min(1, "Coat color is required"),
    }).optional(),
    watch: z.object({
      type: z.string().min(1, "Watch type is required"),
      color: z.string().min(1, "Watch color is required"),
    }).optional(),
  }).refine(
    (data) => {
      return Object.keys(data).length > 0 && Object.values(data).some(item => item !== undefined);
    },
    {
      message: "At least one clothing item must be selected",
    }
  ),
});

// Clothing options for the UI
export const clothingOptions = {
  shirt: [
    "T-Shirt",
    "Polo Shirt", 
    "Button-Down Shirt",
    "Dress Shirt",
    "Henley",
    "Tank Top",
  ],
  pants: [
    "Jeans",
    "Chinos",
    "Dress Pants",
    "Cargo Pants",
    "Joggers",
    "Shorts",
  ],
  shoes: [
    "Sneakers",
    "Dress Shoes",
    "Boots",
    "Loafers",
    "Sandals",
    "Running Shoes",
  ],
  coat: [
    "Blazer",
    "Suit Jacket",
    "Bomber Jacket",
    "Denim Jacket",
    "Trench Coat",
    "Windbreaker",
  ],
  watch: [
    "Sport Watch",
    "Dress Watch",
    "Smart Watch",
    "Chronograph",
    "Diver Watch",
    "Minimalist Watch",
  ],
};
