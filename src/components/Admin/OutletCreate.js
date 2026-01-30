import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faTimes,
  faStore,
  faBuilding,
  faList,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
  faFileImport,
  faDownload,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons";

const OutletCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State untuk form - TAMBAH field LOB
  const [formData, setFormData] = useState({
    kode_outlet: "",
    nama_outlet: "",
    lob: "Cafe", // Default value untuk LOB
  });

  // State untuk UI
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // State untuk import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(0);
  const [importFailed, setImportFailed] = useState(0);
  const [importPreview, setImportPreview] = useState([]);

  // API base URL
  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "https://nonspurious-rory-nonacoustically.ngrok-free.dev/api";

  // Cek jika user bukan admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validasi form - UBAH validasi kode_outlet
  const validateForm = () => {
    const newErrors = {};

    if (!formData.kode_outlet.trim()) {
      newErrors.kode_outlet = "Kode outlet wajib diisi";
    } else if (!/^[A-Za-z0-9\-_\s]+$/i.test(formData.kode_outlet)) {
      newErrors.kode_outlet =
        "Kode outlet hanya boleh berisi huruf, angka, spasi, dash (-), dan underscore (_)";
    }

    if (!formData.nama_outlet.trim()) {
      newErrors.nama_outlet = "Nama outlet wajib diisi";
    }

    // LOB tidak wajib (nullable), jadi tidak perlu validasi required

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitStatus(null);
    setStatusMessage("");

    try {
      // Get token
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

      // Prepare data - TAMBAH field LOB
      const payload = {
        kode_outlet: formData.kode_outlet,
        nama_outlet: formData.nama_outlet,
        lob: formData.lob,
      };

      console.log("Submitting outlet data:", payload);

      // Send request to API
      const response = await axios.post(
        `${API_BASE_URL}/outlets`,
        payload,
        config,
      );

      console.log("Outlet created successfully:", response.data);

      // Success
      setSubmitStatus("success");
      setStatusMessage("Outlet berhasil dibuat!");

      // Reset form after success
      setTimeout(() => {
        setFormData({
          kode_outlet: "",
          nama_outlet: "",
          lob: "Cafe",
        });

        // Redirect to outlets list after 2 seconds
        setTimeout(() => {
          navigate("/admin/outlets");
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error("Error creating outlet:", error);

      setSubmitStatus("error");

      if (error.response) {
        if (error.response.status === 422 && error.response.data.errors) {
          const backendErrors = error.response.data.errors;
          const formattedErrors = {};

          Object.keys(backendErrors).forEach((key) => {
            formattedErrors[key] = backendErrors[key][0];
          });

          setErrors(formattedErrors);
          setStatusMessage("Mohon periksa kembali data yang dimasukkan");
        } else if (error.response.status === 401) {
          setStatusMessage("Sesi telah berakhir. Silakan login kembali.");
        } else if (error.response.status === 403) {
          setStatusMessage("Anda tidak memiliki izin untuk melakukan aksi ini");
        } else {
          setStatusMessage(
            error.response.data.message ||
              "Terjadi kesalahan saat membuat outlet",
          );
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

  // Handle cancel
  const handleCancel = () => {
    navigate("/admin/outlets");
  };

  // Generate random kode outlet dengan format lebih fleksibel
  const generateRandomCode = () => {
    const prefix = "OUT";
    const randomNum = Math.floor(100 + Math.random() * 900);
    // Contoh dengan karakter khusus
    const specialChars = ["-", "_", " "];
    const randomChar =
      specialChars[Math.floor(Math.random() * specialChars.length)];
    const code = `${prefix}${randomChar}${randomNum}`;

    setFormData((prev) => ({
      ...prev,
      kode_outlet: code,
    }));
  };

  // ============ IMPORT FUNCTIONS ============

  // Handle file selection for import
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
        alert("Hanya file Excel/CSV yang diperbolehkan!");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB!");
        return;
      }

      setImportFile(file);
      previewFile(file);
    }
  };

  // Preview file content
  const previewFile = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;

      if (file.name.match(/\.csv$/)) {
        parseCSV(content);
      } else {
        // For Excel files, show a message that preview is not available
        setImportPreview([
          {
            kode_outlet: "File Excel",
            nama_outlet: "Preview tidak tersedia untuk file Excel",
            lob: "Gunakan CSV untuk preview",
          },
        ]);
      }
    };

    reader.readAsText(file);
  };

  // Parse CSV content
  const parseCSV = (content) => {
    // Normalize line endings
    content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    const lines = content.split("\n").filter((line) => line.trim() !== "");
    const previewData = [];

    if (lines.length === 0) {
      setImportErrors(["File CSV kosong"]);
      setImportPreview([]);
      return;
    }

    // Deteksi delimiter
    const firstLine = lines[0];
    let delimiter = ",";

    // Cek delimiter dengan lebih akurat
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const pipeCount = (firstLine.match(/\|/g) || []).length;

    const delimiterCounts = {
      ";": semicolonCount,
      ",": commaCount,
      "\t": tabCount,
      "|": pipeCount,
    };

    // Pilih delimiter dengan jumlah terbanyak
    const sortedDelimiters = Object.entries(delimiterCounts).sort(
      (a, b) => b[1] - a[1],
    );
    delimiter = sortedDelimiters[0][0];

    console.log(
      "Detected delimiter:",
      delimiter,
      "count:",
      sortedDelimiters[0][1],
    );

    // Get headers (first line)
    let headers;
    try {
      headers = firstLine.split(delimiter).map((h) => h.trim().toLowerCase());
    } catch (error) {
      console.error("Error parsing headers:", error);
      setImportErrors([
        "Gagal membaca header file. Format mungkin tidak sesuai.",
      ]);
      setImportPreview([]);
      return;
    }

    console.log("Headers found:", headers);

    // Mapping header yang lebih fleksibel
    const headerMapping = {};
    headers.forEach((header, index) => {
      const cleanHeader = header.toLowerCase().trim();

      // Check for kode_outlet variations
      if (cleanHeader.includes("kode") || cleanHeader.includes("code")) {
        headerMapping["kode_outlet"] = index;
      }
      // Check for nama_outlet variations
      if (
        cleanHeader.includes("nama") ||
        cleanHeader.includes("name") ||
        cleanHeader.includes("outlet")
      ) {
        headerMapping["nama_outlet"] = index;
      }
      // Check for LOB variations
      if (
        cleanHeader.includes("lob") ||
        cleanHeader.includes("line") ||
        cleanHeader.includes("business")
      ) {
        headerMapping["lob"] = index;
      }
    });

    console.log("Header mapping:", headerMapping);

    // Jika tidak menemukan mapping otomatis, coba tebak berdasarkan posisi
    if (!headerMapping["kode_outlet"] && headers.length >= 1) {
      headerMapping["kode_outlet"] = 0;
    }
    if (!headerMapping["nama_outlet"] && headers.length >= 2) {
      headerMapping["nama_outlet"] = 1;
    }
    if (!headerMapping["lob"] && headers.length >= 3) {
      headerMapping["lob"] = 2;
    }

    // Validasi minimal kolom
    if (
      headerMapping["kode_outlet"] === undefined ||
      headerMapping["nama_outlet"] === undefined
    ) {
      setImportErrors([
        "Format file tidak sesuai. Pastikan file memiliki minimal 2 kolom:",
        "1. Kode Outlet",
        "2. Nama Outlet",
        "3. LOB (opsional)",
        `Header yang ditemukan: ${headers.join(", ")}`,
      ]);
      setImportPreview([]);
      return;
    }

    // Parse first 5 rows for preview
    let hasData = false;
    for (let i = 1; i < Math.min(6, lines.length); i++) {
      if (lines[i].trim()) {
        let values;
        try {
          // Parse dengan delimiter yang benar
          if (delimiter === "\t") {
            values = lines[i].split("\t");
          } else {
            values = lines[i].split(delimiter);
          }

          // Clean values - hapus quotes jika ada
          const cleanedValues = values.map((v) => {
            let cleaned = v.trim();
            // Remove surrounding quotes
            if (
              (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
              (cleaned.startsWith("'") && cleaned.endsWith("'"))
            ) {
              cleaned = cleaned.slice(1, -1);
            }
            return cleaned;
          });

          const row = {
            kode_outlet: cleanedValues[headerMapping["kode_outlet"]] || "",
            nama_outlet: cleanedValues[headerMapping["nama_outlet"]] || "",
            lob:
              headerMapping["lob"] !== undefined
                ? cleanedValues[headerMapping["lob"]] || "Cafe"
                : "Cafe",
          };

          // Validasi row preview
          if (row.kode_outlet && row.nama_outlet) {
            previewData.push(row);
            hasData = true;
          }
        } catch (error) {
          console.error("Error parsing row:", error);
        }
      }
    }

    if (!hasData) {
      setImportErrors([
        "Tidak ada data yang dapat diproses. Pastikan file berisi data yang valid.",
        "Format yang diharapkan: kode_outlet;nama_outlet;lob",
      ]);
      setImportPreview([]);
      return;
    }

    setImportPreview(previewData);
    setImportErrors([]); // Clear errors jika sukses
  };

  // Download template
  const downloadTemplate = () => {
    // Create CSV template dengan delimiter ;
    const delimiter = ";";
    const headers = ["kode_outlet", "nama_outlet", "lob"];
    const exampleRows = [
      ["NSR067-1201", "AEON BSD XXI", "Cafe"],
      ["NSR068-1201", "ALAM SUTERA XXI", "Cafe"],
      ["NSR069-1201", "LIVING WORLD XXI", "Cafe"],
      ["NSR067-1202", "AEON BSD XXI", "Premiere"],
      ["NSR188-1204", "THE BREEZE XXI", "Hello Sunday"],
    ];

    let csvContent = headers.join(delimiter) + "\n";
    exampleRows.forEach((row) => {
      csvContent += row.join(delimiter) + "\n";
    });

    // Create download link
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "template_import_outlet.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle import submission
  const handleImportSubmit = async () => {
    if (!importFile) {
      alert("Pilih file terlebih dahulu!");
      return;
    }

    setIsImporting(true);
    setImportErrors([]);
    setImportSuccess(0);
    setImportFailed(0);

    try {
      const token = localStorage.getItem("token") || user?.token;

      if (!token) {
        throw new Error("Token tidak ditemukan");
      }

      const formData = new FormData();
      formData.append("file", importFile);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      // Send import request
      console.log("Sending import request...");
      const response = await axios.post(
        `${API_BASE_URL}/outlets/import`,
        formData,
        config,
      );

      console.log("Import response:", response.data);

      // Show results
      if (response.data.success) {
        const resultData = response.data.data || response.data;
        const successCount = resultData.success_count || 0;
        const failedCount = resultData.failed_count || 0;

        setImportSuccess(successCount);
        setImportFailed(failedCount);

        // Tampilkan pesan sukses
        setSubmitStatus("success");
        setStatusMessage(
          `Import berhasil! ${successCount} data berhasil diimport. ${failedCount > 0 ? `${failedCount} data gagal.` : ""}`,
        );

        if (resultData.errors && resultData.errors.length > 0) {
          setImportErrors(resultData.errors);
        }

        // Jika semua berhasil, close modal dan redirect setelah delay
        if (failedCount === 0) {
          setTimeout(() => {
            setShowImportModal(false);
            // Reset form import
            setImportFile(null);
            setImportPreview([]);
            // Redirect setelah 2 detik
            setTimeout(() => {
              navigate("/admin/outlets");
            }, 2000);
          }, 1500);
        }
      } else {
        setSubmitStatus("error");
        setStatusMessage(
          response.data.message || "Terjadi kesalahan saat import",
        );
        if (response.data.errors) {
          setImportErrors(
            Array.isArray(response.data.errors)
              ? response.data.errors
              : [response.data.errors],
          );
        }
      }
    } catch (error) {
      console.error("Import error:", error);

      setSubmitStatus("error");
      setImportSuccess(0);
      setImportFailed(0);

      if (error.response) {
        if (error.response.status === 422) {
          const errorData = error.response.data;
          let errorMessages = [];

          if (errorData.errors) {
            if (typeof errorData.errors === "object") {
              // Convert object errors to array
              Object.values(errorData.errors).forEach((err) => {
                if (Array.isArray(err)) {
                  errorMessages = errorMessages.concat(err);
                } else {
                  errorMessages.push(err);
                }
              });
            } else if (Array.isArray(errorData.errors)) {
              errorMessages = errorData.errors;
            } else {
              errorMessages = [errorData.message || "Validasi gagal"];
            }
          } else {
            errorMessages = [errorData.message || "Format file tidak valid"];
          }

          setImportErrors(errorMessages);
          setStatusMessage("Validasi file gagal. Periksa format file.");
        } else if (error.response.status === 401) {
          setImportErrors(["Sesi telah berakhir. Silakan login kembali."]);
          setStatusMessage("Autentikasi gagal");
        } else if (error.response.status === 405) {
          setImportErrors([
            "Metode tidak diizinkan. Pastikan backend support import.",
          ]);
          setStatusMessage("Endpoint import tidak tersedia");
        } else {
          setImportErrors([
            error.response.data?.message || "Terjadi kesalahan saat import",
          ]);
          setStatusMessage("Error dari server");
        }
      } else if (error.request) {
        setImportErrors([
          "Tidak dapat terhubung ke server. Periksa koneksi Anda.",
        ]);
        setStatusMessage("Koneksi gagal");
      } else {
        setImportErrors([error.message || "Terjadi kesalahan"]);
        setStatusMessage("Error tidak diketahui");
      }
    } finally {
      setIsImporting(false);
    }
  };

  // Reset import modal
  const resetImportModal = () => {
    setImportFile(null);
    setImportErrors([]);
    setImportPreview([]);
    setImportSuccess(0);
    setImportFailed(0);
    // Jangan reset submitStatus agar notifikasi tetap tampil
    setShowImportModal(false);
  };

  // Jika loading auth
  if (!user) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Memuat...</p>
      </div>
    );
  }

  // Jika bukan admin
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
          onClick={() => navigate("/admin/dashboard")}
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
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <FontAwesomeIcon icon={faStore} />
          </div>
          <div style={styles.headerContent}>
            <h1 style={styles.title}>Tambah Outlet Baru</h1>
            <p style={styles.subtitle}>
              Isi formulir di bawah untuk menambahkan outlet baru ke sistem atau
              import dari file
            </p>
            <p style={styles.subtitleSmall}>
              <strong>Catatan:</strong> Kode outlet dapat mengandung huruf,
              angka, spasi, dash (-), dan underscore (_)
            </p>
          </div>

          {/* Import Button */}
          <button
            onClick={() => setShowImportModal(true)}
            style={styles.importButton}
          >
            <FontAwesomeIcon
              icon={faFileImport}
              style={{ marginRight: "0.5rem" }}
            />
            Import dari File
          </button>
        </div>

        {/* Status Message */}
        {submitStatus && (
          <div
            style={{
              ...styles.statusAlert,
              backgroundColor:
                submitStatus === "success" ? "#d1fae5" : "#fee2e2",
              color: submitStatus === "success" ? "#065f46" : "#dc2626",
              borderColor: submitStatus === "success" ? "#a7f3d0" : "#fca5a5",
              margin: "0 0 1.5rem 0",
            }}
          >
            <FontAwesomeIcon
              icon={
                submitStatus === "success" ? faCheckCircle : faExclamationCircle
              }
              style={{ marginRight: "0.5rem" }}
            />
            {statusMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            {/* Kode Outlet */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faBuilding} style={styles.labelIcon} />
                Kode Outlet *
              </label>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  name="kode_outlet"
                  value={formData.kode_outlet}
                  onChange={handleInputChange}
                  placeholder="Misal: OUT-001, OUT_001, OUT 001"
                  style={{
                    ...styles.input,
                    borderColor: errors.kode_outlet ? "#ef4444" : "#d1d5db",
                  }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  style={styles.generateButton}
                  disabled={isLoading}
                >
                  Generate
                </button>
              </div>
              {errors.kode_outlet && (
                <p style={styles.errorText}>{errors.kode_outlet}</p>
              )}
              <p style={styles.helperText}>
                Kode unik untuk identifikasi outlet. Contoh: OUT-001, OUT_001,
                OUT 001, CAFE-01
              </p>
            </div>

            {/* Nama Outlet */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faStore} style={styles.labelIcon} />
                Nama Outlet *
              </label>
              <div style={styles.inputGroup}>
                <input
                  type="text"
                  name="nama_outlet"
                  value={formData.nama_outlet}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama outlet"
                  style={{
                    ...styles.input,
                    borderColor: errors.nama_outlet ? "#ef4444" : "#d1d5db",
                  }}
                  disabled={isLoading}
                />
              </div>
              {errors.nama_outlet && (
                <p style={styles.errorText}>{errors.nama_outlet}</p>
              )}
            </div>

            {/* LOB */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <FontAwesomeIcon icon={faList} style={styles.labelIcon} />
                LOB (Line of Business)
              </label>
              <select
                name="lob"
                value={formData.lob}
                onChange={handleInputChange}
                style={{
                  ...styles.select,
                  borderColor: errors.lob ? "#ef4444" : "#d1d5db",
                }}
                disabled={isLoading}
              >
                <option value="Cafe">Cafe</option>
                <option value="Premiere">Premiere</option>
                <option value="Hello Sunday">Hello Sunday</option>
              </select>
              {errors.lob && <p style={styles.errorText}>{errors.lob}</p>}
              <p style={styles.helperText}>Jenis bisnis outlet (opsional)</p>
            </div>
          </div>

          {/* Form Actions */}
          <div style={styles.formActions}>
            <button
              type="button"
              onClick={handleCancel}
              style={styles.cancelButton}
              disabled={isLoading}
            >
              <FontAwesomeIcon
                icon={faTimes}
                style={{ marginRight: "0.5rem" }}
              />
              Batal
            </button>
            <button
              type="submit"
              style={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    style={{ marginRight: "0.5rem" }}
                  />
                  Menyimpan...
                </>
              ) : (
                <>
                  <FontAwesomeIcon
                    icon={faSave}
                    style={{ marginRight: "0.5rem" }}
                  />
                  Simpan Outlet
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                <FontAwesomeIcon
                  icon={faFileImport}
                  style={{ marginRight: "0.5rem" }}
                />
                Import Outlet dari File
              </h2>
              <button onClick={resetImportModal} style={styles.modalClose}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div style={styles.modalBody}>
              {/* Download Template */}
              <div style={styles.templateSection}>
                <h3 style={styles.sectionTitle}>
                  <FontAwesomeIcon
                    icon={faDownload}
                    style={{
                      marginRight: "0.5rem",
                      color: "#3b82f6",
                    }}
                  />
                  Unduh Template
                </h3>
                <p style={styles.sectionText}>
                  Unduh template CSV untuk mengisi data outlet dengan format
                  yang benar.
                </p>
                <button
                  onClick={downloadTemplate}
                  style={styles.templateButton}
                >
                  <FontAwesomeIcon
                    icon={faFileExcel}
                    style={{ marginRight: "0.5rem" }}
                  />
                  Download Template CSV
                </button>
              </div>

              {/* File Upload */}
              <div style={styles.uploadSection}>
                <h3 style={styles.sectionTitle}>Upload File</h3>
                <p style={styles.sectionText}>
                  Upload file CSV (.csv) dengan data outlet. Format yang
                  didukung:
                </p>
                <ul
                  style={{
                    margin: "0 0 1rem 1.5rem",
                    color: "#64748b",
                    fontSize: "0.9rem",
                  }}
                >
                  <li>Delimiter: titik koma (;) atau koma (,)</li>
                  <li>Kolom wajib: kode_outlet, nama_outlet</li>
                  <li>Kolom opsional: lob</li>
                  <li>
                    Contoh: <code>kode_outlet;nama_outlet;lob</code>
                  </li>
                </ul>

                <div style={styles.fileUploadArea}>
                  <input
                    type="file"
                    id="fileInput"
                    accept=".csv"
                    onChange={handleFileSelect}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="fileInput" style={styles.fileUploadLabel}>
                    <FontAwesomeIcon
                      icon={faFileImport}
                      style={{
                        fontSize: "3rem",
                        marginBottom: "1rem",
                        color: "#6b7280",
                      }}
                    />
                    <p style={styles.uploadText}>Klik untuk memilih file CSV</p>
                    <p style={styles.uploadSubtext}>
                      Format: CSV dengan delimiter ; atau , (Maks. 5MB)
                    </p>
                    {!importFile && (
                      <div
                        style={{
                          marginTop: "1rem",
                          padding: "0.5rem 1rem",
                          backgroundColor: "#f3f4f6",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          color: "#6b7280",
                        }}
                      >
                        Contoh nama kolom: kode_outlet, nama_outlet, lob
                      </div>
                    )}
                  </label>

                  {importFile && (
                    <div style={styles.fileInfo}>
                      <FontAwesomeIcon
                        icon={faFileExcel}
                        style={{
                          color: "#10b981",
                          marginRight: "0.5rem",
                        }}
                      />
                      <span style={{ flex: 1 }}>{importFile.name}</span>
                      <span
                        style={{
                          color: "#6b7280",
                          fontSize: "0.85rem",
                        }}
                      >
                        {(importFile.size / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  )}
                </div>

                {/* Preview */}
                {importFile &&
                  importPreview.length === 0 &&
                  importErrors.length === 0 && (
                    <div
                      style={{
                        padding: "1rem",
                        backgroundColor: "#f0f9ff",
                        borderRadius: "8px",
                        marginTop: "1rem",
                        fontSize: "0.9rem",
                        color: "#0369a1",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faExclamationCircle}
                        style={{
                          marginRight: "0.5rem",
                        }}
                      />
                      Preview tidak tersedia atau file berformat Excel. Klik
                      "Import Data" untuk melanjutkan.
                    </div>
                  )}

                {/* Errors */}
                {importErrors.length > 0 && (
                  <div style={styles.errorBox}>
                    <h4 style={styles.errorTitle}>
                      <FontAwesomeIcon
                        icon={faExclamationCircle}
                        style={{
                          marginRight: "0.5rem",
                        }}
                      />
                      Error
                    </h4>
                    <ul style={styles.errorList}>
                      {importErrors.map((error, index) => (
                        <li key={index} style={styles.errorItem}>
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Import Results */}
                {(importSuccess > 0 || importFailed > 0) && (
                  <div style={styles.resultBox}>
                    <h4 style={styles.resultTitle}>Hasil Import</h4>
                    <div style={styles.resultStats}>
                      <div
                        style={{
                          ...styles.resultStat,
                          color: "#10b981",
                        }}
                      >
                        Berhasil: {importSuccess}
                      </div>
                      <div
                        style={{
                          ...styles.resultStat,
                          color: "#ef4444",
                        }}
                      >
                        Gagal: {importFailed}
                      </div>
                      <div
                        style={{
                          ...styles.resultStat,
                          color: "#3b82f6",
                        }}
                      >
                        Total: {importSuccess + importFailed}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={resetImportModal}
                style={styles.modalCancelButton}
                disabled={isImporting}
              >
                {importSuccess > 0 ? "Tutup" : "Batal"}
              </button>
              <button
                onClick={handleImportSubmit}
                style={{
                  ...styles.modalSubmitButton,
                  backgroundColor:
                    importSuccess > 0
                      ? "#10b981"
                      : importFailed > 0
                        ? "#f59e0b"
                        : "#10b981",
                }}
                disabled={!importFile || isImporting || importSuccess > 0}
              >
                {isImporting ? (
                  <>
                    <FontAwesomeIcon
                      icon={faSpinner}
                      spin
                      style={{ marginRight: "0.5rem" }}
                    />
                    Mengimport...
                  </>
                ) : importSuccess > 0 ? (
                  <>
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      style={{ marginRight: "0.5rem" }}
                    />
                    Import Selesai
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon
                      icon={faFileImport}
                      style={{ marginRight: "0.5rem" }}
                    />
                    Import Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Styles */}
      <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
    </div>
  );
};

// Updated styles dengan tambahan untuk import
const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "1rem",
    position: "relative",
  },
  content: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    overflow: "hidden",
    margin: "0 auto",
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
  },
  header: {
    padding: "2rem",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  headerIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    backgroundColor: "#3b82f6",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.5rem",
  },
  headerContent: {
    flex: 1,
    minWidth: "300px",
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
  subtitleSmall: {
    margin: 0,
    color: "#6b7280",
    fontSize: "0.85rem",
    fontStyle: "italic",
  },
  importButton: {
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
    transition: "all 0.3s ease",
    marginLeft: "auto",
  },
  statusAlert: {
    margin: "1.5rem 2rem",
    padding: "1rem",
    borderRadius: "8px",
    borderLeft: "4px solid",
    display: "flex",
    alignItems: "center",
    fontWeight: "500",
  },
  form: {
    padding: "2rem",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
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
  inputGroup: {
    display: "flex",
    gap: "0.5rem",
  },
  input: {
    flex: 1,
    padding: "0.75rem 1rem",
    border: "2px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.95rem",
    transition: "all 0.2s",
    backgroundColor: "white",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  generateButton: {
    padding: "0.75rem 1rem",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s",
    fontWeight: "500",
    flexShrink: 0,
  },
  errorText: {
    margin: "0.5rem 0 0 0",
    color: "#ef4444",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  helperText: {
    margin: "0.5rem 0 0 0",
    color: "#6b7280",
    fontSize: "0.85rem",
    fontStyle: "italic",
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
    transition: "all 0.3s ease",
  },
  submitButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    cursor: "pointer",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s ease",
  },

  // Modal Styles
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
  modalContent: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    width: "100%",
    maxWidth: "800px",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
  },
  modalHeader: {
    padding: "1.5rem 2rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.5rem",
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: "1.25rem",
    color: "#64748b",
    cursor: "pointer",
    padding: "0.5rem",
    borderRadius: "6px",
    transition: "all 0.2s",
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
  templateSection: {
    backgroundColor: "#f8fafc",
    padding: "1.5rem",
    borderRadius: "8px",
    marginBottom: "2rem",
  },
  sectionTitle: {
    margin: "0 0 0.75rem 0",
    fontSize: "1.1rem",
    color: "#1e293b",
    display: "flex",
    alignItems: "center",
  },
  sectionText: {
    margin: "0 0 1rem 0",
    color: "#64748b",
    fontSize: "0.95rem",
  },
  templateButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s ease",
    fontSize: "0.9rem",
  },
  uploadSection: {
    marginBottom: "2rem",
  },
  fileUploadArea: {
    border: "2px dashed #d1d5db",
    borderRadius: "8px",
    padding: "2rem",
    textAlign: "center",
    marginBottom: "1.5rem",
    transition: "all 0.3s ease",
  },
  fileUploadLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  uploadText: {
    margin: "0 0 0.5rem 0",
    color: "#374151",
    fontSize: "1rem",
  },
  uploadSubtext: {
    margin: 0,
    color: "#6b7280",
    fontSize: "0.85rem",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    padding: "1rem",
    backgroundColor: "#f3f4f6",
    borderRadius: "8px",
    marginTop: "1rem",
    border: "1px solid #d1d5db",
  },
  previewSection: {
    marginTop: "2rem",
  },
  previewTitle: {
    fontSize: "1rem",
    color: "#374151",
    marginBottom: "1rem",
    fontWeight: "600",
  },
  previewTableContainer: {
    overflowX: "auto",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  previewTable: {
    width: "100%",
    borderCollapse: "collapse",
  },
  previewTh: {
    padding: "0.75rem 1rem",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    textAlign: "left",
    fontWeight: "600",
    color: "#374151",
    fontSize: "0.9rem",
  },
  previewTd: {
    padding: "0.75rem 1rem",
    borderBottom: "1px solid #e2e8f0",
    color: "#374151",
    fontSize: "0.9rem",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "1.5rem",
    marginTop: "1.5rem",
  },
  errorTitle: {
    color: "#dc2626",
    margin: "0 0 1rem 0",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
  },
  errorList: {
    margin: 0,
    paddingLeft: "1.5rem",
  },
  errorItem: {
    color: "#991b1b",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
  },
  resultBox: {
    backgroundColor: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "8px",
    padding: "1.5rem",
    marginTop: "1.5rem",
  },
  resultTitle: {
    color: "#0369a1",
    margin: "0 0 1rem 0",
    fontSize: "1rem",
  },
  resultStats: {
    display: "flex",
    gap: "2rem",
  },
  resultStat: {
    fontSize: "1.25rem",
    fontWeight: "bold",
  },
  modalCancelButton: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "0.95rem",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  modalSubmitButton: {
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
    transition: "all 0.3s ease",
  },
};

export default OutletCreate;
