import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import { withSwal } from "react-sweetalert2";
import Swal from "sweetalert2";

function Categories(swal) {
    const [editedCategory, setEditedCategory] = useState(null);
    const [name, setName] = useState("");
    const [categories, setCategories] = useState([]);
    const [properties, setProperties] = useState([]);
    useEffect(() => {
        fetchCategories()
    }, [])
    function fetchCategories() {
        axios.get("/api/categories").then((result) => {
            setCategories(result.data);
        });
    }
    async function saveCategory(ev) {
        ev.preventDefault();
        const data = {
            name,
            properties: properties.map(p => ({
                name: p.name,
                values: p.values.split(','),
            }))
        };
        if (editedCategory) {
            data._id = editedCategory._id;
            await axios.put(`/api/categories`, data);
            setEditedCategory(null);
        } else {
            await axios.post('/api/categories', data);
        }
        setName('');
        setProperties([]);
        fetchCategories()
    }
    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setProperties(
            category.properties.map(({ name, values }) => ({
                name,
                values: values.join(',')
            }))
        );
    }
    function deleteCategory(category) {
        Swal.fire({
            title: "Are you sure?",
            text: `You want to delete ${category.name}!`,
            icon: "warning",
            showCancelButton: true,
            cancelButtonColor: "#3085d6",
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then(async result => {
            if (result.isConfirmed) {
                const { _id } = category
                await axios.delete('/api/categories?_id=' + _id)
                await Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success"
                });
                fetchCategories()
            }
        });
    }
    function addProperty() {
        setProperties(prev => {
            return [...prev, { name: '', values: '' }]
        })
    }
    function handlePropertyNameChange(index, property, newName) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].name = newName;
            return properties;
        })
    }
    function handlePropertyValuesChange(index, property, newValues) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].values = newValues;
            return properties;
        })
    }
    function removeProperty(indexToRemove) {
        setProperties(prev => {
            return [...prev].filter((p, pIndex) => {
                return pIndex !== indexToRemove;
            });
        });
    }
    return (
        <Layout>
            <h1 className="text-2xl font-bold mb-6">Categories</h1>
            <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mb-8">
                <label className="block font-semibold mb-2 text-lg">
                    {editedCategory ? `Edit Category: ${editedCategory.name}` : 'Create New Category'}
                </label>
                <form onSubmit={saveCategory} className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <input
                            type="text"
                            placeholder={'Category name'}
                            onChange={ev => setName(ev.target.value)}
                            value={name}
                            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="mb-2">
                        <label className="block font-semibold mb-1">Properties</label>
                        <button
                            type="button"
                            onClick={addProperty}
                            className="btn-default text-sm mb-2"
                        >
                            + Add new property
                        </button>
                        {properties.length > 0 && properties.map(
                            (property, index) => (
                                <div key={index} className="mb-2 flex flex-col md:flex-row gap-2 items-center">
                                    <input
                                        className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/3"
                                        type="text"
                                        value={property.name}
                                        onChange={ev =>
                                            handlePropertyNameChange(
                                                index,
                                                property,
                                                ev.target.value)}
                                        placeholder="Property name (e.g. color)" />
                                    <input
                                        className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2"
                                        type="text"
                                        value={property.values}
                                        onChange={ev =>
                                            handlePropertyValuesChange(
                                                index,
                                                property,
                                                ev.target.value)}
                                        placeholder="Values, comma separated" />
                                    <button
                                        onClick={() => removeProperty(index)}
                                        type="button"
                                        className="btn-delete w-full md:w-auto mt-2 md:mt-0">Remove</button>
                                </div>
                            ))}
                    </div>
                    <div className="flex gap-2">
                        {editedCategory && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditedCategory(null);
                                    setName('');
                                    setProperties([]);
                                }}
                                className="btn-white"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            className="btn-primary py-2 px-6 text-lg"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
            {!editedCategory && (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 border-b text-left">Category Name</th>
                                <th className="px-4 py-2 border-b text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length > 0 && categories.map((category) => (
                                <tr key={category._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border-b">{category.name}</td>
                                    <td className="px-4 py-2 border-b">
                                        <button
                                            onClick={() => editCategory(category)}
                                            className="btn-default mr-2"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteCategory(category)}
                                            className="btn-delete"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Layout>
    )
}

export default withSwal(({ swal }, ref) => {
    return <Categories swal={swal} />
})
