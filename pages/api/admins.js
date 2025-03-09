// pages/api/admins.js
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import { Admin } from "@/models/Admin";
import { mongooseConnect } from "@/lib/mongoose";

export default async function handle(req, res) {
    await mongooseConnect();
    await isAdminRequest(req, res);

    if (req.method === "POST") {
        let { email } = req.body;
        email = email.toLowerCase(); // Convert to lowercase

        if (await Admin.findOne({ email })) {
            return res.status(400).json({ message: "admin already exists!" });
        }
        const newAdmin = await Admin.create({ email });
        return res.json(newAdmin);
    }

    if (req.method === "GET") {
        const admins = await Admin.find();
        return res.json(admins);
    }

    if (req.method === "DELETE") {
        const { _id } = req.query;
        const adminToDelete = await Admin.findById(_id);

        if (adminToDelete.email === "khanadib418@gmail.com") {
            return res
                .status(403)
                .json({ message: "Cannot delete the mainAdmin" });
        }

        await Admin.findByIdAndDelete(_id);
        return res.json(true);
    }

    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
}
