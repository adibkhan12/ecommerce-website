import {QuickLinks} from "@/models/QuickLinks";

export default async function handler(req, res) {
  

  if (req.method === 'GET') {
    try {
      // Retrieve the QuickLinks document; if it doesn't exist, create one with defaults.
      let links = await QuickLinks.findOne({});
      if (!links) {
        links = await QuickLinks.create({});
      }
      res.status(200).json(links);
    } catch (error) {
      console.error('Error fetching quicklinks:', error);
      res.status(500).json({ error: 'Failed to load quicklinks' });
    }
  } else if (req.method === 'PUT') {
    try {
      // Update the quicklinks document with the new data provided in req.body.
      // Consider adding authentication safeguards here.
      const updatedLinks = await QuickLinks.findOneAndUpdate({}, req.body, {
        new: true,
        upsert: true // Creates the document if not already present
      });
      res.status(200).json(updatedLinks);
    } catch (error) {
      console.error('Error updating quicklinks:', error);
      res.status(500).json({ error: 'Unable to update quicklinks' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
