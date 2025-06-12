import { mongooseConnect } from '../../lib/mongoose';
import Color from '../../models/Color';

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === 'GET') {
    // Fetch all colors
    try {
      const colors = await Color.find({});
      return res.status(200).json(colors);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch colors' });
    }
  }

  if (req.method === 'POST') {
    // Add a new color
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Color name is required' });
    }
    try {
      const color = new Color({ name });
      await color.save();
      return res.status(201).json(color);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to add color' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
