import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";
import {Admin} from "@/models/Admin";
import {mongooseConnect} from "@/lib/mongoose";

export default async function handle(req, res){
    await mongooseConnect();
    await isAdminRequest(req, res);

    if (req.method === 'POST'){
        const {email} = req.body;
        if (await Admin.findOne({email})) {
            res.status(400).json({message:'admin already exists!'});
        }else {
            res.json(await Admin.create({email}));
        }
    }

    if (req.method === 'GET'){
        res.json(await Admin.find() );
    }

    if (req.method === 'DELETE') {
        const {_id} = req.query;
        const adminToDelete = await Admin.findById(_id);

        if (adminToDelete.email === "khanadib418@gmail.com") {
            return res.status(403).json({ message: "Cannot delete the mainAdmin" });
        }

        await Admin.findByIdAndDelete(_id);
        res.json(true);
    }

}