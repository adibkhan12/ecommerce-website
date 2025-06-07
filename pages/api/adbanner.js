import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { AdBanner } from "@/models/AdBanner";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === "GET") {
    // Public: return all banners, sorted by order then createdAt
    const banners = await AdBanner.find().sort({ order: 1, createdAt: 1 });
    return res.status(200).json(banners);
  }

  // Admin only for POST, PUT, DELETE
  await isAdminRequest(req, res);

  if (req.method === "POST") {
    const { title, desc, image, button, link, bg, order } = req.body;
    if (!title || !image) {
      return res.status(400).json({ error: "Title and image are required" });
    }
    const banner = await AdBanner.create({ title, desc, image, button, link, bg, order });
    return res.status(201).json(banner);
  }

  if (req.method === "PUT") {
    const { _id, ...update } = req.body;
    if (!_id) return res.status(400).json({ error: "Missing _id" });
    const banner = await AdBanner.findByIdAndUpdate(_id, update, { new: true });
    return res.status(200).json(banner);
  }

  if (req.method === "DELETE") {
    const { _id } = req.body;
    if (!_id) return res.status(400).json({ error: "Missing _id" });
    await AdBanner.findByIdAndDelete(_id);
    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
