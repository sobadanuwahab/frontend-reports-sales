import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSave,
    faTimes,
    faUserCircle,
    faIdBadge,
    faPhone,
    faEnvelope,
    faMapMarkerAlt,
    faCalendar,
    faVenusMars,
    faBuilding,
    faStore,
    faGraduationCap,
    faBriefcase,
    faHeart,
    faStar,
    faLanguage,
    faCertificate,
    faFlag,
    faCross,
    faHospital,
    faShieldAlt,
    faCamera,
    faPlus,
    faMinus,
} from "@fortawesome/free-solid-svg-icons";

const KaryawanForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        // Data dasar
        nik: "",
        nama: "",
        email: "",
        telepon: "",
        tanggal_lahir: "",
        tempat_lahir: "",
        jenis_kelamin: "L",
        agama: "",
        status_pernikahan: "",
        golongan_darah: "",

        // Foto profil
        foto_profil: "",

        // Kontak darurat
        kontak_darurat_nama: "",
        kontak_darurat_hubungan: "",
        kontak_darurat_telepon: "",

        // Alamat
        alamat: "",
        provinsi: "",
        kota: "",
        kode_pos: "",

        // Data pendidikan
        pendidikan_terakhir: "",
        nama_sekolah_universitas: "",
        jurusan: "",
        tahun_lulus: "",

        // Data pekerjaan
        department: "Marketing",
        jabatan: "Staff",
        level_jabatan: "",
        tanggal_masuk: new Date().toISOString().split("T")[0],
        tanggal_kontrak_berakhir: "",
        status_karyawan: "Aktif",
        jenis_karyawan: "Tetap",

        // Data identitas dan asuransi
        npwp: "",
        bpjs_kesehatan: "",
        bpjs_ketenagakerjaan: "",

        // Minat & Hobi
        hobi: [],
        minat_khusus: [],
        organisasi: "",

        // Keahlian
        keahlian_teknis: [],
        tingkat_keahlian: {},
        soft_skills: [],
        bahasa_dikuasai: [],
        tingkat_bahasa: {},

        // Sertifikasi & Prestasi
        sertifikasi: [],
        prestasi: [],

        // Aspirasi Karir
        aspirasi_karir: "",
        target_karir_5tahun: "",

        // Outlet
        outlet_id: null,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [previewImage, setPreviewImage] = useState(null);
    const [submitError, setSubmitError] = useState("");

    // State untuk input tags
    const [hobiInput, setHobiInput] = useState("");
    const [minatInput, setMinatInput] = useState("");
    const [keahlianInput, setKeahlianInput] = useState("");
    const [bahasaInput, setBahasaInput] = useState("");
    const [softSkillInput, setSoftSkillInput] = useState("");

    // Data options
    const [departments] = useState([
        "Marketing",
        "Sales",
        "IT",
        "HRD",
        "Finance",
        "Operations",
        "Customer Service",
        "Produksi",
        "Quality Control",
        "Logistik",
        "R&D",
    ]);

    const [jabatans] = useState([
        "Staff",
        "Supervisor",
        "Manager",
        "Senior Manager",
        "Assistant Director",
        "Director",
        "Vice President",
        "President Director",
    ]);

    const [levelJabatans] = useState([
        "Junior",
        "Middle",
        "Senior",
        "Lead",
        "Principal",
    ]);

    const [jenisKaryawans] = useState([
        "Tetap",
        "Kontrak",
        "Freelance",
        "Magang",
    ]);

    const [agamaOptions] = useState([
        "Islam",
        "Kristen",
        "Katolik",
        "Hindu",
        "Buddha",
        "Konghucu",
    ]);

    const [statusPernikahanOptions] = useState([
        "Belum Menikah",
        "Menikah",
        "Cerai",
    ]);

    const [golonganDarahOptions] = useState(["A", "B", "AB", "O"]);

    const [pendidikanOptions] = useState([
        "SD",
        "SMP",
        "SMA/SMK",
        "D1",
        "D2",
        "D3",
        "S1",
        "S2",
        "S3",
    ]);

    const [outlets, setOutlets] = useState([]);
    const [userRole, setUserRole] = useState("");
    const [uniqueOutlets, setUniqueOutlets] = useState([]);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        setUserRole(userData.role || "");

        fetchOutlets();
        if (isEditMode) {
            fetchKaryawanData();
        } else {
            generateNIK();
        }
    }, [id]);

    const fetchOutlets = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8000/api/outlets", {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const outletsData = data.data || [];
                    setOutlets(outletsData);

                    // Filter outlet unik berdasarkan nama
                    const unique = [];
                    const seenNames = new Set();

                    outletsData.forEach((outlet) => {
                        if (!seenNames.has(outlet.nama_outlet)) {
                            seenNames.add(outlet.nama_outlet);
                            unique.push(outlet);
                        }
                    });

                    setUniqueOutlets(unique);

                    const userData = JSON.parse(
                        localStorage.getItem("user") || "{}"
                    );
                    if (
                        userData.role === "manager" &&
                        userData.outlet_id &&
                        !isEditMode
                    ) {
                        setFormData((prev) => ({
                            ...prev,
                            outlet_id: userData.outlet_id,
                        }));
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching outlets:", error);
        }
    };

    const fetchKaryawanData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://localhost:8000/api/karyawan/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Karyawan data fetched:", data);

            if (data.success) {
                const karyawanData = data.data;
                setFormData({
                    ...karyawanData,
                    tanggal_lahir:
                        karyawanData.tanggal_lahir?.split("T")[0] || "",
                    tanggal_masuk:
                        karyawanData.tanggal_masuk?.split("T")[0] ||
                        new Date().toISOString().split("T")[0],
                    tanggal_kontrak_berakhir:
                        karyawanData.tanggal_kontrak_berakhir?.split("T")[0] ||
                        "",

                    // Pastikan array fields ada
                    hobi: karyawanData.hobi || [],
                    minat_khusus: karyawanData.minat_khusus || [],
                    keahlian_teknis: karyawanData.keahlian_teknis || [],
                    soft_skills: karyawanData.soft_skills || [],
                    bahasa_dikuasai: karyawanData.bahasa_dikuasai || [],
                    sertifikasi: karyawanData.sertifikasi || [],
                    prestasi: karyawanData.prestasi || [],

                    // Object fields
                    tingkat_keahlian: karyawanData.tingkat_keahlian || {},
                    tingkat_bahasa: karyawanData.tingkat_bahasa || {},

                    // Pastikan outlet_id adalah number atau null
                    outlet_id: karyawanData.outlet_id
                        ? Number(karyawanData.outlet_id)
                        : null,
                });

                if (karyawanData.foto_profil) {
                    setPreviewImage(
                        karyawanData.foto_profil_url ||
                            `http://localhost:8000/storage/${karyawanData.foto_profil}`
                    );
                }
            } else {
                alert(
                    "Gagal mengambil data karyawan: " +
                        (data.message || "Unknown error")
                );
            }
        } catch (error) {
            console.error("Error fetching karyawan:", error);
            alert("Terjadi kesalahan saat mengambil data karyawan");
        } finally {
            setLoading(false);
        }
    };

    const generateNIK = () => {
        const randomNum = Math.floor(Math.random() * 10000);
        const nik = `KRY${String(randomNum).padStart(4, "0")}`;
        setFormData((prev) => ({ ...prev, nik }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        let processedValue = value;
        if (name === "outlet_id") {
            processedValue = value === "" ? null : parseInt(value);
            if (isNaN(processedValue)) processedValue = null;
        }

        // Handle tahun_lulus agar tidak string kosong
        if (name === "tahun_lulus") {
            processedValue = value === "" ? null : parseInt(value);
            if (isNaN(processedValue)) processedValue = null;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }

        // Clear submit error ketika user mulai mengedit
        if (submitError) {
            setSubmitError("");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                alert("Ukuran file terlalu besar. Maksimal 2MB.");
                return;
            }

            // Check file type
            const validTypes = ["image/jpeg", "image/png", "image/gif"];
            if (!validTypes.includes(file.type)) {
                alert(
                    "Format file tidak didukung. Gunakan JPG, PNG, atau GIF."
                );
                return;
            }

            // Preview image
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);

            // Simpan file untuk upload
            setFormData((prev) => ({
                ...prev,
                foto_profil: file,
            }));
        }
    };

    const handleAddHobi = () => {
        if (hobiInput.trim() && !formData.hobi.includes(hobiInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                hobi: [...prev.hobi, hobiInput.trim()],
            }));
            setHobiInput("");
        }
    };

    const handleRemoveHobi = (index) => {
        setFormData((prev) => ({
            ...prev,
            hobi: prev.hobi.filter((_, i) => i !== index),
        }));
    };

    const handleAddMinat = () => {
        if (
            minatInput.trim() &&
            !formData.minat_khusus.includes(minatInput.trim())
        ) {
            setFormData((prev) => ({
                ...prev,
                minat_khusus: [...prev.minat_khusus, minatInput.trim()],
            }));
            setMinatInput("");
        }
    };

    const handleRemoveMinat = (index) => {
        setFormData((prev) => ({
            ...prev,
            minat_khusus: prev.minat_khusus.filter((_, i) => i !== index),
        }));
    };

    const handleAddKeahlian = () => {
        if (
            keahlianInput.trim() &&
            !formData.keahlian_teknis.includes(keahlianInput.trim())
        ) {
            setFormData((prev) => ({
                ...prev,
                keahlian_teknis: [
                    ...prev.keahlian_teknis,
                    keahlianInput.trim(),
                ],
                tingkat_keahlian: {
                    ...prev.tingkat_keahlian,
                    [keahlianInput.trim()]: "Pemula",
                },
            }));
            setKeahlianInput("");
        }
    };

    const handleRemoveKeahlian = (keahlian) => {
        setFormData((prev) => {
            const updatedKeahlian = prev.keahlian_teknis.filter(
                (k) => k !== keahlian
            );
            const updatedLevels = { ...prev.tingkat_keahlian };
            delete updatedLevels[keahlian];

            return {
                ...prev,
                keahlian_teknis: updatedKeahlian,
                tingkat_keahlian: updatedLevels,
            };
        });
    };

    const handleKeahlianLevelChange = (keahlian, level) => {
        setFormData((prev) => ({
            ...prev,
            tingkat_keahlian: {
                ...prev.tingkat_keahlian,
                [keahlian]: level,
            },
        }));
    };

    const handleAddSoftSkill = () => {
        if (
            softSkillInput.trim() &&
            !formData.soft_skills.includes(softSkillInput.trim())
        ) {
            setFormData((prev) => ({
                ...prev,
                soft_skills: [...prev.soft_skills, softSkillInput.trim()],
            }));
            setSoftSkillInput("");
        }
    };

    const handleRemoveSoftSkill = (skill) => {
        setFormData((prev) => ({
            ...prev,
            soft_skills: prev.soft_skills.filter((s) => s !== skill),
        }));
    };

    const handleAddBahasa = () => {
        if (
            bahasaInput.trim() &&
            !formData.bahasa_dikuasai.includes(bahasaInput.trim())
        ) {
            setFormData((prev) => ({
                ...prev,
                bahasa_dikuasai: [...prev.bahasa_dikuasai, bahasaInput.trim()],
                tingkat_bahasa: {
                    ...prev.tingkat_bahasa,
                    [bahasaInput.trim()]: "Dasar",
                },
            }));
            setBahasaInput("");
        }
    };

    const handleRemoveBahasa = (bahasa) => {
        setFormData((prev) => {
            const updatedBahasa = prev.bahasa_dikuasai.filter(
                (b) => b !== bahasa
            );
            const updatedLevels = { ...prev.tingkat_bahasa };
            delete updatedLevels[bahasa];

            return {
                ...prev,
                bahasa_dikuasai: updatedBahasa,
                tingkat_bahasa: updatedLevels,
            };
        });
    };

    const handleBahasaLevelChange = (bahasa, level) => {
        setFormData((prev) => ({
            ...prev,
            tingkat_bahasa: {
                ...prev.tingkat_bahasa,
                [bahasa]: level,
            },
        }));
    };

    const handleAddSertifikasi = () => {
        setFormData((prev) => ({
            ...prev,
            sertifikasi: [
                ...prev.sertifikasi,
                { nama: "", lembaga: "", tahun: "" },
            ],
        }));
    };

    const handleSertifikasiChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedCerts = [...prev.sertifikasi];
            updatedCerts[index] = { ...updatedCerts[index], [field]: value };
            return { ...prev, sertifikasi: updatedCerts };
        });
    };

    const handleRemoveSertifikasi = (index) => {
        setFormData((prev) => ({
            ...prev,
            sertifikasi: prev.sertifikasi.filter((_, i) => i !== index),
        }));
    };

    const handleAddPrestasi = () => {
        setFormData((prev) => ({
            ...prev,
            prestasi: [
                ...prev.prestasi,
                { nama: "", tahun: "", deskripsi: "" },
            ],
        }));
    };

    const handlePrestasiChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedPrestasi = [...prev.prestasi];
            updatedPrestasi[index] = {
                ...updatedPrestasi[index],
                [field]: value,
            };
            return { ...prev, prestasi: updatedPrestasi };
        });
    };

    const handleRemovePrestasi = (index) => {
        setFormData((prev) => ({
            ...prev,
            prestasi: prev.prestasi.filter((_, i) => i !== index),
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        // Validasi required fields
        if (!formData.nik.trim()) newErrors.nik = "NIK harus diisi";
        if (!formData.nama.trim()) newErrors.nama = "Nama harus diisi";
        if (!formData.email.trim()) newErrors.email = "Email harus diisi";
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = "Format email tidak valid";

        // Validasi telepon
        if (!formData.telepon.trim()) {
            newErrors.telepon = "Telepon harus diisi";
        } else {
            const phoneRegex = /^(?:\+62|62|0)8[1-9][0-9]{6,9}$/;
            if (!phoneRegex.test(formData.telepon.replace(/\s+/g, ""))) {
                newErrors.telepon =
                    "Format telepon tidak valid (contoh: 081234567890 atau +6281234567890)";
            }
        }

        // Validasi tanggal lahir
        if (!formData.tanggal_lahir) {
            newErrors.tanggal_lahir = "Tanggal lahir harus diisi";
        } else {
            const birthDate = new Date(formData.tanggal_lahir);
            const today = new Date();

            // Tanggal lahir tidak boleh di masa depan
            if (birthDate > today) {
                newErrors.tanggal_lahir =
                    "Tanggal lahir tidak boleh di masa depan";
            }

            // Minimal usia 18 tahun
            const minAgeDate = new Date();
            minAgeDate.setFullYear(today.getFullYear() - 18);
            if (birthDate > minAgeDate) {
                newErrors.tanggal_lahir = "Minimal usia 18 tahun";
            }
        }

        if (!formData.alamat.trim()) newErrors.alamat = "Alamat harus diisi";
        if (!formData.department)
            newErrors.department = "Department harus diisi";
        if (!formData.jabatan) newErrors.jabatan = "Jabatan harus diisi";

        // Validasi tanggal masuk
        if (!formData.tanggal_masuk) {
            newErrors.tanggal_masuk = "Tanggal masuk harus diisi";
        } else {
            const joinDate = new Date(formData.tanggal_masuk);
            const today = new Date();

            // Tanggal masuk tidak boleh di masa depan
            if (joinDate > today) {
                newErrors.tanggal_masuk =
                    "Tanggal masuk tidak boleh di masa depan";
            }
        }

        if (!formData.status_karyawan)
            newErrors.status_karyawan = "Status karyawan harus diisi";

        // Validasi tanggal kontrak berakhir harus setelah tanggal masuk
        if (formData.tanggal_kontrak_berakhir && formData.tanggal_masuk) {
            const tanggalMasuk = new Date(formData.tanggal_masuk);
            const tanggalBerakhir = new Date(formData.tanggal_kontrak_berakhir);
            if (tanggalBerakhir <= tanggalMasuk) {
                newErrors.tanggal_kontrak_berakhir =
                    "Tanggal kontrak berakhir harus setelah tanggal masuk";
            }
        }

        // Validasi tahun lulus
        if (formData.tahun_lulus) {
            const currentYear = new Date().getFullYear();
            const yearNum = parseInt(formData.tahun_lulus);

            if (isNaN(yearNum)) {
                newErrors.tahun_lulus = "Tahun lulus harus berupa angka";
            } else if (yearNum < 1900) {
                newErrors.tahun_lulus = "Tahun lulus tidak valid";
            } else if (yearNum > currentYear) {
                newErrors.tahun_lulus = "Tahun lulus tidak boleh di masa depan";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Fungsi untuk membersihkan data sebelum dikirim
    const cleanFormData = (data) => {
        const cleaned = { ...data };

        // Convert empty strings to null untuk nullable fields
        const nullableFields = [
            "tempat_lahir",
            "agama",
            "status_pernikahan",
            "golongan_darah",
            "kontak_darurat_nama",
            "kontak_darurat_hubungan",
            "kontak_darurat_telepon",
            "provinsi",
            "kota",
            "kode_pos",
            "pendidikan_terakhir",
            "nama_sekolah_universitas",
            "jurusan",
            "level_jabatan",
            "tanggal_kontrak_berakhir",
            "jenis_karyawan",
            "npwp",
            "bpjs_kesehatan",
            "bpjs_ketenagakerjaan",
            "organisasi",
            "aspirasi_karir",
            "target_karir_5tahun",
        ];

        nullableFields.forEach((field) => {
            if (cleaned[field] === "" || cleaned[field] === undefined) {
                cleaned[field] = null;
            }
        });

        // Handle tahun_lulus khusus
        if (cleaned.tahun_lulus === "" || cleaned.tahun_lulus === undefined) {
            cleaned.tahun_lulus = null;
        } else if (cleaned.tahun_lulus) {
            // Convert to number
            cleaned.tahun_lulus = parseInt(cleaned.tahun_lulus);
            if (isNaN(cleaned.tahun_lulus)) {
                cleaned.tahun_lulus = null;
            }
        }

        // Handle outlet_id
        if (
            cleaned.outlet_id === "" ||
            cleaned.outlet_id === undefined ||
            cleaned.outlet_id === "null"
        ) {
            cleaned.outlet_id = null;
        } else if (cleaned.outlet_id) {
            // Convert to number
            cleaned.outlet_id = parseInt(cleaned.outlet_id);
            if (isNaN(cleaned.outlet_id)) {
                cleaned.outlet_id = null;
            }
        }

        // Pastikan array fields selalu array
        const arrayFields = [
            "hobi",
            "minat_khusus",
            "keahlian_teknis",
            "soft_skills",
            "bahasa_dikuasai",
            "sertifikasi",
            "prestasi",
        ];
        arrayFields.forEach((field) => {
            cleaned[field] = cleaned[field] || [];
        });

        // Pastikan object fields selalu object
        const objectFields = ["tingkat_keahlian", "tingkat_bahasa"];
        objectFields.forEach((field) => {
            cleaned[field] = cleaned[field] || {};
        });

        return cleaned;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert("Terdapat kesalahan validasi. Silakan periksa form Anda.");
            return;
        }

        try {
            setLoading(true);
            setSubmitError("");

            const token = localStorage.getItem("token");
            if (!token) {
                alert("Token tidak ditemukan. Silakan login kembali.");
                navigate("/login");
                return;
            }

            const url = isEditMode
                ? `http://localhost:8000/api/karyawan/${id}`
                : "http://localhost:8000/api/karyawan";

            const method = isEditMode ? "PUT" : "POST";

            // Bersihkan data sebelum dikirim
            const cleanedData = cleanFormData(formData);

            // DEBUG: Log data yang akan dikirim
            console.log("Cleaned data to send:", cleanedData);
            console.log(
                "Type of outlet_id:",
                typeof cleanedData.outlet_id,
                "Value:",
                cleanedData.outlet_id
            );

            // Prepare form data
            const submitFormData = new FormData();

            // Tambahkan semua field sesuai struktur database
            const fieldsToSend = {
                // Data dasar
                nik: cleanedData.nik,
                nama: cleanedData.nama,
                email: cleanedData.email,
                telepon: cleanedData.telepon,
                tanggal_lahir: cleanedData.tanggal_lahir,
                tempat_lahir: cleanedData.tempat_lahir,
                jenis_kelamin: cleanedData.jenis_kelamin,
                agama: cleanedData.agama,
                status_pernikahan: cleanedData.status_pernikahan,
                golongan_darah: cleanedData.golongan_darah,

                // Kontak darurat
                kontak_darurat_nama: cleanedData.kontak_darurat_nama,
                kontak_darurat_hubungan: cleanedData.kontak_darurat_hubungan,
                kontak_darurat_telepon: cleanedData.kontak_darurat_telepon,

                // Alamat
                alamat: cleanedData.alamat,
                provinsi: cleanedData.provinsi,
                kota: cleanedData.kota,
                kode_pos: cleanedData.kode_pos,

                // Data pendidikan
                pendidikan_terakhir: cleanedData.pendidikan_terakhir,
                nama_sekolah_universitas: cleanedData.nama_sekolah_universitas,
                jurusan: cleanedData.jurusan,
                tahun_lulus: cleanedData.tahun_lulus,

                // Data pekerjaan
                department: cleanedData.department,
                jabatan: cleanedData.jabatan,
                level_jabatan: cleanedData.level_jabatan,
                tanggal_masuk: cleanedData.tanggal_masuk,
                tanggal_kontrak_berakhir: cleanedData.tanggal_kontrak_berakhir,
                status_karyawan: cleanedData.status_karyawan,
                jenis_karyawan: cleanedData.jenis_karyawan,

                // Data identitas dan asuransi
                npwp: cleanedData.npwp,
                bpjs_kesehatan: cleanedData.bpjs_kesehatan,
                bpjs_ketenagakerjaan: cleanedData.bpjs_ketenagakerjaan,

                // Minat & Hobi (JSON)
                hobi: cleanedData.hobi,
                minat_khusus: cleanedData.minat_khusus,
                organisasi: cleanedData.organisasi,

                // Keahlian (JSON)
                keahlian_teknis: cleanedData.keahlian_teknis,
                tingkat_keahlian: cleanedData.tingkat_keahlian,
                soft_skills: cleanedData.soft_skills,
                bahasa_dikuasai: cleanedData.bahasa_dikuasai,
                tingkat_bahasa: cleanedData.tingkat_bahasa,

                // Sertifikasi & Prestasi (JSON)
                sertifikasi: cleanedData.sertifikasi,
                prestasi: cleanedData.prestasi,

                // Aspirasi Karir
                aspirasi_karir: cleanedData.aspirasi_karir,
                target_karir_5tahun: cleanedData.target_karir_5tahun,

                // Outlet - pastikan field name sesuai dengan migration
                outlet_id: cleanedData.outlet_id,
            };

            // Tambahkan fields ke FormData
            Object.keys(fieldsToSend).forEach((key) => {
                const value = fieldsToSend[key];

                if (value === null || value === undefined || value === "") {
                    // Untuk nullable fields, skip jika null/empty
                    if (["outlet_id", "tahun_lulus"].includes(key)) {
                        // Fields yang boleh null, tambahkan sebagai empty string
                        submitFormData.append(key, value === null ? "" : value);
                    }
                    return;
                }

                // Handle special fields
                if (key === "outlet_id") {
                    // Pastikan outlet_id adalah number atau empty string
                    const outletValue = Number(value);
                    submitFormData.append(
                        key,
                        isNaN(outletValue) ? "" : outletValue.toString()
                    );
                } else if (key === "tahun_lulus") {
                    // Tahun lulus harus number
                    submitFormData.append(key, Number(value).toString());
                } else if (
                    Array.isArray(value) ||
                    (typeof value === "object" && !(value instanceof File))
                ) {
                    // JSON fields
                    submitFormData.append(key, JSON.stringify(value));
                } else {
                    // Regular fields
                    submitFormData.append(key, value.toString());
                }
            });

            if (cleanedData.hobi && Array.isArray(cleanedData.hobi)) {
                cleanedData.hobi.forEach((item, index) => {
                    submitFormData.append(`hobi[${index}]`, item);
                });
            } else {
                submitFormData.append("hobi[]", ""); // Kosong jika tidak ada
            }

            // 2. Minat Khusus
            if (
                cleanedData.minat_khusus &&
                Array.isArray(cleanedData.minat_khusus)
            ) {
                cleanedData.minat_khusus.forEach((item, index) => {
                    submitFormData.append(`minat_khusus[${index}]`, item);
                });
            } else {
                submitFormData.append("minat_khusus[]", "");
            }

            // 3. Keahlian Teknis
            if (
                cleanedData.keahlian_teknis &&
                Array.isArray(cleanedData.keahlian_teknis)
            ) {
                cleanedData.keahlian_teknis.forEach((item, index) => {
                    submitFormData.append(`keahlian_teknis[${index}]`, item);
                });
            } else {
                submitFormData.append("keahlian_teknis[]", "");
            }

            // 4. Soft Skills
            if (
                cleanedData.soft_skills &&
                Array.isArray(cleanedData.soft_skills)
            ) {
                cleanedData.soft_skills.forEach((item, index) => {
                    submitFormData.append(`soft_skills[${index}]`, item);
                });
            } else {
                submitFormData.append("soft_skills[]", "");
            }

            // 5. Bahasa Dikuasai
            if (
                cleanedData.bahasa_dikuasai &&
                Array.isArray(cleanedData.bahasa_dikuasai)
            ) {
                cleanedData.bahasa_dikuasai.forEach((item, index) => {
                    submitFormData.append(`bahasa_dikuasai[${index}]`, item);
                });
            } else {
                submitFormData.append("bahasa_dikuasai[]", "");
            }

            // 6. Sertifikasi (array of objects)
            if (
                cleanedData.sertifikasi &&
                Array.isArray(cleanedData.sertifikasi)
            ) {
                cleanedData.sertifikasi.forEach((cert, index) => {
                    submitFormData.append(
                        `sertifikasi[${index}][nama]`,
                        cert.nama || ""
                    );
                    submitFormData.append(
                        `sertifikasi[${index}][lembaga]`,
                        cert.lembaga || ""
                    );
                    submitFormData.append(
                        `sertifikasi[${index}][tahun]`,
                        cert.tahun || ""
                    );
                });
            } else {
                submitFormData.append("sertifikasi[]", "");
            }

            // 7. Prestasi (array of objects)
            if (cleanedData.prestasi && Array.isArray(cleanedData.prestasi)) {
                cleanedData.prestasi.forEach((prestasi, index) => {
                    submitFormData.append(
                        `prestasi[${index}][nama]`,
                        prestasi.nama || ""
                    );
                    submitFormData.append(
                        `prestasi[${index}][tahun]`,
                        prestasi.tahun || ""
                    );
                    submitFormData.append(
                        `prestasi[${index}][deskripsi]`,
                        prestasi.deskripsi || ""
                    );
                });
            } else {
                submitFormData.append("prestasi[]", "");
            }

            // Handle file upload jika ada
            if (cleanedData.foto_profil instanceof File) {
                submitFormData.append("foto_profil", cleanedData.foto_profil);
            } else if (isEditMode && cleanedData.foto_profil) {
                // Untuk edit mode, jika ada foto_profil string (existing), kirim juga
                submitFormData.append("foto_profil", cleanedData.foto_profil);
            }

            // Debug: log FormData contents
            console.log("FormData contents:");
            for (let pair of submitFormData.entries()) {
                console.log(pair[0] + ":", pair[1], "Type:", typeof pair[1]);
            }

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    // JANGAN set Content-Type untuk FormData, browser akan set otomatis
                },
                body: submitFormData,
            });

            const data = await response.json();
            console.log("Server response:", data);

            if (!response.ok) {
                console.error("Server error response:", data);

                if (data.errors) {
                    // Tampilkan error validasi dari server
                    const errorMessages = Object.entries(data.errors)
                        .map(([field, errors]) => {
                            return `${field}: ${
                                Array.isArray(errors)
                                    ? errors.join(", ")
                                    : errors
                            }`;
                        })
                        .join("\n");

                    setSubmitError(errorMessages);
                    alert("Terdapat kesalahan validasi:\n" + errorMessages);
                    setErrors(data.errors);
                } else if (data.message) {
                    setSubmitError(data.message);
                    alert(data.message);
                } else {
                    setSubmitError(
                        `Error ${response.status}: ${response.statusText}`
                    );
                    alert(
                        `Terjadi kesalahan (${response.status}): ${response.statusText}`
                    );
                }
                return;
            }

            if (data.success) {
                alert(data.message || "Data berhasil disimpan!");
                navigate("/admin/karyawan");
            } else {
                setSubmitError(
                    data.message || "Terjadi kesalahan saat menyimpan data"
                );
                alert(data.message || "Terjadi kesalahan saat menyimpan data");
            }
        } catch (error) {
            console.error("Error saving karyawan:", error);
            setSubmitError(
                "Terjadi kesalahan koneksi. Periksa koneksi internet Anda."
            );
            alert("Terjadi kesalahan koneksi. Periksa koneksi internet Anda.");
        } finally {
            setLoading(false);
        }
    };

    const canChangeOutlet = () => {
        if (userRole === "admin") return true;
        if (userRole === "manager") return false;
        return true;
    };

    const tingkatOptions = ["Pemula", "Menengah", "Mahir", "Expert"];
    const bahasaLevelOptions = [
        "Dasar",
        "Menengah",
        "Lancar",
        "Fasih",
        "Native",
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        {isEditMode
                            ? "Edit Data Karyawan"
                            : "Tambah Karyawan Baru"}
                    </h1>
                    <p style={styles.subtitle}>
                        {isEditMode
                            ? "Perbarui informasi karyawan"
                            : "Isi form untuk menambahkan karyawan baru"}
                    </p>
                </div>
                <button
                    onClick={() => navigate("/admin/karyawan")}
                    style={styles.cancelButton}
                >
                    <FontAwesomeIcon icon={faTimes} />
                    <span>Kembali</span>
                </button>
            </div>

            {submitError && (
                <div style={styles.errorAlert}>
                    <strong>Error:</strong> {submitError}
                </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
                {/* Foto Profil Section */}
                <div style={styles.photoSection}>
                    <div style={styles.photoContainer}>
                        <div style={styles.photoWrapper}>
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Foto Profil"
                                    style={styles.photoPreview}
                                />
                            ) : (
                                <div style={styles.photoPlaceholder}>
                                    <FontAwesomeIcon
                                        icon={faUserCircle}
                                        size="3x"
                                    />
                                    <span>Upload Foto Profil</span>
                                </div>
                            )}
                            <label style={styles.photoUploadButton}>
                                <FontAwesomeIcon icon={faCamera} />
                                <span>Pilih Foto</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                />
                            </label>
                        </div>
                        <div style={styles.photoHint}>
                            <p>Format: JPG, PNG, GIF (maks. 2MB)</p>
                            <p>Ukuran disarankan: 300x300 px</p>
                        </div>
                    </div>
                </div>

                <div style={styles.formSections}>
                    {/* Section 1: Data Pribadi */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faUserCircle}
                                style={styles.sectionIcon}
                            />
                            Data Pribadi
                        </h3>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    NIK <span style={styles.required}>*</span>
                                </label>
                                <div style={styles.inputWithIcon}>
                                    <FontAwesomeIcon
                                        icon={faIdBadge}
                                        style={styles.inputIcon}
                                    />
                                    <input
                                        type="text"
                                        name="nik"
                                        value={formData.nik}
                                        onChange={handleChange}
                                        style={{
                                            ...styles.input,
                                            ...(errors.nik &&
                                                styles.inputError),
                                        }}
                                        placeholder="Contoh: KRY0001"
                                        disabled={isEditMode}
                                    />
                                </div>
                                {errors.nik && (
                                    <span style={styles.error}>
                                        {errors.nik}
                                    </span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Nama Lengkap{" "}
                                    <span style={styles.required}>*</span>
                                </label>
                                <div style={styles.inputWithIcon}>
                                    <FontAwesomeIcon
                                        icon={faUserCircle}
                                        style={styles.inputIcon}
                                    />
                                    <input
                                        type="text"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleChange}
                                        style={{
                                            ...styles.input,
                                            ...(errors.nama &&
                                                styles.inputError),
                                        }}
                                        placeholder="Masukkan nama lengkap"
                                    />
                                </div>
                                {errors.nama && (
                                    <span style={styles.error}>
                                        {errors.nama}
                                    </span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Email <span style={styles.required}>*</span>
                                </label>
                                <div style={styles.inputWithIcon}>
                                    <FontAwesomeIcon
                                        icon={faEnvelope}
                                        style={styles.inputIcon}
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        style={{
                                            ...styles.input,
                                            ...(errors.email &&
                                                styles.inputError),
                                        }}
                                        placeholder="email@perusahaan.com"
                                    />
                                </div>
                                {errors.email && (
                                    <span style={styles.error}>
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Telepon{" "}
                                    <span style={styles.required}>*</span>
                                </label>
                                <div style={styles.inputWithIcon}>
                                    <FontAwesomeIcon
                                        icon={faPhone}
                                        style={styles.inputIcon}
                                    />
                                    <input
                                        type="tel"
                                        name="telepon"
                                        value={formData.telepon}
                                        onChange={handleChange}
                                        style={{
                                            ...styles.input,
                                            ...(errors.telepon &&
                                                styles.inputError),
                                        }}
                                        placeholder="081234567890 atau +6281234567890"
                                    />
                                </div>
                                {errors.telepon && (
                                    <span style={styles.error}>
                                        {errors.telepon}
                                    </span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Tanggal Lahir{" "}
                                    <span style={styles.required}>*</span>
                                </label>
                                <div style={styles.inputWithIcon}>
                                    <FontAwesomeIcon
                                        icon={faCalendar}
                                        style={styles.inputIcon}
                                    />
                                    <input
                                        type="date"
                                        name="tanggal_lahir"
                                        value={formData.tanggal_lahir}
                                        onChange={handleChange}
                                        style={{
                                            ...styles.input,
                                            ...(errors.tanggal_lahir &&
                                                styles.inputError),
                                        }}
                                    />
                                </div>
                                {errors.tanggal_lahir && (
                                    <span style={styles.error}>
                                        {errors.tanggal_lahir}
                                    </span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tempat Lahir</label>
                                <input
                                    type="text"
                                    name="tempat_lahir"
                                    value={formData.tempat_lahir}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Contoh: Jakarta"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Jenis Kelamin{" "}
                                    <span style={styles.required}>*</span>
                                </label>
                                <div style={styles.radioGroup}>
                                    <label style={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="jenis_kelamin"
                                            value="L"
                                            checked={
                                                formData.jenis_kelamin === "L"
                                            }
                                            onChange={handleChange}
                                            style={styles.radioInput}
                                        />
                                        <span>Laki-laki</span>
                                    </label>
                                    <label style={styles.radioLabel}>
                                        <input
                                            type="radio"
                                            name="jenis_kelamin"
                                            value="P"
                                            checked={
                                                formData.jenis_kelamin === "P"
                                            }
                                            onChange={handleChange}
                                            style={styles.radioInput}
                                        />
                                        <span>Perempuan</span>
                                    </label>
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Agama</label>
                                <select
                                    name="agama"
                                    value={formData.agama || ""}
                                    onChange={handleChange}
                                    style={styles.select}
                                >
                                    <option value="">Pilih agama</option>
                                    {agamaOptions.map((agama, index) => (
                                        <option key={index} value={agama}>
                                            {agama}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Status Pernikahan
                                </label>
                                <select
                                    name="status_pernikahan"
                                    value={formData.status_pernikahan || ""}
                                    onChange={handleChange}
                                    style={styles.select}
                                >
                                    <option value="">Pilih status</option>
                                    {statusPernikahanOptions.map(
                                        (status, index) => (
                                            <option key={index} value={status}>
                                                {status}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Golongan Darah
                                </label>
                                <select
                                    name="golongan_darah"
                                    value={formData.golongan_darah || ""}
                                    onChange={handleChange}
                                    style={styles.select}
                                >
                                    <option value="">
                                        Pilih golongan darah
                                    </option>
                                    {golonganDarahOptions.map(
                                        (goldar, index) => (
                                            <option key={index} value={goldar}>
                                                {goldar}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Alamat */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faMapMarkerAlt}
                                style={styles.sectionIcon}
                            />
                            Alamat
                        </h3>
                        <div style={styles.grid}>
                            <div style={styles.formGroupFull}>
                                <label style={styles.label}>
                                    Alamat Lengkap{" "}
                                    <span style={styles.required}>*</span>
                                </label>
                                <textarea
                                    name="alamat"
                                    value={formData.alamat}
                                    onChange={handleChange}
                                    style={{
                                        ...styles.textarea,
                                        ...(errors.alamat && styles.inputError),
                                    }}
                                    placeholder="Masukkan alamat lengkap (jalan, RT/RW, kelurahan, kecamatan)"
                                    rows={3}
                                />
                                {errors.alamat && (
                                    <span style={styles.error}>
                                        {errors.alamat}
                                    </span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Provinsi</label>
                                <input
                                    type="text"
                                    name="provinsi"
                                    value={formData.provinsi || ""}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Contoh: Jawa Barat"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Kota/Kabupaten
                                </label>
                                <input
                                    type="text"
                                    name="kota"
                                    value={formData.kota || ""}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Contoh: Bandung"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Kode Pos</label>
                                <input
                                    type="text"
                                    name="kode_pos"
                                    value={formData.kode_pos || ""}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Contoh: 40111"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Kontak Darurat */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faPhone}
                                style={styles.sectionIcon}
                            />
                            Kontak Darurat
                        </h3>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Nama Kontak Darurat
                                </label>
                                <input
                                    type="text"
                                    name="kontak_darurat_nama"
                                    value={formData.kontak_darurat_nama || ""}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Masukkan nama kontak darurat"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Hubungan</label>
                                <input
                                    type="text"
                                    name="kontak_darurat_hubungan"
                                    value={
                                        formData.kontak_darurat_hubungan || ""
                                    }
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Contoh: Suami/Istri, Orang Tua"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Telepon Kontak Darurat
                                </label>
                                <input
                                    type="tel"
                                    name="kontak_darurat_telepon"
                                    value={
                                        formData.kontak_darurat_telepon || ""
                                    }
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="081234567890"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Pendidikan */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faGraduationCap}
                                style={styles.sectionIcon}
                            />
                            Pendidikan
                        </h3>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Pendidikan Terakhir
                                </label>
                                <select
                                    name="pendidikan_terakhir"
                                    value={formData.pendidikan_terakhir || ""}
                                    onChange={handleChange}
                                    style={styles.select}
                                >
                                    <option value="">
                                        Pilih pendidikan terakhir
                                    </option>
                                    {pendidikanOptions.map(
                                        (pendidikan, index) => (
                                            <option
                                                key={index}
                                                value={pendidikan}
                                            >
                                                {pendidikan}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Nama Sekolah/Universitas
                                </label>
                                <input
                                    type="text"
                                    name="nama_sekolah_universitas"
                                    value={
                                        formData.nama_sekolah_universitas || ""
                                    }
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Contoh: Universitas Indonesia"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Jurusan</label>
                                <input
                                    type="text"
                                    name="jurusan"
                                    value={formData.jurusan || ""}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Contoh: Teknik Informatika"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tahun Lulus</label>
                                <input
                                    type="number"
                                    name="tahun_lulus"
                                    value={formData.tahun_lulus || ""}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Contoh: 2020"
                                    min="1900"
                                    max={new Date().getFullYear()}
                                />
                                {errors.tahun_lulus && (
                                    <span style={styles.error}>
                                        {errors.tahun_lulus}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 5: Pekerjaan */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faBriefcase}
                                style={styles.sectionIcon}
                            />
                            Data Pekerjaan
                        </h3>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Department{" "}
                                    <span style={styles.required}>*</span>
                                </label>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    style={{
                                        ...styles.select,
                                        ...(errors.department &&
                                            styles.inputError),
                                    }}
                                >
                                    {departments.map((dept, index) => (
                                        <option key={index} value={dept}>
                                            {dept}
                                        </option>
                                    ))}
                                </select>
                                {errors.department && (
                                    <span style={styles.error}>
                                        {errors.department}
                                    </span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Jabatan{" "}
                                    <span style={styles.required}>*</span>
                                </label>
                                <select
                                    name="jabatan"
                                    value={formData.jabatan}
                                    onChange={handleChange}
                                    style={{
                                        ...styles.select,
                                        ...(errors.jabatan &&
                                            styles.inputError),
                                    }}
                                >
                                    {jabatans.map((jabatan, index) => (
                                        <option key={index} value={jabatan}>
                                            {jabatan}
                                        </option>
                                    ))}
                                </select>
                                {errors.jabatan && (
                                    <span style={styles.error}>
                                        {errors.jabatan}
                                    </span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Level Jabatan
                                </label>
                                <select
                                    name="level_jabatan"
                                    value={formData.level_jabatan || ""}
                                    onChange={handleChange}
                                    style={styles.select}
                                >
                                    <option value="">
                                        Pilih level jabatan
                                    </option>
                                    {levelJabatans.map((level, index) => (
                                        <option key={index} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Tanggal Masuk{" "}
                                    <span style={styles.required}>*</span>
                                </label>
                                <div style={styles.inputWithIcon}>
                                    <FontAwesomeIcon
                                        icon={faCalendar}
                                        style={styles.inputIcon}
                                    />
                                    <input
                                        type="date"
                                        name="tanggal_masuk"
                                        value={formData.tanggal_masuk}
                                        onChange={handleChange}
                                        style={{
                                            ...styles.input,
                                            ...(errors.tanggal_masuk &&
                                                styles.inputError),
                                        }}
                                    />
                                </div>
                                {errors.tanggal_masuk && (
                                    <span style={styles.error}>
                                        {errors.tanggal_masuk}
                                    </span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Tanggal Kontrak Berakhir
                                </label>
                                <div style={styles.inputWithIcon}>
                                    <FontAwesomeIcon
                                        icon={faCalendar}
                                        style={styles.inputIcon}
                                    />
                                    <input
                                        type="date"
                                        name="tanggal_kontrak_berakhir"
                                        value={
                                            formData.tanggal_kontrak_berakhir ||
                                            ""
                                        }
                                        onChange={handleChange}
                                        style={{
                                            ...styles.input,
                                            ...(errors.tanggal_kontrak_berakhir &&
                                                styles.inputError),
                                        }}
                                    />
                                </div>
                                {errors.tanggal_kontrak_berakhir && (
                                    <span style={styles.error}>
                                        {errors.tanggal_kontrak_berakhir}
                                    </span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Status Karyawan{" "}
                                    <span style={styles.required}>*</span>
                                </label>
                                <select
                                    name="status_karyawan"
                                    value={formData.status_karyawan}
                                    onChange={handleChange}
                                    style={{
                                        ...styles.select,
                                        ...(errors.status_karyawan &&
                                            styles.inputError),
                                    }}
                                >
                                    <option value="Aktif">Aktif</option>
                                    <option value="Tidak Aktif">
                                        Tidak Aktif
                                    </option>
                                    <option value="Cuti">Cuti</option>
                                </select>
                                {errors.status_karyawan && (
                                    <span style={styles.error}>
                                        {errors.status_karyawan}
                                    </span>
                                )}
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Jenis Karyawan
                                </label>
                                <select
                                    name="jenis_karyawan"
                                    value={formData.jenis_karyawan}
                                    onChange={handleChange}
                                    style={styles.select}
                                >
                                    {jenisKaryawans.map((jenis, index) => (
                                        <option key={index} value={jenis}>
                                            {jenis}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Outlet</label>
                                <div style={styles.inputWithIcon}>
                                    <FontAwesomeIcon
                                        icon={faStore}
                                        style={styles.inputIcon}
                                    />
                                    <select
                                        name="outlet_id"
                                        value={formData.outlet_id || ""}
                                        onChange={handleChange}
                                        style={{
                                            ...styles.select,
                                            ...(!canChangeOutlet() &&
                                                styles.disabledInput),
                                        }}
                                        disabled={!canChangeOutlet()}
                                    >
                                        <option value="">
                                            Pilih outlet (opsional)
                                        </option>
                                        {uniqueOutlets.map((outlet) => (
                                            <option
                                                key={outlet.id}
                                                value={outlet.id}
                                            >
                                                {outlet.nama_outlet}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {userRole === "manager" && (
                                    <div style={styles.hint}>
                                        * Hanya dapat menambahkan karyawan ke
                                        outlet sendiri
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section 6: Identitas & Asuransi */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faShieldAlt}
                                style={styles.sectionIcon}
                            />
                            Identitas & Asuransi
                        </h3>
                        <div style={styles.grid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>NPWP</label>
                                <input
                                    type="text"
                                    name="npwp"
                                    value={formData.npwp || ""}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Contoh: 12.345.678.9-012.345"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    BPJS Kesehatan
                                </label>
                                <input
                                    type="text"
                                    name="bpjs_kesehatan"
                                    value={formData.bpjs_kesehatan || ""}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Masukkan nomor BPJS Kesehatan"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    BPJS Ketenagakerjaan
                                </label>
                                <input
                                    type="text"
                                    name="bpjs_ketenagakerjaan"
                                    value={formData.bpjs_ketenagakerjaan || ""}
                                    onChange={handleChange}
                                    style={styles.input}
                                    placeholder="Masukkan nomor BPJS Ketenagakerjaan"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 7: Hobi & Minat */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faHeart}
                                style={styles.sectionIcon}
                            />
                            Hobi & Minat
                        </h3>

                        <div style={styles.formGroupFull}>
                            <label style={styles.label}>Hobi</label>
                            <div style={styles.tagsInputContainer}>
                                <div style={styles.tagsInputWrapper}>
                                    <input
                                        type="text"
                                        value={hobiInput}
                                        onChange={(e) =>
                                            setHobiInput(e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === "Enter" &&
                                            (e.preventDefault(),
                                            handleAddHobi())
                                        }
                                        style={styles.tagsInput}
                                        placeholder="Masukkan hobi (tekan Enter untuk menambah)"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddHobi}
                                        style={styles.addTagButton}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                <div style={styles.tagsList}>
                                    {formData.hobi.map((hobi, index) => (
                                        <span key={index} style={styles.tag}>
                                            {hobi}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveHobi(index)
                                                }
                                                style={styles.removeTagButton}
                                            >
                                                <FontAwesomeIcon
                                                    icon={faMinus}
                                                />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div style={styles.hint}>
                                    Contoh: Membaca, Olahraga, Musik
                                </div>
                            </div>
                        </div>

                        <div style={styles.formGroupFull}>
                            <label style={styles.label}>Minat Khusus</label>
                            <div style={styles.tagsInputContainer}>
                                <div style={styles.tagsInputWrapper}>
                                    <input
                                        type="text"
                                        value={minatInput}
                                        onChange={(e) =>
                                            setMinatInput(e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === "Enter" &&
                                            (e.preventDefault(),
                                            handleAddMinat())
                                        }
                                        style={styles.tagsInput}
                                        placeholder="Masukkan minat khusus (tekan Enter untuk menambah)"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddMinat}
                                        style={styles.addTagButton}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                <div style={styles.tagsList}>
                                    {formData.minat_khusus.map(
                                        (minat, index) => (
                                            <span
                                                key={index}
                                                style={styles.tag}
                                            >
                                                {minat}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveMinat(index)
                                                    }
                                                    style={
                                                        styles.removeTagButton
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faMinus}
                                                    />
                                                </button>
                                            </span>
                                        )
                                    )}
                                </div>
                                <div style={styles.hint}>
                                    Contoh: AI Research, Fintech, UI/UX Design
                                </div>
                            </div>
                        </div>

                        <div style={styles.formGroupFull}>
                            <label style={styles.label}>
                                Pengalaman Organisasi
                            </label>
                            <textarea
                                name="organisasi"
                                value={formData.organisasi || ""}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Jelaskan pengalaman organisasi (nama organisasi, jabatan, periode)"
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Section 8: Keahlian */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faStar}
                                style={styles.sectionIcon}
                            />
                            Keahlian
                        </h3>

                        <div style={styles.formGroupFull}>
                            <label style={styles.label}>Keahlian Teknis</label>
                            <div style={styles.tagsInputContainer}>
                                <div style={styles.tagsInputWrapper}>
                                    <input
                                        type="text"
                                        value={keahlianInput}
                                        onChange={(e) =>
                                            setKeahlianInput(e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === "Enter" &&
                                            (e.preventDefault(),
                                            handleAddKeahlian())
                                        }
                                        style={styles.tagsInput}
                                        placeholder="Masukkan keahlian teknis (tekan Enter untuk menambah)"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddKeahlian}
                                        style={styles.addTagButton}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                <div style={styles.skillsList}>
                                    {formData.keahlian_teknis.map(
                                        (keahlian, index) => (
                                            <div
                                                key={index}
                                                style={styles.skillItem}
                                            >
                                                <span style={styles.skillName}>
                                                    {keahlian}
                                                </span>
                                                <select
                                                    value={
                                                        formData
                                                            .tingkat_keahlian[
                                                            keahlian
                                                        ] || "Pemula"
                                                    }
                                                    onChange={(e) =>
                                                        handleKeahlianLevelChange(
                                                            keahlian,
                                                            e.target.value
                                                        )
                                                    }
                                                    style={
                                                        styles.skillLevelSelect
                                                    }
                                                >
                                                    {tingkatOptions.map(
                                                        (level, i) => (
                                                            <option
                                                                key={i}
                                                                value={level}
                                                            >
                                                                {level}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveKeahlian(
                                                            keahlian
                                                        )
                                                    }
                                                    style={
                                                        styles.removeSkillButton
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faTimes}
                                                    />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div style={styles.hint}>
                                    Contoh: JavaScript, Python, UI/UX Design
                                </div>
                            </div>
                        </div>

                        <div style={styles.formGroupFull}>
                            <label style={styles.label}>Soft Skills</label>
                            <div style={styles.tagsInputContainer}>
                                <div style={styles.tagsInputWrapper}>
                                    <input
                                        type="text"
                                        value={softSkillInput}
                                        onChange={(e) =>
                                            setSoftSkillInput(e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === "Enter" &&
                                            (e.preventDefault(),
                                            handleAddSoftSkill())
                                        }
                                        style={styles.tagsInput}
                                        placeholder="Masukkan soft skill (tekan Enter untuk menambah)"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddSoftSkill}
                                        style={styles.addTagButton}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                <div style={styles.tagsList}>
                                    {formData.soft_skills.map(
                                        (skill, index) => (
                                            <span
                                                key={index}
                                                style={styles.tag}
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveSoftSkill(
                                                            skill
                                                        )
                                                    }
                                                    style={
                                                        styles.removeTagButton
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faMinus}
                                                    />
                                                </button>
                                            </span>
                                        )
                                    )}
                                </div>
                                <div style={styles.hint}>
                                    Contoh: Leadership, Communication, Problem
                                    Solving
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 9: Bahasa */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faLanguage}
                                style={styles.sectionIcon}
                            />
                            Bahasa yang Dikuasai
                        </h3>

                        <div style={styles.formGroupFull}>
                            <label style={styles.label}>Bahasa</label>
                            <div style={styles.tagsInputContainer}>
                                <div style={styles.tagsInputWrapper}>
                                    <input
                                        type="text"
                                        value={bahasaInput}
                                        onChange={(e) =>
                                            setBahasaInput(e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === "Enter" &&
                                            (e.preventDefault(),
                                            handleAddBahasa())
                                        }
                                        style={styles.tagsInput}
                                        placeholder="Masukkan bahasa (tekan Enter untuk menambah)"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddBahasa}
                                        style={styles.addTagButton}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                                <div style={styles.skillsList}>
                                    {formData.bahasa_dikuasai.map(
                                        (bahasa, index) => (
                                            <div
                                                key={index}
                                                style={styles.skillItem}
                                            >
                                                <span style={styles.skillName}>
                                                    {bahasa}
                                                </span>
                                                <select
                                                    value={
                                                        formData.tingkat_bahasa[
                                                            bahasa
                                                        ] || "Dasar"
                                                    }
                                                    onChange={(e) =>
                                                        handleBahasaLevelChange(
                                                            bahasa,
                                                            e.target.value
                                                        )
                                                    }
                                                    style={
                                                        styles.skillLevelSelect
                                                    }
                                                >
                                                    {bahasaLevelOptions.map(
                                                        (level, i) => (
                                                            <option
                                                                key={i}
                                                                value={level}
                                                            >
                                                                {level}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveBahasa(
                                                            bahasa
                                                        )
                                                    }
                                                    style={
                                                        styles.removeSkillButton
                                                    }
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faTimes}
                                                    />
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                                <div style={styles.hint}>
                                    Contoh: Bahasa Indonesia, English, Japanese
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 10: Sertifikasi */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faCertificate}
                                style={styles.sectionIcon}
                            />
                            Sertifikasi & Pelatihan
                        </h3>

                        <div style={styles.formGroupFull}>
                            <div style={styles.certificationContainer}>
                                {formData.sertifikasi.map((cert, index) => (
                                    <div
                                        key={index}
                                        style={styles.certificationItem}
                                    >
                                        <input
                                            type="text"
                                            value={cert.nama || ""}
                                            onChange={(e) =>
                                                handleSertifikasiChange(
                                                    index,
                                                    "nama",
                                                    e.target.value
                                                )
                                            }
                                            style={styles.certInput}
                                            placeholder="Nama sertifikasi"
                                        />
                                        <input
                                            type="text"
                                            value={cert.lembaga || ""}
                                            onChange={(e) =>
                                                handleSertifikasiChange(
                                                    index,
                                                    "lembaga",
                                                    e.target.value
                                                )
                                            }
                                            style={styles.certInput}
                                            placeholder="Lembaga penerbit"
                                        />
                                        <input
                                            type="number"
                                            value={cert.tahun || ""}
                                            onChange={(e) =>
                                                handleSertifikasiChange(
                                                    index,
                                                    "tahun",
                                                    e.target.value
                                                )
                                            }
                                            style={styles.certYearInput}
                                            placeholder="Tahun"
                                            min="1900"
                                            max={new Date().getFullYear()}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveSertifikasi(index)
                                            }
                                            style={styles.removeCertButton}
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddSertifikasi}
                                    style={styles.addCertButton}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> Tambah
                                    Sertifikasi
                                </button>
                            </div>
                            <div style={styles.hint}>
                                Isi sertifikasi dan pelatihan yang pernah
                                diikuti
                            </div>
                        </div>
                    </div>

                    {/* Section 11: Prestasi */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faFlag}
                                style={styles.sectionIcon}
                            />
                            Prestasi & Penghargaan
                        </h3>

                        <div style={styles.formGroupFull}>
                            <div style={styles.achievementContainer}>
                                {formData.prestasi.map((prestasi, index) => (
                                    <div
                                        key={index}
                                        style={styles.achievementItem}
                                    >
                                        <input
                                            type="text"
                                            value={prestasi.nama || ""}
                                            onChange={(e) =>
                                                handlePrestasiChange(
                                                    index,
                                                    "nama",
                                                    e.target.value
                                                )
                                            }
                                            style={styles.achievementInput}
                                            placeholder="Nama prestasi/penghargaan"
                                        />
                                        <input
                                            type="number"
                                            value={prestasi.tahun || ""}
                                            onChange={(e) =>
                                                handlePrestasiChange(
                                                    index,
                                                    "tahun",
                                                    e.target.value
                                                )
                                            }
                                            style={styles.achievementYearInput}
                                            placeholder="Tahun"
                                            min="1900"
                                            max={new Date().getFullYear()}
                                        />
                                        <textarea
                                            value={prestasi.deskripsi || ""}
                                            onChange={(e) =>
                                                handlePrestasiChange(
                                                    index,
                                                    "deskripsi",
                                                    e.target.value
                                                )
                                            }
                                            style={styles.achievementDescInput}
                                            placeholder="Deskripsi prestasi"
                                            rows={2}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemovePrestasi(index)
                                            }
                                            style={
                                                styles.removeAchievementButton
                                            }
                                        >
                                            <FontAwesomeIcon icon={faTimes} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddPrestasi}
                                    style={styles.addAchievementButton}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> Tambah
                                    Prestasi
                                </button>
                            </div>
                            <div style={styles.hint}>
                                Isi prestasi dan penghargaan yang pernah diraih
                            </div>
                        </div>
                    </div>

                    {/* Section 12: Aspirasi Karir */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <FontAwesomeIcon
                                icon={faBriefcase}
                                style={styles.sectionIcon}
                            />
                            Aspirasi & Target Karir
                        </h3>

                        <div style={styles.formGroupFull}>
                            <label style={styles.label}>Aspirasi Karir</label>
                            <textarea
                                name="aspirasi_karir"
                                value={formData.aspirasi_karir || ""}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Tuliskan aspirasi dan tujuan karir jangka panjang Anda"
                                rows={3}
                            />
                        </div>

                        <div style={styles.formGroupFull}>
                            <label style={styles.label}>
                                Target Karir 5 Tahun Mendatang
                            </label>
                            <textarea
                                name="target_karir_5tahun"
                                value={formData.target_karir_5tahun || ""}
                                onChange={handleChange}
                                style={styles.textarea}
                                placeholder="Tuliskan target karir yang ingin dicapai dalam 5 tahun ke depan"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Form Actions */}
                <div style={styles.formActions}>
                    <button
                        type="button"
                        onClick={() => navigate("/admin/karyawan")}
                        style={styles.secondaryButton}
                        disabled={loading}
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        style={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div style={styles.spinner}></div>
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSave} />
                                <span>
                                    {isEditMode ? "Update" : "Simpan"} Karyawan
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        maxWidth: "1200px",
        margin: "0 auto",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
        paddingBottom: "1.5rem",
        borderBottom: "1px solid #f1f5f9",
    },
    title: {
        fontSize: "1.75rem",
        fontWeight: "700",
        color: "#1e293b",
        margin: 0,
        letterSpacing: "-0.025em",
    },
    subtitle: {
        fontSize: "0.95rem",
        color: "#64748b",
        margin: "0.5rem 0 0 0",
        fontWeight: "400",
    },
    cancelButton: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1.5rem",
        backgroundColor: "transparent",
        color: "#64748b",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#f8fafc",
            borderColor: "#cbd5e1",
        },
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
    },
    photoSection: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "2rem",
    },
    photoContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
    },
    photoWrapper: {
        position: "relative",
        width: "150px",
        height: "150px",
        borderRadius: "12px",
        overflow: "hidden",
        backgroundColor: "#f8fafc",
        border: "2px dashed #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            borderColor: "#3b82f6",
        },
    },
    photoPreview: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    photoPlaceholder: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        color: "#94a3b8",
        textAlign: "center",
        padding: "1rem",
    },
    photoUploadButton: {
        position: "absolute",
        bottom: "0",
        left: "0",
        right: "0",
        background: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        fontSize: "0.85rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            background: "rgba(0, 0, 0, 0.8)",
        },
    },
    photoHint: {
        fontSize: "0.8rem",
        color: "#94a3b8",
        textAlign: "center",
        lineHeight: "1.4",
    },
    formSections: {
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
    },
    section: {
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        padding: "1.5rem",
        border: "1px solid #f1f5f9",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    },
    sectionTitle: {
        fontSize: "1.1rem",
        fontWeight: "600",
        color: "#334155",
        margin: "0 0 1.5rem 0",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid #f1f5f9",
    },
    sectionIcon: {
        color: "#3b82f6",
        fontSize: "1rem",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "1.5rem",
    },
    formGroup: {
        marginBottom: "1.25rem",
    },
    formGroupFull: {
        marginBottom: "1.5rem",
    },
    label: {
        display: "block",
        fontSize: "0.9rem",
        fontWeight: "500",
        color: "#475569",
        marginBottom: "0.5rem",
    },
    required: {
        color: "#ef4444",
    },
    inputWithIcon: {
        position: "relative",
    },
    inputIcon: {
        position: "absolute",
        left: "0.75rem",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8",
        fontSize: "0.9rem",
    },
    input: {
        width: "100%",
        padding: "0.75rem 1rem 0.75rem 2.5rem",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "0.9rem",
        backgroundColor: "#ffffff",
        transition: "all 0.2s ease",
        "&::placeholder": {
            color: "#94a3b8",
            fontSize: "0.85rem",
        },
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        },
        "&:disabled": {
            backgroundColor: "#f8fafc",
            cursor: "not-allowed",
        },
    },
    inputError: {
        borderColor: "#ef4444",
        "&:focus": {
            borderColor: "#ef4444",
            boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)",
        },
    },
    select: {
        width: "100%",
        padding: "0.75rem 1rem 0.75rem 2.5rem",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "0.9rem",
        backgroundColor: "#ffffff",
        cursor: "pointer",
        transition: "all 0.2s ease",
        appearance: "none",
        backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.75rem center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "1.5em 1.5em",
        paddingRight: "2.5rem",
        "&::placeholder": {
            color: "#94a3b8",
            fontSize: "0.85rem",
        },
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        },
        "&:disabled": {
            backgroundColor: "#f8fafc",
            cursor: "not-allowed",
        },
    },
    textarea: {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "0.9rem",
        backgroundColor: "#ffffff",
        fontFamily: "inherit",
        resize: "vertical",
        minHeight: "100px",
        transition: "all 0.2s ease",
        "&::placeholder": {
            color: "#94a3b8",
            fontSize: "0.85rem",
            lineHeight: "1.4",
        },
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
        },
    },
    radioGroup: {
        display: "flex",
        gap: "1.5rem",
        padding: "0.5rem 0",
    },
    radioLabel: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        cursor: "pointer",
        fontSize: "0.9rem",
        color: "#475569",
    },
    radioInput: {
        margin: 0,
        cursor: "pointer",
    },
    error: {
        fontSize: "0.8rem",
        color: "#ef4444",
        marginTop: "0.25rem",
        display: "block",
    },
    errorAlert: {
        backgroundColor: "#fee2e2",
        border: "1px solid #ef4444",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1.5rem",
        color: "#991b1b",
        fontSize: "0.9rem",
    },
    hint: {
        fontSize: "0.8rem",
        color: "#94a3b8",
        marginTop: "0.5rem",
        fontStyle: "italic",
        lineHeight: "1.4",
    },
    disabledInput: {
        backgroundColor: "#f8fafc",
        color: "#94a3b8",
    },
    tagsInputContainer: {
        marginTop: "0.5rem",
    },
    tagsInputWrapper: {
        display: "flex",
        gap: "0.5rem",
        marginBottom: "0.75rem",
    },
    tagsInput: {
        flex: 1,
        padding: "0.5rem 0.75rem",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        fontSize: "0.9rem",
        backgroundColor: "#ffffff",
        transition: "all 0.2s ease",
        "&::placeholder": {
            color: "#94a3b8",
            fontSize: "0.85rem",
        },
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
        },
    },
    addTagButton: {
        padding: "0.5rem 1rem",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        fontSize: "0.85rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
    },
    tagsList: {
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        minHeight: "2.5rem",
        marginBottom: "0.5rem",
    },
    tag: {
        display: "inline-flex",
        alignItems: "center",
        padding: "0.25rem 0.75rem",
        backgroundColor: "#e0f2fe",
        color: "#0369a1",
        borderRadius: "20px",
        fontSize: "0.8rem",
        gap: "0.5rem",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#bae6fd",
        },
    },
    removeTagButton: {
        background: "none",
        border: "none",
        color: "#0369a1",
        cursor: "pointer",
        fontSize: "0.7rem",
        padding: "0",
        width: "16px",
        height: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        "&:hover": {
            color: "#075985",
        },
    },
    skillsList: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginBottom: "0.5rem",
    },
    skillItem: {
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "0.5rem 0.75rem",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
    },
    skillName: {
        flex: 1,
        fontSize: "0.9rem",
        color: "#334155",
        minWidth: "120px",
    },
    skillLevelSelect: {
        padding: "0.25rem 0.5rem",
        fontSize: "0.8rem",
        border: "1px solid #cbd5e1",
        borderRadius: "4px",
        backgroundColor: "#ffffff",
        minWidth: "100px",
    },
    removeSkillButton: {
        background: "none",
        border: "none",
        color: "#94a3b8",
        cursor: "pointer",
        fontSize: "0.85rem",
        padding: "0.25rem",
        "&:hover": {
            color: "#ef4444",
        },
    },
    certificationContainer: {
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "1rem",
        backgroundColor: "#f8fafc",
    },
    certificationItem: {
        display: "grid",
        gridTemplateColumns: "2fr 1.5fr 0.8fr auto",
        gap: "0.75rem",
        marginBottom: "0.75rem",
        alignItems: "center",
    },
    certInput: {
        padding: "0.5rem 0.75rem",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        fontSize: "0.9rem",
        backgroundColor: "#ffffff",
        "&::placeholder": {
            color: "#94a3b8",
            fontSize: "0.85rem",
        },
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
        },
    },
    certYearInput: {
        padding: "0.5rem 0.75rem",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        fontSize: "0.9rem",
        backgroundColor: "#ffffff",
        minWidth: "80px",
        "&::placeholder": {
            color: "#94a3b8",
            fontSize: "0.85rem",
        },
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
        },
    },
    removeCertButton: {
        background: "none",
        border: "none",
        color: "#94a3b8",
        cursor: "pointer",
        fontSize: "0.9rem",
        padding: "0.5rem",
        "&:hover": {
            color: "#ef4444",
        },
    },
    addCertButton: {
        padding: "0.5rem 1rem",
        backgroundColor: "transparent",
        border: "1px dashed #cbd5e1",
        borderRadius: "6px",
        cursor: "pointer",
        color: "#475569",
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        marginTop: "0.5rem",
        width: "100%",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#f1f5f9",
            borderColor: "#94a3b8",
        },
    },
    achievementContainer: {
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "1rem",
        backgroundColor: "#f8fafc",
    },
    achievementItem: {
        display: "grid",
        gridTemplateColumns: "2fr 0.8fr 3fr auto",
        gap: "0.75rem",
        marginBottom: "0.75rem",
        alignItems: "start",
    },
    achievementInput: {
        padding: "0.5rem 0.75rem",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        fontSize: "0.9rem",
        backgroundColor: "#ffffff",
        "&::placeholder": {
            color: "#94a3b8",
            fontSize: "0.85rem",
        },
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
        },
    },
    achievementYearInput: {
        padding: "0.5rem 0.75rem",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        fontSize: "0.9rem",
        backgroundColor: "#ffffff",
        minWidth: "80px",
        "&::placeholder": {
            color: "#94a3b8",
            fontSize: "0.85rem",
        },
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
        },
    },
    achievementDescInput: {
        padding: "0.5rem 0.75rem",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
        fontSize: "0.9rem",
        backgroundColor: "#ffffff",
        fontFamily: "inherit",
        resize: "vertical",
        minHeight: "60px",
        "&::placeholder": {
            color: "#94a3b8",
            fontSize: "0.85rem",
        },
        "&:focus": {
            outline: "none",
            borderColor: "#3b82f6",
        },
    },
    removeAchievementButton: {
        background: "none",
        border: "none",
        color: "#94a3b8",
        cursor: "pointer",
        fontSize: "0.9rem",
        padding: "0.5rem",
        marginTop: "0.25rem",
        "&:hover": {
            color: "#ef4444",
        },
    },
    addAchievementButton: {
        padding: "0.5rem 1rem",
        backgroundColor: "transparent",
        border: "1px dashed #cbd5e1",
        borderRadius: "6px",
        cursor: "pointer",
        color: "#475569",
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        marginTop: "0.5rem",
        width: "100%",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#f1f5f9",
            borderColor: "#94a3b8",
        },
    },
    formActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "1rem",
        paddingTop: "2rem",
        marginTop: "1rem",
        borderTop: "1px solid #f1f5f9",
    },
    secondaryButton: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "transparent",
        color: "#475569",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover:not(:disabled)": {
            backgroundColor: "#f8fafc",
            borderColor: "#cbd5e1",
        },
        "&:disabled": {
            opacity: 0.5,
            cursor: "not-allowed",
        },
    },
    submitButton: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1.5rem",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover:not(:disabled)": {
            backgroundColor: "#2563eb",
        },
        "&:disabled": {
            opacity: 0.5,
            cursor: "not-allowed",
        },
    },
    spinner: {
        width: "16px",
        height: "16px",
        border: "2px solid rgba(255, 255, 255, 0.3)",
        borderTop: "2px solid white",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginRight: "0.5rem",
    },
};

// Add spinner animation
const styleElement = document.createElement("style");
styleElement.innerHTML = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleElement);

export default KaryawanForm;
