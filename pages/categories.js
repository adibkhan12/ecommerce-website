import Layout from "@/components/Layout";
import {useState} from "react";
import axios from "axios";

export default function Categories(){
    const [name, setName] = useState("");
    async function saveCategory(){
        await axios.post('/api/categories', {name});
        setName("");
    }
    return (
        <Layout>
            <b><h1>Categories</h1></b>
            <label>New Category Name</label>
            <form onSubmit={saveCategory} className="flex gap-1">
                <input
                    className="mb-0"
                    type="text"
                    placeholder={'Category name'}
                    onChange={ev => setName(ev.target.value)}
                    value={name}
                />
                <button type="submit" className="btn-primary py-1">Save</button>
            </form>
        </Layout>
    )
}