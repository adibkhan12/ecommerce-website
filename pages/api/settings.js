import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { Setting } from "@/models/Setting";

export default async function handler(req, res) {
    await mongooseConnect();
    await isAdminRequest(req, res);

    if (req.method === "GET") {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ error: "Missing 'name' in the query parameters" });
        }
        const setting = await Setting.findOne({ name });
        if (!setting) {
            return res.status(404).json({ error: "Setting not found" });
        }
        res.status(200).json(setting);
        return;
    }

    if (req.method === "PUT") {
        const { name, value } = req.body;

        if (!name || !value) {
            return res.status(400).json({ error: "Missing 'name' or 'value' in the request body" });
        }

        try {
            let settingDoc = await Setting.findOneAndUpdate(
                { name },
                { value },
                { new: true, upsert: true }
            );

            res.status(200).json({
                name: settingDoc.name,
                value: settingDoc.value,
                _id: settingDoc._id,
            });
        } catch (error) {
            console.error("Error saving settings:", error);
            res.status(500).json({ error: "Failed to save settings" });
        }
        return;
    }

    res.setHeader("Allow", ["GET", "PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
