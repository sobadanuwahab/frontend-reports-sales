import React, { useState } from "react";
import { useParams } from "react-router-dom";

const EditOutletForm = ({ outlets, onUpdate }) => {
    const { id } = useParams();
    const outlet = outlets.find((o) => o.id === parseInt(id));

    const [formData, setFormData] = useState(
        outlet || {
            kode_outlet: "",
            nama_outlet: "",
            lob: "Cinema",
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(id, formData);
    };

    if (!outlet) {
        return <div>Outlet tidak ditemukan</div>;
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Edit Outlet</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Kode Outlet:</label>
                    <input
                        value={formData.kode_outlet}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                kode_outlet: e.target.value,
                            })
                        }
                    />
                </div>
                <div>
                    <label>Nama Outlet:</label>
                    <input
                        value={formData.nama_outlet}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                nama_outlet: e.target.value,
                            })
                        }
                    />
                </div>
                <div>
                    <label>LOB:</label>
                    <select
                        value={formData.lob}
                        onChange={(e) =>
                            setFormData({ ...formData, lob: e.target.value })
                        }
                    >
                        <option value="Cinema">Cinema</option>
                        <option value="FnB">FnB</option>
                    </select>
                </div>
                <button type="submit">Update Outlet</button>
            </form>
        </div>
    );
};

export default EditOutletForm;
