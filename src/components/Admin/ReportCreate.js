import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faSave,
    faTimes,
    faFileAlt,
    faCalendarAlt,
    faStore,
    faCheckCircle,
    faExclamationCircle,
    faSpinner,
    faFileExcel,
    faUpload,
    faDownload,
    faQuestionCircle,
    faClock,
} from "@fortawesome/free-solid-svg-icons";
import * as XLSX from "xlsx";

const ReportCreate = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State untuk form
    const [formData, setFormData] = useState({
        outlet_id: "",
        report_date: new Date().toISOString().split("T")[0],
        lob: "",
        omzet_fnb: "",
        omzet_cinema: "",
        total_bills: "",
        total_audience: "",
        target_percentage: "",
        target_head: "",
        notes: "",
    });

    // State untuk data outlets
    const [outlets, setOutlets] = useState([]);
    const [availableLobs, setAvailableLobs] = useState([]);
    const [selectedOutlet, setSelectedOutlet] = useState(null);

    // State untuk UI
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingOutlets, setIsLoadingOutlets] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    // State untuk fitur import Excel
    const [showImportModal, setShowImportModal] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importPreview, setImportPreview] = useState([]);
    const [importProgress, setImportProgress] = useState(0);
    const [importSuccessCount, setImportSuccessCount] = useState(0);
    const [importErrorCount, setImportErrorCount] = useState(0);
    const [importDetails, setImportDetails] = useState([]);
    const [outletMap, setOutletMap] = useState({});

    // State baru untuk notifikasi sukses import
    const [showImportSuccess, setShowImportSuccess] = useState(false);
    const [importSuccessDetails, setImportSuccessDetails] = useState(null);
    const [showImportError, setShowImportError] = useState(false);

    const API_BASE_URL =
        process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

    // Cek jika user bukan admin
    useEffect(() => {
        if (user && user.role !== "admin") {
            navigate("/unauthorized");
        }
    }, [user, navigate]);

    // Fetch data outlets saat komponen mount
    useEffect(() => {
        fetchOutlets();
    }, []);

    const fetchOutlets = async () => {
        try {
            setIsLoadingOutlets(true);
            const token = localStorage.getItem("token") || user?.token;

            if (!token) {
                setStatusMessage(
                    "Token tidak ditemukan. Silakan login kembali.",
                );
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            console.log("🔍 Fetching outlets from API...");
            const response = await axios.get(`${API_BASE_URL}/outlets`, config);
            console.log("📥 API Response outlets:", response.data);

            let outletsData = [];
            if (response.data && response.data.data) {
                outletsData = response.data.data;
            } else if (response.data && Array.isArray(response.data)) {
                outletsData = response.data;
            } else {
                console.warn("⚠️ Unexpected response format:", response.data);
                outletsData = [];
            }

            // Format data outlet
            const allOutlets = outletsData.map((outlet) => ({
                id: outlet.id,
                kode_outlet: outlet.kode_outlet || outlet.code || "",
                nama_outlet:
                    outlet.nama_outlet ||
                    outlet.nama ||
                    outlet.name ||
                    "No Name",
                lob: outlet.lob || outlet.line_of_business || "Cafe",
                alamat: outlet.alamat || "",
                kota: outlet.kota || "",
                telepon: outlet.telepon || "",
            }));

            console.log(
                "✅ Processed outlets:",
                allOutlets.map((o) => ({
                    id: o.id,
                    kode: o.kode_outlet,
                    nama: o.nama_outlet,
                    lob: o.lob,
                })),
            );

            setOutlets(allOutlets);

            // Debug: Log semua outlet untuk verifikasi
            console.log("📋 All Outlets for import matching:");
            allOutlets.forEach((outlet, idx) => {
                console.log(
                    `${idx + 1}. ${outlet.kode_outlet} - ${
                        outlet.nama_outlet
                    } - ${outlet.lob}`,
                );
            });

            const allLobs = Array.from(
                new Set(outletsData.map((o) => o.lob).filter((lob) => lob)),
            ).sort();

            setAvailableLobs(allLobs);
        } catch (error) {
            console.error("❌ Error fetching outlets:", error);
            console.error("Error response:", error.response?.data);
            setStatusMessage("Gagal mengambil data outlet. Silakan coba lagi.");
            setOutlets([]);
            setAvailableLobs([]);
            setOutletMap({});
        } finally {
            setIsLoadingOutlets(false);
        }
    };

    const handleOutletChange = (e) => {
        const outletId = e.target.value;

        setFormData((prev) => ({
            ...prev,
            outlet_id: outletId,
        }));

        if (errors.outlet_id) {
            setErrors((prev) => ({
                ...prev,
                outlet_id: "",
            }));
        }

        if (outletId) {
            const outlet = outlets.find((o) => o.id.toString() === outletId);
            setSelectedOutlet(outlet);
        } else {
            setSelectedOutlet(null);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let processedValue = value;
        if (
            name.includes("omzet") ||
            name.includes("percentage") ||
            name.includes("bills") ||
            name.includes("audience") ||
            name.includes("head")
        ) {
            if (value === "") {
                processedValue = "";
            } else if (/^\d*\.?\d*$/.test(value)) {
                processedValue = value;
            } else {
                return;
            }
        }

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleLobChange = (e) => {
        const lobValue = e.target.value;
        setFormData((prev) => ({
            ...prev,
            lob: lobValue,
        }));

        if (errors.lob) {
            setErrors((prev) => ({
                ...prev,
                lob: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.outlet_id) {
            newErrors.outlet_id = "Outlet wajib dipilih";
        }

        if (!formData.report_date) {
            newErrors.report_date = "Tanggal laporan wajib diisi";
        }

        if (!formData.omzet_fnb) {
            newErrors.omzet_fnb = "Omzet F&B wajib diisi";
        } else if (parseFloat(formData.omzet_fnb) < 0) {
            newErrors.omzet_fnb = "Omzet F&B tidak boleh negatif";
        }

        if (!formData.omzet_cinema) {
            newErrors.omzet_cinema = "Omzet Cinema wajib diisi";
        } else if (parseFloat(formData.omzet_cinema) < 0) {
            newErrors.omzet_cinema = "Omzet Cinema tidak boleh negatif";
        }

        if (!formData.total_bills) {
            newErrors.total_bills = "Jumlah bill wajib diisi";
        } else if (parseInt(formData.total_bills) < 0) {
            newErrors.total_bills = "Jumlah bill tidak boleh negatif";
        }

        if (!formData.total_audience) {
            newErrors.total_audience = "Jumlah penonton wajib diisi";
        } else if (parseInt(formData.total_audience) < 0) {
            newErrors.total_audience = "Jumlah penonton tidak boleh negatif";
        }

        if (!formData.target_percentage) {
            newErrors.target_percentage = "Target (%) wajib diisi";
        } else {
            const targetValue = parseFloat(formData.target_percentage);
            if (isNaN(targetValue)) {
                newErrors.target_percentage = "Target (%) harus angka";
            } else if (targetValue < 0) {
                newErrors.target_percentage = "Target (%) tidak boleh negatif";
            } else if (targetValue > 100) {
                newErrors.target_percentage = "Target (%) maksimal 100";
            }
        }

        if (!formData.target_head) {
            newErrors.target_head = "Target head wajib diisi";
        } else if (parseInt(formData.target_head) < 0) {
            newErrors.target_head = "Target head tidak boleh negatif";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const formatNumber = (value) => {
        if (!value) return "";
        const num = parseFloat(value);
        return isNaN(num) ? value : num.toLocaleString("id-ID");
    };

    const parseNumber = (value) => {
        if (!value) return "";
        return value.replace(/\./g, "");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setSubmitStatus(null);
        setStatusMessage("");

        try {
            const token = localStorage.getItem("token") || user?.token;
            if (!token) {
                throw new Error(
                    "Token tidak ditemukan. Silakan login kembali.",
                );
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            };

            // Fungsi untuk target percentage TANPA KONVERSI
            const prepareTargetPercentage = (value) => {
                if (value === null || value === undefined || isNaN(value))
                    return 0;
                // **PERUBAHAN: Parsing langsung tanpa pembagian 100**
                return parseFloat(value);
            };

            // **PERBAIKAN: Gunakan formData yang sudah ada, bukan variabel dari processImport**
            const payload = {
                outlet_id: parseInt(formData.outlet_id),
                report_date: formData.report_date,
                omzet_fnb: roundForDatabase(
                    parseFloat(formData.omzet_fnb || 0),
                    2,
                ),
                omzet_cinema: roundForDatabase(
                    parseFloat(formData.omzet_cinema || 0),
                    2,
                ),
                total_bills: parseInt(formData.total_bills) || 0,
                total_audience: parseInt(formData.total_audience) || 0,
                target_percentage: prepareTargetPercentage(
                    parseFloat(formData.target_percentage || 0),
                ),
                target_head: parseInt(formData.target_head) || 0,
                notes: formData.notes || "",
            };

            console.log("Manual Submit Payload:", payload);
            console.log("Target % (raw):", formData.target_percentage);
            console.log("Target % (in payload):", payload.target_percentage);

            const response = await axios.post(
                `${API_BASE_URL}/reports`,
                payload,
                config,
            );

            if (response.data.success) {
                setSubmitStatus("success");
                setStatusMessage("Laporan berhasil dibuat!");

                setTimeout(() => {
                    setFormData({
                        outlet_id: "",
                        report_date: new Date().toISOString().split("T")[0],
                        lob: "",
                        omzet_fnb: "",
                        omzet_cinema: "",
                        total_bills: "",
                        total_audience: "",
                        target_percentage: "",
                        target_head: "",
                        notes: "",
                    });
                    setSelectedOutlet(null);

                    setTimeout(() => {
                        navigate("/admin/reports");
                    }, 2000);
                }, 1500);
            } else {
                throw new Error(
                    response.data.message || "Gagal membuat laporan",
                );
            }
        } catch (error) {
            console.error("Error creating report:", error);
            console.error("Error Response:", error.response?.data);
            setSubmitStatus("error");

            if (error.response) {
                if (
                    error.response.status === 422 &&
                    error.response.data.errors
                ) {
                    const backendErrors = error.response.data.errors;
                    const formattedErrors = {};

                    Object.keys(backendErrors).forEach((key) => {
                        formattedErrors[key] = backendErrors[key][0];
                    });

                    setErrors(formattedErrors);

                    if (
                        error.response.data.message &&
                        error.response.data.message.includes("already exists")
                    ) {
                        setStatusMessage(
                            "Sudah ada laporan untuk outlet ini pada tanggal tersebut.",
                        );
                    } else {
                        setStatusMessage(
                            "Mohon periksa kembali data yang dimasukkan",
                        );
                    }
                } else if (error.response.status === 409) {
                    setStatusMessage(
                        "Sudah ada laporan untuk outlet ini pada tanggal tersebut.",
                    );
                } else if (error.response.status === 401) {
                    setStatusMessage(
                        "Sesi telah berakhir. Silakan login kembali.",
                    );
                } else if (error.response.status === 403) {
                    setStatusMessage(
                        "Anda tidak memiliki izin untuk melakukan aksi ini",
                    );
                } else if (error.response.data?.message) {
                    setStatusMessage(error.response.data.message);
                } else {
                    setStatusMessage("Terjadi kesalahan saat membuat laporan");
                }
            } else if (error.request) {
                setStatusMessage(
                    "Tidak dapat terhubung ke server. Periksa koneksi Anda.",
                );
            } else {
                setStatusMessage(error.message || "Terjadi kesalahan");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // ==================== FUNGSI IMPORT EXCEL ====================

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validExtensions = [
            ".xlsx",
            ".xls",
            ".csv",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel",
        ];

        const fileExtension = file.name.slice(
            ((file.name.lastIndexOf(".") - 1) >>> 0) + 2,
        );
        const fileType = file.type;

        if (
            !validExtensions.includes(`.${fileExtension}`) &&
            !validExtensions.includes(fileType)
        ) {
            setStatusMessage(
                "Format file tidak didukung. Harap upload file Excel (.xlsx, .xls) atau CSV.",
            );
            setSubmitStatus("error");
            setShowImportError(true);
            return;
        }

        setImportFile(file);
        previewExcelFile(file);
    };

    const previewExcelFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON dengan raw: true untuk menjaga format angka
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1, // Array of arrays
                    raw: false,
                    defval: "",
                });

                console.log("Excel data preview:", jsonData.slice(0, 5));

                // Cari header row
                const headerRow = jsonData[0] || [];
                console.log("Header row:", headerRow);

                // Map kolom Excel ke nama field
                const columnMapping = {};
                headerRow.forEach((header, index) => {
                    if (header) {
                        const headerLower = header.toString().toLowerCase();
                        columnMapping[headerLower] = index;
                    }
                });

                console.log("Column mapping:", columnMapping);

                // Tampilkan preview data
                const previewData = jsonData.slice(1, 6).map((row) => {
                    // Ambil data berdasarkan mapping kolom
                    const getValue = (fieldName) => {
                        const index = columnMapping[fieldName];
                        return index !== undefined ? row[index] || "" : "";
                    };

                    return {
                        kodeOutlet:
                            getValue("kode outlet") ||
                            getValue("kode_outlet") ||
                            getValue("kode"),
                        namaOutlet:
                            getValue("nama outlet") ||
                            getValue("nama_outlet") ||
                            getValue("outlet") ||
                            getValue("nama"),
                        date:
                            getValue("tanggal") ||
                            getValue("date") ||
                            getValue("report_date"),
                        lob:
                            getValue("lob") ||
                            getValue("line of business") ||
                            getValue("business"),
                        omzetFnb:
                            getValue("omzet f&b") ||
                            getValue("omzet fnb") ||
                            getValue("omzet_fnb") ||
                            getValue("omzet fb"),
                        omzetCinema:
                            getValue("omzet cinema") ||
                            getValue("omzet_cinema") ||
                            getValue("cinema"),
                        totalBills:
                            getValue("jumlah bill") ||
                            getValue("jumlah_bill") ||
                            getValue("bill") ||
                            getValue("total bills"),
                        totalAudience:
                            getValue("jumlah penonton") ||
                            getValue("jumlah_penonton") ||
                            getValue("penonton") ||
                            getValue("audience"),
                        targetPercentage:
                            getValue("target (%)") ||
                            getValue("target") ||
                            getValue("target_percentage") ||
                            getValue("target %"),
                        targetHead:
                            getValue("target head") ||
                            getValue("target_head") ||
                            getValue("head"),
                        notes: getValue("catatan") || getValue("notes"),
                    };
                });

                console.log("Preview data:", previewData);
                setImportPreview(previewData);

                // Ambil ekstensi file untuk ditampilkan
                const fileNameParts = file.name.split(".");
                const fileExt =
                    fileNameParts.length > 1
                        ? fileNameParts[fileNameParts.length - 1].toUpperCase()
                        : "UNKNOWN";

                setImportDetails([
                    `File: ${file.name}`,
                    `Jumlah data: ${jsonData.length - 1} row`,
                    `Sheet: ${sheetName}`,
                    `Format: ${fileExt}`,
                ]);
            } catch (error) {
                console.error("Error reading Excel file:", error);
                setStatusMessage(
                    "Gagal membaca file Excel. Format mungkin tidak sesuai.",
                );
                setSubmitStatus("error");
                setShowImportError(true);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const downloadTemplate = () => {
        // Buat header sesuai format Excel Anda
        const headers = [
            "Kode Outlet",
            "Nama Outlet",
            "Tanggal",
            "LOB",
            "Omzet F&B",
            "Omzet Cinema",
            "Jumlah Bill",
            "Jumlah Penonton",
            "Target (%)",
            "Target Head",
            "Catatan",
        ];

        // Buat data contoh berdasarkan outlet yang ada di sistem
        const sampleData = [];

        outlets.slice(0, 3).forEach((outlet, index) => {
            sampleData.push([
                outlet.kode_outlet || `OUT${index + 1}`,
                outlet.nama_outlet || `Outlet ${index + 1}`,
                new Date().toISOString().split("T")[0],
                outlet.lob || "CAFE",
                "65231000",
                "88245000",
                "605",
                "1961",
                "68.34",
                "35595",
                `Contoh data untuk ${outlet.nama_outlet} - ${outlet.lob}`,
            ]);
        });

        // Tambahkan baris jika tidak ada outlet
        if (sampleData.length === 0) {
            sampleData.push([
                "NSR067-1201",
                "AEON BSD XXI",
                new Date().toISOString().split("T")[0],
                "CAFE",
                "65231000",
                "88245000",
                "605",
                "1961",
                "68.23", // TANPA PEMBULATAN
                "35595",
                "Contoh data untuk import",
            ]);
        }

        // Buat konten CSV
        let templateContent = headers.join(",") + "\n";
        sampleData.forEach((row) => {
            templateContent += row.join(",") + "\n";
        });

        // Tambahkan instruksi
        templateContent += "\n# INSTRUKSI IMPORT:\n";
        templateContent +=
            "# 1. Kode Outlet dan LOB HARUS sama persis dengan yang ada di sistem\n";
        templateContent +=
            "# 2. Format tanggal: YYYY-MM-DD atau YYYY-MM-DD HH:MM:SS\n";
        templateContent +=
            "# 3. Angka TANPA pemisah ribuan (contoh: 65231000 bukan 65.231.000)\n";
        templateContent +=
            "# 4. Target (%) dalam format persentase (contoh: 68.23) - nilai akan disimpan persis seperti di Excel\n";
        templateContent +=
            "# 5. Pastikan outlet dengan kombinasi Kode Outlet + LOB sudah terdaftar di sistem\n";

        // Buat blob dan download
        const blob = new Blob([templateContent], {
            type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);

        link.setAttribute("href", url);
        link.setAttribute("download", "template_import_laporan.csv");
        link.style.visibility = "hidden";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Fungsi untuk membulatkan angka sesuai dengan migration database
    const roundForDatabase = (num, decimals = 2) => {
        if (num === null || num === undefined || isNaN(num)) return 0;
        return parseFloat(num.toFixed(decimals));
    };

    // FUNGSI BARU: Untuk target percentage TANPA pembulatan
    const preserveTargetPercentage = (num) => {
        if (num === null || num === undefined || isNaN(num)) return 0;
        // **PERUBAHAN: Return langsung tanpa manipulasi**
        return parseFloat(num);
    };

    // Tambahkan fungsi delay helper di atas komponen
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const processImport = async () => {
        if (!importFile) {
            setStatusMessage("Silakan pilih file Excel terlebih dahulu.");
            setSubmitStatus("error");
            setShowImportError(true);
            return;
        }

        setIsImporting(true);
        setImportProgress(0);
        setImportSuccessCount(0);
        setImportErrorCount(0);
        setImportDetails([]);
        setShowImportError(false);
        setShowImportSuccess(false);
        setSubmitStatus(null);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];

                    // Convert ke JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                        raw: false,
                        defval: "",
                    });

                    console.log("=== IMPORT PROCESS START ===");
                    console.log("Total rows:", jsonData.length);

                    const results = [];
                    let successCount = 0;
                    let errorCount = 0;

                    const token = localStorage.getItem("token") || user?.token;
                    if (!token) {
                        throw new Error("Token tidak ditemukan");
                    }

                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    };

                    // Header row adalah baris pertama
                    const headerRow = jsonData[0] || [];
                    console.log("Header row:", headerRow);

                    // Buat mapping kolom
                    const columnMapping = {};
                    headerRow.forEach((header, index) => {
                        if (header) {
                            const headerLower = header
                                .toString()
                                .toLowerCase()
                                .trim();
                            columnMapping[headerLower] = index;
                        }
                    });

                    console.log("Column mapping:", columnMapping);

                    // Fungsi helper untuk ambil data
                    const getValue = (row, fieldNames) => {
                        for (const fieldName of fieldNames) {
                            const index = columnMapping[fieldName];
                            if (
                                index !== undefined &&
                                row[index] !== undefined
                            ) {
                                const value = row[index];
                                return value !== null && value !== undefined
                                    ? value.toString().trim()
                                    : "";
                            }
                        }
                        return "";
                    };

                    // Helper untuk membersihkan angka
                    const cleanNumber = (str) => {
                        if (
                            !str ||
                            str === "" ||
                            str === null ||
                            str === undefined
                        )
                            return "0";

                        console.log(`Cleaning: "${str}"`);

                        // Coba parse langsung
                        const directParse = parseFloat(str);
                        if (!isNaN(directParse)) {
                            console.log(`Direct parse success: ${directParse}`);
                            return directParse.toString();
                        }

                        // Remove non-numeric except dots, commas, and minus
                        let cleaned = str.toString().replace(/[^\d.,-]/g, "");

                        // If empty after cleaning
                        if (cleaned === "" || cleaned === "-") return "0";

                        // Handle multiple dots (thousand separators)
                        const dotCount = (cleaned.match(/\./g) || []).length;
                        if (dotCount > 1) {
                            // Multiple dots = thousand separators, remove them all
                            cleaned = cleaned.replace(/\./g, "");
                        }

                        // Handle comma as decimal separator
                        if (cleaned.includes(",")) {
                            cleaned = cleaned.replace(",", ".");
                        }

                        // Ensure only one decimal point
                        const parts = cleaned.split(".");
                        if (parts.length > 2) {
                            cleaned = parts[0] + "." + parts.slice(1).join("");
                        }

                        console.log(`After cleaning: "${cleaned}"`);
                        return cleaned;
                    };

                    // === PERBAIKAN: BATCH PROCESSING DENGAN DELAY ===
                    const BATCH_SIZE = 10; // 10 data per batch
                    const DELAY_BETWEEN_REQUESTS = 300; // 300ms delay antar request
                    const DELAY_AFTER_RATE_LIMIT = 2000; // 2 detik delay jika kena rate limit

                    // Split data into batches
                    const totalRows = jsonData.length - 1;
                    const batches = [];

                    for (let i = 1; i < jsonData.length; i += BATCH_SIZE) {
                        batches.push({
                            data: jsonData.slice(i, i + BATCH_SIZE),
                            startIndex: i,
                        });
                    }

                    console.log(
                        `Total batches: ${batches.length}, Batch size: ${BATCH_SIZE}`,
                    );

                    // Process each batch
                    for (
                        let batchIndex = 0;
                        batchIndex < batches.length;
                        batchIndex++
                    ) {
                        const batch = batches[batchIndex].data;
                        const startRowIndex = batches[batchIndex].startIndex;

                        console.log(
                            `Processing batch ${batchIndex + 1}/${batches.length}`,
                        );

                        // Process each row in batch
                        for (
                            let rowIndex = 0;
                            rowIndex < batch.length;
                            rowIndex++
                        ) {
                            const row = batch[rowIndex];
                            const absoluteRowIndex = startRowIndex + rowIndex;

                            if (!row || row.length === 0) continue;

                            console.log(
                                `\n=== Processing Row ${absoluteRowIndex + 1} ===`,
                            );

                            try {
                                // Deklarasikan variabel di dalam scope ini
                                let outlet = null;
                                let cleanDate = "";
                                let cleanOmzetFnb = "";
                                let cleanOmzetCinema = "";
                                let targetPercentNum = 0;

                                // Ambil data berdasarkan mapping
                                const kodeOutlet = getValue(row, [
                                    "kode outlet",
                                    "kode_outlet",
                                    "kode",
                                ]);

                                const namaOutlet = getValue(row, [
                                    "nama outlet",
                                    "nama_outlet",
                                    "outlet",
                                    "nama",
                                ]);

                                const date = getValue(row, [
                                    "tanggal",
                                    "date",
                                    "report_date",
                                ]);

                                const lob = getValue(row, [
                                    "lob",
                                    "line of business",
                                    "business",
                                    "line_of_business",
                                ]);

                                const omzetFnb = getValue(row, [
                                    "omzet f&b",
                                    "omzet fnb",
                                    "omzet_fnb",
                                    "omzet fb",
                                    "omzet f&b",
                                    "omzet f & b",
                                ]);

                                const omzetCinema = getValue(row, [
                                    "omzet cinema",
                                    "omzet_cinema",
                                    "cinema",
                                    "omzet cinemas",
                                    "omzet_cinemas",
                                ]);

                                const totalBills = getValue(row, [
                                    "jumlah bill",
                                    "jumlah_bill",
                                    "bill",
                                    "total bills",
                                    "total bill",
                                    "total_bill",
                                    "bills",
                                    "jumlah transaksi",
                                ]);

                                const totalAudience = getValue(row, [
                                    "jumlah penonton",
                                    "jumlah_penonton",
                                    "penonton",
                                    "audience",
                                    "jumlah penonton",
                                    "total audience",
                                    "total_audience",
                                    "total penonton",
                                ]);

                                const targetPercentage = getValue(row, [
                                    "target (%)",
                                    "target",
                                    "target_percentage",
                                    "target %",
                                    "target persen",
                                    "target_persen",
                                    "target%",
                                ]);

                                const targetHead = getValue(row, [
                                    "target head",
                                    "target_head",
                                    "head",
                                    "targethead",
                                ]);

                                const notes = getValue(row, [
                                    "catatan",
                                    "notes",
                                    "note",
                                    "keterangan",
                                ]);

                                // **1. Cari Outlet**
                                let searchMethod = "";

                                // Normalisasi LOB untuk pencarian
                                const normalizeLob = (lob) => {
                                    if (!lob) return "";
                                    const lobLower = lob.toLowerCase().trim();

                                    // Mapping khusus untuk LOB yang berbeda format
                                    const lobMapping = {
                                        cafe: "cafe",
                                        premiere: "premiere",
                                        hs: "hello sunday",
                                        "hello sunday": "hello sunday",
                                        hello_sunday: "hello sunday",
                                        "hello-sunday": "hello sunday",
                                    };

                                    return lobMapping[lobLower] || lobLower;
                                };

                                const normalizedLob = normalizeLob(lob);

                                // Cara 1: Cari dengan kode + lob (dengan normalisasi)
                                if (kodeOutlet && normalizedLob) {
                                    outlet = outlets.find(
                                        (o) =>
                                            o.kode_outlet &&
                                            o.lob &&
                                            o.kode_outlet.toString().trim() ===
                                                kodeOutlet.trim() &&
                                            normalizeLob(o.lob) ===
                                                normalizedLob,
                                    );
                                    if (outlet)
                                        searchMethod = "kode_lob_normalized";
                                }

                                // Cara 2: Cari dengan kode + lob (case insensitive exact)
                                if (!outlet && kodeOutlet && lob) {
                                    outlet = outlets.find(
                                        (o) =>
                                            o.kode_outlet &&
                                            o.lob &&
                                            o.kode_outlet.toString().trim() ===
                                                kodeOutlet.trim() &&
                                            o.lob.toLowerCase().trim() ===
                                                lob.toLowerCase().trim(),
                                    );
                                    if (outlet)
                                        searchMethod =
                                            "kode_lob_case_insensitive";
                                }

                                // Cara 3: Cari dengan kode + lob (partial match)
                                if (!outlet && kodeOutlet && lob) {
                                    outlet = outlets.find(
                                        (o) =>
                                            (o.kode_outlet &&
                                                o.lob &&
                                                o.kode_outlet
                                                    .toString()
                                                    .trim() ===
                                                    kodeOutlet.trim() &&
                                                normalizeLob(o.lob).includes(
                                                    normalizeLob(lob),
                                                )) ||
                                            normalizeLob(lob).includes(
                                                normalizeLob(o.lob),
                                            ),
                                    );
                                    if (outlet)
                                        searchMethod = "kode_lob_partial";
                                }

                                // Cara 4: Cari dengan kode saja
                                if (!outlet && kodeOutlet) {
                                    outlet = outlets.find(
                                        (o) =>
                                            o.kode_outlet &&
                                            o.kode_outlet.toString().trim() ===
                                                kodeOutlet.trim(),
                                    );
                                    if (outlet) searchMethod = "kode_exact";
                                }

                                // Cara 5: Cari dengan kode saja (case insensitive)
                                if (!outlet && kodeOutlet) {
                                    outlet = outlets.find(
                                        (o) =>
                                            o.kode_outlet &&
                                            o.kode_outlet
                                                .toString()
                                                .toLowerCase()
                                                .trim() ===
                                                kodeOutlet.toLowerCase().trim(),
                                    );
                                    if (outlet)
                                        searchMethod = "kode_case_insensitive";
                                }

                                if (!outlet) {
                                    const errorMsg = `❌ Outlet tidak ditemukan: ${
                                        kodeOutlet || namaOutlet
                                    } (LOB: ${lob})`;
                                    console.error(errorMsg);

                                    results.push({
                                        row: absoluteRowIndex + 1,
                                        status: "error",
                                        message: errorMsg,
                                    });
                                    errorCount++;
                                    setImportErrorCount(errorCount);
                                    continue;
                                }

                                console.log(
                                    `✓ Outlet ditemukan via ${searchMethod}:`,
                                    outlet,
                                );

                                // **2. Validasi Data**
                                const validationErrors = [];

                                // Tanggal
                                cleanDate = date;
                                if (date.includes(" ")) {
                                    cleanDate = date.split(" ")[0];
                                }
                                if (!cleanDate) {
                                    validationErrors.push("Tanggal kosong");
                                } else {
                                    const dateObj = new Date(cleanDate);
                                    if (isNaN(dateObj.getTime())) {
                                        validationErrors.push(
                                            `Format tanggal salah: ${date}`,
                                        );
                                    }
                                }

                                // Bersihkan angka
                                cleanOmzetFnb = cleanNumber(omzetFnb);
                                cleanOmzetCinema = cleanNumber(omzetCinema);
                                const cleanTargetPercentage =
                                    cleanNumber(targetPercentage);

                                // Validasi angka
                                if (isNaN(parseFloat(cleanOmzetFnb))) {
                                    validationErrors.push(
                                        `Omzet F&B bukan angka: ${omzetFnb} -> ${cleanOmzetFnb}`,
                                    );
                                }
                                if (isNaN(parseFloat(cleanOmzetCinema))) {
                                    validationErrors.push(
                                        `Omzet Cinema bukan angka: ${omzetCinema} -> ${cleanOmzetCinema}`,
                                    );
                                }
                                if (
                                    isNaN(
                                        parseInt(totalBills.replace(/\D/g, "")),
                                    )
                                ) {
                                    validationErrors.push(
                                        `Jumlah Bill bukan angka: ${totalBills}`,
                                    );
                                }
                                if (
                                    isNaN(
                                        parseInt(
                                            totalAudience.replace(/\D/g, ""),
                                        ),
                                    )
                                ) {
                                    validationErrors.push(
                                        `Jumlah Penonton bukan angka: ${totalAudience}`,
                                    );
                                }

                                // Target percentage handling - TANPA KONVERSI
                                targetPercentNum = parseFloat(
                                    cleanTargetPercentage,
                                );

                                if (isNaN(targetPercentNum)) {
                                    validationErrors.push(
                                        `Target (%) bukan angka: "${targetPercentage}" -> "${cleanTargetPercentage}"`,
                                    );
                                } else {
                                    // Validasi range 0-100
                                    if (targetPercentNum > 100) {
                                        validationErrors.push(
                                            `Target (%) > 100: ${targetPercentNum}`,
                                        );
                                    } else if (targetPercentNum < 0) {
                                        validationErrors.push(
                                            `Target (%) < 0: ${targetPercentNum}`,
                                        );
                                    }
                                }

                                if (validationErrors.length > 0) {
                                    console.error(
                                        "Validation errors:",
                                        validationErrors,
                                    );

                                    results.push({
                                        row: absoluteRowIndex + 1,
                                        status: "error",
                                        message: validationErrors.join(", "),
                                    });
                                    errorCount++;
                                    setImportErrorCount(errorCount);
                                    continue;
                                }

                                // **3. Prepare Payload dengan target percentage TANPA KONVERSI**
                                const payload = {
                                    outlet_id: outlet.id,
                                    report_date: cleanDate,
                                    omzet_fnb:
                                        roundForDatabase(
                                            parseFloat(cleanOmzetFnb),
                                            2,
                                        ) || 0,
                                    omzet_cinema:
                                        roundForDatabase(
                                            parseFloat(cleanOmzetCinema),
                                            2,
                                        ) || 0,
                                    total_bills:
                                        parseInt(
                                            totalBills.replace(/\D/g, ""),
                                        ) || 0,
                                    total_audience:
                                        parseInt(
                                            totalAudience.replace(/\D/g, ""),
                                        ) || 0,
                                    target_percentage:
                                        preserveTargetPercentage(
                                            targetPercentNum,
                                        ) || 0,
                                    target_head:
                                        parseInt(
                                            targetHead.replace(/\D/g, ""),
                                        ) || 0,
                                    notes: notes || "",
                                };

                                // **4. Send to API dengan retry logic untuk rate limiting**
                                const sendRequestWithRetry = async (
                                    retryCount = 0,
                                ) => {
                                    try {
                                        const response = await axios.post(
                                            `${API_BASE_URL}/reports`,
                                            payload,
                                            config,
                                        );

                                        if (response.data.success) {
                                            return {
                                                success: true,
                                                data: response.data,
                                            };
                                        } else {
                                            throw new Error(
                                                response.data.message ||
                                                    "Gagal import",
                                            );
                                        }
                                    } catch (error) {
                                        // Jika error 429 (rate limited), coba retry maksimal 2 kali
                                        if (
                                            error.response?.status === 429 &&
                                            retryCount < 2
                                        ) {
                                            console.log(
                                                `⚠️ Rate limited, retry ${retryCount + 1}/2 after ${DELAY_AFTER_RATE_LIMIT}ms`,
                                            );
                                            await delay(DELAY_AFTER_RATE_LIMIT);
                                            return sendRequestWithRetry(
                                                retryCount + 1,
                                            );
                                        }
                                        throw error;
                                    }
                                };

                                try {
                                    const result = await sendRequestWithRetry();

                                    if (result.success) {
                                        results.push({
                                            row: absoluteRowIndex + 1,
                                            status: "success",
                                            message: `✅ ${outlet.nama_outlet} (${outlet.kode_outlet}) - ${cleanDate}`,
                                        });
                                        successCount++;
                                        setImportSuccessCount(successCount);
                                    }
                                } catch (apiError) {
                                    let errorMessage = "Gagal import";

                                    if (apiError.response?.status === 429) {
                                        errorMessage =
                                            "Terlalu banyak request. Silakan coba lagi nanti.";
                                    } else if (
                                        apiError.response?.status === 422
                                    ) {
                                        const errors =
                                            apiError.response.data.errors;
                                        errorMessage = Object.values(
                                            errors || {},
                                        )
                                            .flat()
                                            .join(", ");
                                    } else if (
                                        apiError.response?.status === 500
                                    ) {
                                        errorMessage =
                                            "Server error. Silakan hubungi administrator.";
                                    } else if (
                                        apiError.response?.data?.message
                                    ) {
                                        errorMessage =
                                            apiError.response.data.message;
                                    } else if (apiError.message) {
                                        errorMessage = apiError.message;
                                    }

                                    console.error("API Error:", errorMessage);

                                    results.push({
                                        row: absoluteRowIndex + 1,
                                        status: "error",
                                        message: errorMessage,
                                    });
                                    errorCount++;
                                    setImportErrorCount(errorCount);
                                }

                                // **PERBAIKAN: Tambahkan delay antara setiap request**
                                if (rowIndex < batch.length - 1) {
                                    await delay(DELAY_BETWEEN_REQUESTS);
                                }
                            } catch (rowError) {
                                console.error(
                                    `Error processing row ${absoluteRowIndex + 1}:`,
                                    rowError,
                                );
                                results.push({
                                    row: absoluteRowIndex + 1,
                                    status: "error",
                                    message:
                                        rowError.message ||
                                        "Error processing row",
                                });
                                errorCount++;
                                setImportErrorCount(errorCount);
                            }

                            // Update progress
                            const progress = Math.round(
                                (absoluteRowIndex / totalRows) * 100,
                            );
                            setImportProgress(progress);
                        }

                        // Update progress setelah batch selesai
                        const batchProgress = Math.round(
                            ((batchIndex + 1) / batches.length) * 100,
                        );
                        setImportProgress(batchProgress);
                    }

                    console.log("=== IMPORT PROCESS END ===");
                    console.log("Results:", results);

                    setImportDetails(results.slice(-10)); // Hanya tampilkan 10 hasil terakhir

                    // Status akhir
                    if (successCount > 0) {
                        // IMPORT SUKSES - TAMPILKAN NOTIFIKASI BERHASIL
                        const successMessage = `✅ Import selesai: ${successCount} data berhasil diimport${errorCount > 0 ? `, ${errorCount} gagal` : ""}`;

                        setImportSuccessDetails({
                            successCount: successCount,
                            errorCount: errorCount,
                            totalRows: totalRows,
                            message: successMessage,
                        });

                        setShowImportSuccess(true);
                        setSubmitStatus("success");
                        setStatusMessage(successMessage);

                        // **PERBAIKAN: Tampilkan notifikasi sukses selama 3 detik lalu auto close**
                        setTimeout(() => {
                            // Tampilkan modal sukses dalam modal
                            setShowImportSuccess(true);

                            // Auto close modal setelah 3 detik
                            setTimeout(() => {
                                setShowImportModal(false);
                                resetImport();

                                // Redirect ke halaman reports setelah 1 detik
                                setTimeout(() => {
                                    navigate("/admin/reports");
                                }, 1000);
                            }, 3000);
                        }, 1000); // Tunggu 1 detik agar progress bar selesai
                    } else {
                        // IMPORT GAGAL TOTAL
                        const errorMessage = `❌ Import gagal: ${errorCount} error ditemukan`;
                        setStatusMessage(errorMessage);
                        setSubmitStatus("error");
                        setShowImportError(true);
                    }
                } catch (error) {
                    console.error("Error processing import:", error);
                    setStatusMessage(
                        `❌ Gagal memproses file: ${error.message}`,
                    );
                    setSubmitStatus("error");
                    setShowImportError(true);
                } finally {
                    setIsImporting(false);
                }
            };

            reader.onerror = (error) => {
                console.error("FileReader error:", error);
                setStatusMessage("❌ Gagal membaca file");
                setSubmitStatus("error");
                setShowImportError(true);
                setIsImporting(false);
            };

            reader.readAsArrayBuffer(importFile);
        } catch (error) {
            console.error("Error importing file:", error);
            setStatusMessage(`❌ Terjadi kesalahan: ${error.message}`);
            setSubmitStatus("error");
            setShowImportError(true);
            setIsImporting(false);
        }
    };

    useEffect(() => {
        if (submitStatus === "success" && showImportModal) {
            const timer = setTimeout(() => {
                setShowImportModal(false);
                resetImport();

                // Redirect setelah delay
                setTimeout(() => {
                    navigate("/admin/reports");
                }, 1000);
            }, 3000); // Auto close setelah 3 detik

            return () => clearTimeout(timer);
        }
    }, [submitStatus, showImportModal, navigate]);

    const resetImport = () => {
        setImportFile(null);
        setImportPreview([]);
        setImportProgress(0);
        setImportSuccessCount(0);
        setImportErrorCount(0);
        setImportDetails([]);
        setShowImportSuccess(false);
        setShowImportError(false);
        setImportSuccessDetails(null);
        setSubmitStatus(null);
        setStatusMessage("");
    };

    // ==================== RENDER ====================

    const calculateDerivedValues = () => {
        const omzetFnb = parseFloat(formData.omzet_fnb) || 0;
        const omzetCinema = parseFloat(formData.omzet_cinema) || 0;
        const totalBills = parseInt(formData.total_bills) || 0;
        const totalAudience = parseInt(formData.total_audience) || 0;
        const targetHead = parseInt(formData.target_head) || 0;

        return {
            totalOmzet: omzetFnb + omzetCinema,
            averagePerBill:
                totalBills > 0 ? (omzetFnb + omzetCinema) / totalBills : 0,
            achievementRate:
                targetHead > 0 ? (totalAudience / targetHead) * 100 : 0,
        };
    };

    const derivedValues = calculateDerivedValues();

    if (!user) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Memuat...</p>
            </div>
        );
    }

    if (user.role !== "admin") {
        return (
            <div style={styles.unauthorizedContainer}>
                <FontAwesomeIcon
                    icon={faExclamationCircle}
                    style={styles.unauthorizedIcon}
                />
                <h2 style={styles.unauthorizedTitle}>Akses Ditolak</h2>
                <p style={styles.unauthorizedText}>
                    Anda tidak memiliki izin untuk mengakses halaman ini.
                </p>
                <button
                    onClick={() => navigate("/dashboard")}
                    style={styles.backButton}
                >
                    Kembali ke Dashboard
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                {/* Header dengan button import */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.headerIcon}>
                            <FontAwesomeIcon icon={faFileAlt} />
                        </div>
                        <div style={styles.headerContent}>
                            <h1 style={styles.title}>Tambah Laporan Baru</h1>
                            <p style={styles.subtitle}>
                                Buat laporan manual atau import dari Excel
                            </p>
                        </div>
                    </div>
                    <div style={styles.headerRight}>
                        <button
                            onClick={() => setShowImportModal(true)}
                            style={styles.importButton}
                        >
                            <FontAwesomeIcon icon={faFileExcel} />
                            <span>Import dari Excel</span>
                        </button>
                        <button
                            onClick={downloadTemplate}
                            style={styles.templateButton}
                        >
                            <FontAwesomeIcon icon={faDownload} />
                            <span>Download Template</span>
                        </button>
                    </div>
                </div>

                {/* Notifikasi Success untuk Manual Submit */}
                {submitStatus === "success" &&
                    statusMessage &&
                    !showImportModal && (
                        <div style={styles.successAlert}>
                            <FontAwesomeIcon
                                icon={faCheckCircle}
                                style={{ marginRight: "0.5rem" }}
                            />
                            {statusMessage}
                        </div>
                    )}

                {/* Notifikasi Error untuk Manual Submit */}
                {submitStatus === "error" &&
                    statusMessage &&
                    !showImportModal && (
                        <div style={styles.errorAlert}>
                            <FontAwesomeIcon
                                icon={faExclamationCircle}
                                style={{ marginRight: "0.5rem" }}
                            />
                            {statusMessage}
                        </div>
                    )}

                {/* Form */}
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGrid}>
                        {/* Outlet */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FontAwesomeIcon
                                    icon={faStore}
                                    style={styles.labelIcon}
                                />
                                Outlet *
                            </label>
                            {isLoadingOutlets ? (
                                <div style={styles.loadingSelect}>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    <span>Memuat data outlet...</span>
                                </div>
                            ) : outlets.length === 0 ? (
                                <div style={styles.noDataSelect}>
                                    Tidak ada data outlet
                                </div>
                            ) : (
                                <select
                                    name="outlet_id"
                                    value={formData.outlet_id}
                                    onChange={handleOutletChange}
                                    style={styles.select}
                                    required
                                >
                                    <option value="">-- Pilih Outlet --</option>
                                    {(() => {
                                        const grouped = {};
                                        outlets.forEach((outlet) => {
                                            if (!grouped[outlet.nama_outlet]) {
                                                grouped[outlet.nama_outlet] =
                                                    [];
                                            }
                                            grouped[outlet.nama_outlet].push(
                                                outlet,
                                            );
                                        });

                                        return Object.keys(grouped).map(
                                            (nama) => (
                                                <optgroup
                                                    key={nama}
                                                    label={nama}
                                                >
                                                    {grouped[nama].map(
                                                        (outlet) => (
                                                            <option
                                                                key={`${outlet.id}-${outlet.lob}`}
                                                                value={
                                                                    outlet.id
                                                                }
                                                            >
                                                                {outlet.lob ||
                                                                    "No LOB"}
                                                            </option>
                                                        ),
                                                    )}
                                                </optgroup>
                                            ),
                                        );
                                    })()}
                                </select>
                            )}
                            {errors.outlet_id && (
                                <p style={styles.errorText}>
                                    {errors.outlet_id}
                                </p>
                            )}
                        </div>

                        {/* Tanggal Laporan */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FontAwesomeIcon
                                    icon={faCalendarAlt}
                                    style={styles.labelIcon}
                                />
                                Tanggal Laporan *
                            </label>
                            <input
                                type="date"
                                name="report_date"
                                value={formData.report_date}
                                onChange={handleInputChange}
                                style={styles.input}
                                disabled={isLoading}
                                max={new Date().toISOString().split("T")[0]}
                            />
                            {errors.report_date && (
                                <p style={styles.errorText}>
                                    {errors.report_date}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div style={styles.formActions}>
                        <button
                            type="button"
                            onClick={() => navigate("/admin/reports")}
                            style={styles.cancelButton}
                            disabled={isLoading}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                            <span>Batal</span>
                        </button>

                        <button
                            type="submit"
                            style={styles.submitButton}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faSave} />
                                    <span>Simpan Laporan</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Modal Import Excel */}
                {showImportModal && (
                    <div style={styles.modalOverlay}>
                        <div style={styles.modal}>
                            <div style={styles.modalHeader}>
                                <h2 style={styles.modalTitle}>
                                    <FontAwesomeIcon icon={faFileExcel} />
                                    <span>Import Data dari Excel</span>
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowImportModal(false);
                                        resetImport();
                                    }}
                                    style={styles.modalClose}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            <div style={styles.modalBody}>
                                {/* Notifikasi Status Import dalam Modal */}
                                {submitStatus && (
                                    <div
                                        style={{
                                            ...styles.modalStatusAlert,
                                            backgroundColor:
                                                submitStatus === "success"
                                                    ? "#d1fae5"
                                                    : "#fee2e2",
                                            color:
                                                submitStatus === "success"
                                                    ? "#065f46"
                                                    : "#dc2626",
                                            borderColor:
                                                submitStatus === "success"
                                                    ? "#a7f3d0"
                                                    : "#fca5a5",
                                        }}
                                    >
                                        <FontAwesomeIcon
                                            icon={
                                                submitStatus === "success"
                                                    ? faCheckCircle
                                                    : faExclamationCircle
                                            }
                                            style={{
                                                marginRight: "0.5rem",
                                            }}
                                        />
                                        {statusMessage}
                                    </div>
                                )}

                                {/* Notifikasi Sukses Detail dalam Modal */}
                                {submitStatus === "success" &&
                                    importSuccessDetails && (
                                        <div style={styles.modalSuccessAlert}>
                                            <div
                                                style={
                                                    styles.modalSuccessContent
                                                }
                                            >
                                                <FontAwesomeIcon
                                                    icon={faCheckCircle}
                                                    style={
                                                        styles.modalSuccessIcon
                                                    }
                                                />
                                                <div
                                                    style={
                                                        styles.modalSuccessText
                                                    }
                                                >
                                                    <h4
                                                        style={
                                                            styles.modalSuccessTitle
                                                        }
                                                    >
                                                        Import Berhasil! 🎉
                                                    </h4>
                                                    <p
                                                        style={
                                                            styles.modalSuccessMessage
                                                        }
                                                    >
                                                        {
                                                            importSuccessDetails.message
                                                        }
                                                    </p>
                                                    <div
                                                        style={
                                                            styles.modalSuccessStats
                                                        }
                                                    >
                                                        <div
                                                            style={
                                                                styles.modalSuccessStat
                                                            }
                                                        >
                                                            <span
                                                                style={
                                                                    styles.modalStatLabel
                                                                }
                                                            >
                                                                Total:
                                                            </span>
                                                            <span
                                                                style={
                                                                    styles.modalStatValue
                                                                }
                                                            >
                                                                {
                                                                    importSuccessDetails.totalRows
                                                                }{" "}
                                                                baris
                                                            </span>
                                                        </div>
                                                        <div
                                                            style={
                                                                styles.modalSuccessStat
                                                            }
                                                        >
                                                            <span
                                                                style={
                                                                    styles.modalStatLabel
                                                                }
                                                            >
                                                                Berhasil:
                                                            </span>
                                                            <span
                                                                style={{
                                                                    ...styles.modalStatValue,
                                                                    color: "#10b981",
                                                                }}
                                                            >
                                                                {
                                                                    importSuccessDetails.successCount
                                                                }{" "}
                                                                data
                                                            </span>
                                                        </div>
                                                        <div
                                                            style={
                                                                styles.modalSuccessStat
                                                            }
                                                        >
                                                            <span
                                                                style={
                                                                    styles.modalStatLabel
                                                                }
                                                            >
                                                                Gagal:
                                                            </span>
                                                            <span
                                                                style={{
                                                                    ...styles.modalStatValue,
                                                                    color: "#ef4444",
                                                                }}
                                                            >
                                                                {
                                                                    importSuccessDetails.errorCount
                                                                }{" "}
                                                                data
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <p
                                                        style={
                                                            styles.modalSuccessNote
                                                        }
                                                    >
                                                        Modal akan tertutup
                                                        otomatis dalam 3
                                                        detik...
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                {/* Template Info */}
                                <div style={styles.templateInfo}>
                                    <div style={styles.templateHeader}>
                                        <FontAwesomeIcon
                                            icon={faQuestionCircle}
                                        />
                                        <h4>Format File CSV/Excel</h4>
                                    </div>
                                    <p>
                                        File harus memiliki kolom berikut
                                        (format fleksibel):
                                    </p>

                                    <div style={styles.templateFormat}>
                                        <h5>📋 Format Kolom (urutan bebas):</h5>
                                        <ul style={styles.templateList}>
                                            <li>
                                                <strong>Kode Outlet</strong> -{" "}
                                                <span
                                                    style={{
                                                        color: "#059669",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    (WAJIB)
                                                </span>{" "}
                                                Kode outlet yang unik
                                            </li>
                                            <li>
                                                <strong>Nama Outlet</strong> -
                                                Nama outlet (opsional jika ada
                                                kode outlet)
                                            </li>
                                            <li>
                                                <strong>Tanggal</strong> -{" "}
                                                <span
                                                    style={{
                                                        color: "#059669",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    (WAJIB)
                                                </span>{" "}
                                                Format YYYY-MM-DD
                                            </li>
                                            <li>
                                                <strong>LOB</strong> -{" "}
                                                <span
                                                    style={{
                                                        color: "#059669",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    (WAJIB)
                                                </span>{" "}
                                                Line of Business (CAFE,
                                                PREMIERE, HS)
                                            </li>
                                            <li>
                                                <strong>Omzet F&B</strong> -{" "}
                                                <span
                                                    style={{
                                                        color: "#059669",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    (WAJIB)
                                                </span>{" "}
                                                Angka tanpa format ribuan
                                            </li>
                                            <li>
                                                <strong>Omzet Cinema</strong> -{" "}
                                                <span
                                                    style={{
                                                        color: "#059669",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    (WAJIB)
                                                </span>{" "}
                                                Angka tanpa format ribuan
                                            </li>
                                            <li>
                                                <strong>Jumlah Bill</strong> -{" "}
                                                <span
                                                    style={{
                                                        color: "#059669",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    (WAJIB)
                                                </span>{" "}
                                                Angka tanpa format
                                            </li>
                                            <li>
                                                <strong>Jumlah Penonton</strong>{" "}
                                                -{" "}
                                                <span
                                                    style={{
                                                        color: "#059669",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    (WAJIB)
                                                </span>{" "}
                                                Angka tanpa format
                                            </li>
                                            <li>
                                                <strong>Target (%)</strong> -{" "}
                                                <span
                                                    style={{
                                                        color: "#059669",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    (WAJIB)
                                                </span>{" "}
                                                Angka 0-100 (contoh: 68.34 untuk
                                                68.34%)
                                                <br />
                                                <span
                                                    style={{
                                                        color: "#3b82f6",
                                                        fontSize: "0.8rem",
                                                    }}
                                                >
                                                    * Nilai akan disimpan persis
                                                    seperti di Excel (tanpa
                                                    konversi)
                                                </span>
                                            </li>
                                            <li>
                                                <strong>Target Head</strong> -{" "}
                                                <span
                                                    style={{
                                                        color: "#059669",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    (WAJIB)
                                                </span>{" "}
                                                Angka tanpa format
                                            </li>
                                            <li>
                                                <strong>Catatan</strong> - Teks
                                                (opsional)
                                            </li>
                                        </ul>

                                        <h5>
                                            🏪 Contoh Data Outlet di Sistem:
                                        </h5>
                                        <div style={styles.outletsExample}>
                                            <table style={styles.exampleTable}>
                                                <thead>
                                                    <tr>
                                                        <th>Kode Outlet</th>
                                                        <th>Nama Outlet</th>
                                                        <th>LOB</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {outlets
                                                        .slice(0, 5)
                                                        .map((outlet, idx) => (
                                                            <tr key={idx}>
                                                                <td>
                                                                    <strong>
                                                                        {
                                                                            outlet.kode_outlet
                                                                        }
                                                                    </strong>
                                                                </td>
                                                                <td>
                                                                    {
                                                                        outlet.nama_outlet
                                                                    }
                                                                </td>
                                                                <td>
                                                                    <span
                                                                        style={{
                                                                            backgroundColor:
                                                                                "#dbeafe",
                                                                            padding:
                                                                                "2px 8px",
                                                                            borderRadius:
                                                                                "12px",
                                                                            fontSize:
                                                                                "0.8rem",
                                                                        }}
                                                                    >
                                                                        {
                                                                            outlet.lob
                                                                        }
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                            {outlets.length > 5 && (
                                                <p
                                                    style={{
                                                        fontSize: "0.8rem",
                                                        color: "#6b7280",
                                                    }}
                                                >
                                                    ... dan {outlets.length - 5}{" "}
                                                    outlet lainnya
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* File Upload */}
                                <div style={styles.uploadArea}>
                                    <label style={styles.uploadLabel}>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileUpload}
                                            style={styles.fileInput}
                                            disabled={
                                                isImporting ||
                                                submitStatus === "success"
                                            }
                                        />
                                        <div style={styles.uploadContent}>
                                            <FontAwesomeIcon
                                                icon={faUpload}
                                                style={styles.uploadIcon}
                                            />
                                            <p style={styles.uploadText}>
                                                {importFile
                                                    ? importFile.name
                                                    : "Klik untuk memilih file Excel"}
                                            </p>
                                            <p style={styles.uploadHint}>
                                                .xlsx, .xls, .csv
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {/* Download Template */}
                                <div style={styles.templateDownload}>
                                    <button
                                        onClick={downloadTemplate}
                                        style={styles.downloadButton}
                                        disabled={isImporting}
                                    >
                                        <FontAwesomeIcon icon={faDownload} />
                                        <span>Download Template</span>
                                    </button>
                                </div>

                                {/* Preview Data */}
                                {importPreview.length > 0 && (
                                    <div style={styles.previewContainer}>
                                        <h4 style={styles.previewTitle}>
                                            Preview Data (5 baris pertama)
                                        </h4>
                                        <div
                                            style={styles.previewTableContainer}
                                        >
                                            <table style={styles.previewTable}>
                                                <thead>
                                                    <tr>
                                                        <th>Kode Outlet</th>
                                                        <th>Nama Outlet</th>
                                                        <th>Tanggal</th>
                                                        <th>LOB</th>
                                                        <th>Omzet F&B</th>
                                                        <th>Target %</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {importPreview.map(
                                                        (row, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    {
                                                                        row.kodeOutlet
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {
                                                                        row.namaOutlet
                                                                    }
                                                                </td>
                                                                <td>
                                                                    {row.date}
                                                                </td>
                                                                <td>
                                                                    {row.lob}
                                                                </td>
                                                                <td>
                                                                    Rp{" "}
                                                                    {formatNumber(
                                                                        row.omzetFnb,
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <span
                                                                        style={{
                                                                            color: "#3b82f6",
                                                                            fontWeight:
                                                                                "500",
                                                                        }}
                                                                    >
                                                                        {
                                                                            row.targetPercentage
                                                                        }
                                                                        %
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div style={styles.previewStats}>
                                            <span>
                                                Total baris:{" "}
                                                {importPreview.length}
                                            </span>
                                            <span>
                                                Status:{" "}
                                                {submitStatus === "success"
                                                    ? "Import Selesai"
                                                    : "Siap diimport"}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Progress Bar */}
                                {isImporting && (
                                    <div style={styles.progressContainer}>
                                        <div style={styles.progressBar}>
                                            <div
                                                style={{
                                                    ...styles.progressFill,
                                                    width: `${importProgress}%`,
                                                }}
                                            />
                                        </div>
                                        <div style={styles.progressText}>
                                            Memproses... {importProgress}% (
                                            {importSuccessCount} berhasil,{" "}
                                            {importErrorCount} gagal)
                                        </div>
                                        <div style={styles.progressDetails}>
                                            <div style={styles.progressStat}>
                                                <span
                                                    style={{
                                                        color: "#10b981",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    ✓ {importSuccessCount}{" "}
                                                    Berhasil
                                                </span>
                                            </div>
                                            <div style={styles.progressStat}>
                                                <span
                                                    style={{
                                                        color: "#ef4444",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    ✗ {importErrorCount} Gagal
                                                </span>
                                            </div>
                                            <div style={styles.progressStat}>
                                                <span
                                                    style={{
                                                        color: "#3b82f6",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    📊 Total:{" "}
                                                    {importSuccessCount +
                                                        importErrorCount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Import Details */}
                                {importDetails.length > 0 &&
                                    !Array.isArray(importDetails[0]) &&
                                    importDetails.length > 0 && (
                                        <div style={styles.detailsContainer}>
                                            <h4>Detail Import</h4>
                                            <div style={styles.detailsList}>
                                                {importDetails.map(
                                                    (detail, index) => (
                                                        <div
                                                            key={index}
                                                            style={{
                                                                ...styles.detailItem,
                                                                color:
                                                                    detail.status ===
                                                                    "success"
                                                                        ? "#10b981"
                                                                        : "#ef4444",
                                                            }}
                                                        >
                                                            Baris {detail.row}:{" "}
                                                            {detail.message}
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}

                                {/* Auto Close Timer Info */}
                                {submitStatus === "success" && (
                                    <div
                                        style={{
                                            padding: "1rem",
                                            backgroundColor: "#f0f9ff",
                                            borderRadius: "8px",
                                            marginTop: "1rem",
                                            borderLeft: "4px solid #3b82f6",
                                        }}
                                    >
                                        <p
                                            style={{
                                                margin: 0,
                                                color: "#1e40af",
                                                fontSize: "0.9rem",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faClock} />
                                            <span>
                                                Modal akan tertutup otomatis
                                                dalam beberapa detik...
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div style={styles.modalFooter}>
                                <button
                                    onClick={() => {
                                        setShowImportModal(false);
                                        resetImport();
                                        if (submitStatus === "success") {
                                            setTimeout(() => {
                                                navigate("/admin/reports");
                                            }, 500);
                                        }
                                    }}
                                    style={styles.modalCancel}
                                    disabled={isImporting}
                                >
                                    {submitStatus === "success"
                                        ? "Tutup Sekarang"
                                        : "Batal"}
                                </button>
                                <button
                                    onClick={processImport}
                                    style={{
                                        ...styles.modalImport,
                                        backgroundColor:
                                            submitStatus === "success"
                                                ? "#10b981"
                                                : isImporting
                                                  ? "#6b7280"
                                                  : "#10b981",
                                        opacity:
                                            submitStatus === "success"
                                                ? 0.7
                                                : 1,
                                    }}
                                    disabled={
                                        !importFile ||
                                        isImporting ||
                                        submitStatus === "success"
                                    }
                                >
                                    {isImporting ? (
                                        <>
                                            <FontAwesomeIcon
                                                icon={faSpinner}
                                                spin
                                            />
                                            <span>Mengimport...</span>
                                        </>
                                    ) : submitStatus === "success" ? (
                                        <>
                                            <FontAwesomeIcon
                                                icon={faCheckCircle}
                                            />
                                            <span>Import Selesai</span>
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faUpload} />
                                            <span>Mulai Import</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "1rem",
    },
    content: {
        width: "100%",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        margin: "0 auto",
    },
    // Header dengan button import
    header: {
        padding: "2rem",
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "wrap",
        gap: "1rem",
    },
    headerLeft: {
        display: "flex",
        gap: "1rem",
        alignItems: "flex-start",
    },
    headerRight: {
        display: "flex",
        gap: "0.75rem",
        alignItems: "center",
        flexWrap: "wrap",
    },
    importButton: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#10b981",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "500",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#059669",
        },
    },
    templateButton: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "500",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
    },
    // Notifikasi Import Sukses
    importSuccessAlert: {
        margin: "1.5rem 2rem",
        padding: "1.5rem",
        backgroundColor: "#d1fae5",
        border: "1px solid #a7f3d0",
        borderRadius: "12px",
        color: "#065f46",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        animation: "slideIn 0.3s ease-out",
    },
    importSuccessContent: {
        display: "flex",
        gap: "1rem",
        alignItems: "flex-start",
        flex: 1,
    },
    importSuccessIcon: {
        fontSize: "2rem",
        color: "#10b981",
        marginTop: "0.25rem",
    },
    importSuccessText: {
        flex: 1,
    },
    importSuccessTitle: {
        margin: "0 0 0.5rem 0",
        fontSize: "1.25rem",
        fontWeight: "bold",
        color: "#065f46",
    },
    importSuccessMessage: {
        margin: "0 0 1rem 0",
        fontSize: "0.95rem",
        color: "#065f46",
    },
    importSuccessStats: {
        display: "flex",
        gap: "1.5rem",
        marginBottom: "0.75rem",
        flexWrap: "wrap",
    },
    successStat: {
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
    },
    statLabel: {
        fontSize: "0.85rem",
        color: "#047857",
        fontWeight: "500",
    },
    statValue: {
        fontSize: "1rem",
        fontWeight: "bold",
        color: "#065f46",
    },
    importSuccessNote: {
        margin: "0.5rem 0 0 0",
        fontSize: "0.85rem",
        color: "#059669",
        fontStyle: "italic",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        padding: "0.5rem 0.75rem",
        borderRadius: "6px",
        borderLeft: "3px solid #10b981",
    },
    importSuccessClose: {
        background: "none",
        border: "none",
        fontSize: "1rem",
        color: "#065f46",
        cursor: "pointer",
        padding: "0.25rem",
        borderRadius: "6px",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "rgba(16, 185, 129, 0.2)",
        },
    },
    // Notifikasi Error Import
    importErrorAlert: {
        margin: "1.5rem 2rem",
        padding: "1rem",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        borderRadius: "8px",
        borderLeft: "4px solid #ef4444",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontWeight: "500",
    },
    importErrorClose: {
        background: "none",
        border: "none",
        fontSize: "1rem",
        color: "#dc2626",
        cursor: "pointer",
        padding: "0.25rem",
        borderRadius: "6px",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "rgba(239, 68, 68, 0.2)",
        },
    },
    // Notifikasi Success Manual
    successAlert: {
        margin: "1.5rem 2rem",
        padding: "1rem",
        backgroundColor: "#d1fae5",
        color: "#065f46",
        borderRadius: "8px",
        borderLeft: "4px solid #10b981",
        display: "flex",
        alignItems: "center",
        fontWeight: "500",
    },
    errorAlert: {
        margin: "1.5rem 2rem",
        padding: "1rem",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        borderRadius: "8px",
        borderLeft: "4px solid #ef4444",
        display: "flex",
        alignItems: "center",
        fontWeight: "500",
    },
    // Modal Import
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
    },
    modal: {
        width: "100%",
        maxWidth: "800px",
        maxHeight: "90vh",
        backgroundColor: "white",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
    },
    modalHeader: {
        padding: "1.5rem 2rem",
        backgroundColor: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modalTitle: {
        margin: 0,
        fontSize: "1.5rem",
        fontWeight: "bold",
        color: "#1e293b",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
    },
    modalClose: {
        background: "none",
        border: "none",
        fontSize: "1.25rem",
        color: "#64748b",
        cursor: "pointer",
        padding: "0.5rem",
        borderRadius: "6px",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#e2e8f0",
            color: "#374151",
        },
    },
    modalBody: {
        padding: "2rem",
        overflowY: "auto",
        flex: 1,
    },
    modalFooter: {
        padding: "1.5rem 2rem",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "flex-end",
        gap: "1rem",
    },
    modalCancel: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#e5e7eb",
        },
    },
    modalImport: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#10b981",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "500",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#059669",
        },
    },
    // Status Alert di dalam modal
    modalStatusAlert: {
        margin: "1rem 0",
        padding: "1rem",
        borderRadius: "8px",
        borderLeft: "4px solid",
        display: "flex",
        alignItems: "center",
        fontWeight: "500",
    },
    // Template Info
    templateInfo: {
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "1.5rem",
        marginBottom: "1.5rem",
    },
    templateHeader: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "1rem",
        color: "#3b82f6",
    },
    templateList: {
        margin: "0.5rem 0 0 0",
        paddingLeft: "1.5rem",
        color: "#4b5563",
        lineHeight: "1.6",
        fontSize: "0.9rem",
    },
    // Upload Area
    uploadArea: {
        marginBottom: "1.5rem",
    },
    uploadLabel: {
        display: "block",
        cursor: "pointer",
    },
    fileInput: {
        display: "none",
    },
    uploadContent: {
        padding: "3rem",
        border: "2px dashed #d1d5db",
        borderRadius: "8px",
        backgroundColor: "#f9fafb",
        textAlign: "center",
        transition: "all 0.3s ease",
        "&:hover": {
            borderColor: "#10b981",
            backgroundColor: "#f0fdf4",
        },
    },
    uploadIcon: {
        fontSize: "3rem",
        color: "#9ca3af",
        marginBottom: "1rem",
    },
    uploadText: {
        fontSize: "1rem",
        fontWeight: "500",
        color: "#374151",
        marginBottom: "0.5rem",
    },
    uploadHint: {
        fontSize: "0.85rem",
        color: "#9ca3af",
    },
    // Template Download
    templateDownload: {
        marginBottom: "2rem",
    },
    downloadButton: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.95rem",
        fontWeight: "500",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
    },
    // Preview Container
    previewContainer: {
        marginBottom: "1.5rem",
    },
    previewTitle: {
        fontSize: "1rem",
        fontWeight: "600",
        color: "#1e293b",
        marginBottom: "1rem",
    },
    previewTableContainer: {
        overflowX: "auto",
        marginBottom: "1rem",
    },
    previewTable: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.85rem",
    },
    previewStats: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "0.85rem",
        color: "#6b7280",
    },
    // Progress Bar
    progressContainer: {
        margin: "1.5rem 0",
    },
    progressBar: {
        width: "100%",
        height: "8px",
        backgroundColor: "#e5e7eb",
        borderRadius: "4px",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#10b981",
        transition: "width 0.3s ease",
    },
    progressText: {
        fontSize: "0.9rem",
        color: "#374151",
        marginTop: "0.5rem",
        textAlign: "center",
    },
    progressDetails: {
        display: "flex",
        justifyContent: "center",
        gap: "2rem",
        marginTop: "0.5rem",
        fontSize: "0.85rem",
    },
    progressStat: {
        padding: "0.25rem 0.5rem",
    },
    // Details Container
    detailsContainer: {
        marginTop: "1.5rem",
        padding: "1rem",
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
    },
    detailsList: {
        maxHeight: "200px",
        overflowY: "auto",
        fontSize: "0.85rem",
    },
    detailItem: {
        padding: "0.5rem 0",
        borderBottom: "1px solid #e5e7eb",
    },
    detailMore: {
        padding: "0.5rem 0",
        color: "#6b7280",
        fontStyle: "italic",
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f8fafc",
    },
    spinner: {
        width: "50px",
        height: "50px",
        border: "5px solid #e2e8f0",
        borderTop: "5px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "1rem",
    },
    unauthorizedContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f8fafc",
        padding: "2rem",
        textAlign: "center",
    },
    unauthorizedIcon: {
        fontSize: "4rem",
        color: "#ef4444",
        marginBottom: "1.5rem",
    },
    unauthorizedTitle: {
        fontSize: "1.75rem",
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: "1rem",
    },
    unauthorizedText: {
        fontSize: "1rem",
        color: "#64748b",
        marginBottom: "2rem",
        maxWidth: "400px",
    },
    backButton: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "0.9rem",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#2563eb",
        },
    },
    headerIcon: {
        width: "60px",
        height: "60px",
        borderRadius: "12px",
        backgroundColor: "#10b981",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
    },
    headerContent: {
        flex: 1,
    },
    title: {
        margin: "0 0 0.5rem 0",
        color: "#1e293b",
        fontSize: "1.75rem",
        fontWeight: "bold",
    },
    subtitle: {
        margin: "0 0 0.25rem 0",
        color: "#64748b",
        fontSize: "0.95rem",
    },
    form: {
        padding: "2rem",
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1.5rem",
        marginBottom: "2rem",
    },
    formGroup: {
        marginBottom: "1.5rem",
    },
    label: {
        display: "flex",
        alignItems: "center",
        marginBottom: "0.5rem",
        fontWeight: "600",
        color: "#374151",
        fontSize: "0.95rem",
    },
    labelIcon: {
        marginRight: "0.5rem",
        fontSize: "0.9rem",
        color: "#6b7280",
    },
    input: {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.95rem",
        transition: "all 0.2s",
        backgroundColor: "white",
        boxSizing: "border-box",
        fontFamily: "inherit",
        "&:focus": {
            outline: "none",
            borderColor: "#10b981",
            boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
        },
    },
    select: {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.95rem",
        transition: "all 0.2s",
        backgroundColor: "white",
        boxSizing: "border-box",
        fontFamily: "inherit",
        cursor: "pointer",
        "&:focus": {
            outline: "none",
            borderColor: "#10b981",
            boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.1)",
        },
    },
    loadingSelect: {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.95rem",
        backgroundColor: "#f9fafb",
        color: "#6b7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    noDataSelect: {
        width: "100%",
        padding: "0.75rem 1rem",
        border: "2px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.95rem",
        backgroundColor: "#f9fafb",
        color: "#9ca3af",
        textAlign: "center",
        fontStyle: "italic",
    },
    errorText: {
        margin: "0.5rem 0 0 0",
        color: "#ef4444",
        fontSize: "0.85rem",
        fontWeight: "500",
    },
    formActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "1rem",
        paddingTop: "2rem",
        borderTop: "1px solid #e2e8f0",
    },
    cancelButton: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#f3f4f6",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "0.95rem",
        cursor: "pointer",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#e5e7eb",
        },
    },
    submitButton: {
        padding: "0.75rem 1.5rem",
        backgroundColor: "#10b981",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.95rem",
        cursor: "pointer",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        transition: "all 0.3s ease",
        "&:hover": {
            backgroundColor: "#059669",
        },
    },
    templateFormat: {
        marginTop: "1rem",
    },
    outletsExample: {
        marginTop: "1rem",
        padding: "1rem",
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
    },
    exampleTable: {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "0.85rem",
    },

    modalSuccessAlert: {
        margin: "1.5rem 0",
        padding: "1.25rem",
        backgroundColor: "#d1fae5",
        border: "1px solid #a7f3d0",
        borderRadius: "8px",
        color: "#065f46",
        animation: "slideIn 0.3s ease-out",
    },
    modalSuccessContent: {
        display: "flex",
        gap: "1rem",
        alignItems: "flex-start",
    },
    modalSuccessIcon: {
        fontSize: "1.5rem",
        color: "#10b981",
        marginTop: "0.25rem",
    },
    modalSuccessText: {
        flex: 1,
    },
    modalSuccessTitle: {
        margin: "0 0 0.5rem 0",
        fontSize: "1.1rem",
        fontWeight: "bold",
        color: "#065f46",
    },
    modalSuccessMessage: {
        margin: "0 0 1rem 0",
        fontSize: "0.95rem",
        color: "#065f46",
    },
    modalSuccessStats: {
        display: "flex",
        gap: "1.5rem",
        marginBottom: "0.75rem",
        flexWrap: "wrap",
    },
    modalSuccessStat: {
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
    },
    modalStatLabel: {
        fontSize: "0.85rem",
        color: "#047857",
        fontWeight: "500",
    },
    modalStatValue: {
        fontSize: "1rem",
        fontWeight: "bold",
        color: "#065f46",
    },
    modalSuccessNote: {
        margin: "0.5rem 0 0 0",
        fontSize: "0.85rem",
        color: "#059669",
        fontStyle: "italic",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        padding: "0.5rem 0.75rem",
        borderRadius: "6px",
        borderLeft: "3px solid #10b981",
    },
};

// Tambahkan style untuk animasi
const styleTag = document.createElement("style");
styleTag.innerHTML = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @keyframes slideIn {
        0% { transform: translateY(-20px); opacity: 0; }
        100% { transform: translateY(0); opacity: 1; }
    }

    /* Styling untuk tabel preview */
    .preview-table th {
        background-color: #f3f4f6;
        padding: 0.75rem;
        text-align: left;
        border: 1px solid #e5e7eb;
        font-weight: 600;
        color: "#374151";
    }

    .preview-table td {
        padding: 0.75rem;
        border: 1px solid #e5e7eb;
        color: "#4b5563";
    }

    .preview-table tr:nth-child(even) {
        background-color: "#f9fafb";
    }
`;
document.head.appendChild(styleTag);

export default ReportCreate;
