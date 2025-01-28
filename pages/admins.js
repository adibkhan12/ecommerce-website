import Layout from "@/components/Layout";
import {useEffect, useState} from "react";
import axios from "axios";
import {withSwal} from "react-sweetalert2";
import Spinner from "@/components/Spinner";
import {prettyDate} from "@/lib/date";
import Swal from "sweetalert2";

function AdminsPage({swal}) {
    const [email, setEmail] = useState("");
    const [adminEmail, setAdminEmail] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    function addAdmin(ev) {
        ev.preventDefault();
        axios.post('/api/admins', {email}).then(res => {
            console.log(res.data);
            swal.fire({
                title: 'Admin Created!',
                icon: "success",
            })
            setEmail('');
            loadAdmins();
        }).catch(err => {
            console.log(err);
            swal.fire({
                title: 'Error!',
                text: err.response.data.message,
                icon: "error",
            })
        });
    }
    function deleteAdmin(_id, email){
        if (email === "khanadib418@gmail.com") {
            swal.fire({
                title: 'Error!',
                text: 'Cannot delete the main Admin',
                icon: 'error',
            });
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: `You want to delete ${email}?`,
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: "#3085d6",
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async result => {
            if (result.isConfirmed) {
                axios.delete('/api/admins/?_id='+_id).then(() => {
                    swal.fire({
                        title: 'Admin Deleted!',
                        icon: "success",
                    });
                    loadAdmins();
                });
            }
        });
    }
    function loadAdmins(){
        setIsLoading(true);
        axios.get('/api/admins').then(res => {
            setAdminEmail(res.data);
            setIsLoading(false);
        })
    }
    useEffect(() => {
        loadAdmins()
    },[])
    return (
        <Layout>
            <h1>Admins</h1>
            <h2>Add New Admin</h2>
            <form onSubmit={addAdmin}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="mb-0"
                        value={email}
                        onChange={ev => setEmail(ev.target.value)}
                        placeholder="Google email"/>
                    <button
                        type="submit"
                        className="btn btn-primary py-1 whitespace-nowrap">
                        Add Admin
                    </button>
                </div>
            </form>
            <h2>Existing Admins</h2>
            <table className="basic">
                <thead>
                <tr>
                    <th className="text-left">
                        Admin Google Email
                    </th>
                    <th></th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {isLoading && (
                    <tr>
                        <td colSpan={2}>
                            <div className="py-4">
                                <Spinner fullWidth={true} />
                            </div>
                        </td>
                    </tr>
                )}
                {adminEmail.length > 0 && adminEmail.map((admin) => (
                    <tr key={admin._id}>
                        <td>
                            {admin.email}
                        </td>
                        <td>
                            {admin.createdAt && prettyDate(admin.createdAt)}
                        </td>
                        <td>
                            <button onClick={() => deleteAdmin(admin._id, admin.email)}
                                    className="btn-delete">Delete</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </Layout>
    )
}

export default withSwal(({swal}) => (
    <AdminsPage swal={swal}/>
));