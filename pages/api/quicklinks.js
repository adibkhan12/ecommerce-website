import { QuickLinks } from "@/models/QuickLinks";
import {mongooseConnect} from "@/lib/mongoose";

export default async function handler(req, res) {
  await mongooseConnect(); // Establish DB connection using mongooseConnect

  if (req.method === 'GET') {
    try {
      let links = await QuickLinks.findOne().lean(); // Use lean() for faster reads
      if (!links) {
        links = await QuickLinks.create({});
      }
      return res.status(200).json(links);
    } catch (error) {
      console.error("Error fetching quicklinks:", error);
      return res.status(500).json({ error: "Failed to load quicklinks" });
    }
  }

  else if (req.method === 'PUT') {
    try {
      const updatedLinks = await QuickLinks.findOneAndUpdate(
          {},
          { $set: req.body },
          { new: true, upsert: true }
      ).lean();
      return res.status(200).json(updatedLinks);
    } catch (error) {
      console.error("Error updating quicklinks:", error);
      return res.status(500).json({ error: "Unable to update quicklinks" });
    }
  }

  else {
    res.setHeader("Allow", ["GET", "PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
