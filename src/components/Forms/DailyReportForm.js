import React, { useState, useEffect } from "react";
import { FiCalendar, FiUpload, FiDownload, FiPrinter } from "react-icons/fi";
import { MdOutlineStore, MdAttachMoney } from "react-icons/md";

const DailyReportForm = () => {
    const [formData, setFormData] = useState({
        reportDate: new Date().toISOString().split("T")[0],
        outletId: "",
        lob: "Cinema",
        totalVisitors: "",
        totalBills: "",
        omzetFnb: "",
        omzetCinema: "",
        otherIncome: "",
        notes: "",
        attachments: [],
    });

    const [outlets, setOutlets] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Dummy data outlets untuk contoh
    useEffect(() => {
        const dummyOutlets = [
            {
                id: 1,
                kode_outlet: "OUT001",
                nama_outlet: "Plaza Indonesia",
                lob: "Cinema",
            },
            {
                id: 2,
                kode_outlet: "OUT002",
                nama_outlet: "Grand Indonesia",
                lob: "FnB",
            },
            {
                id: 3,
                kode_outlet: "OUT003",
                nama_outlet: "Pacific Place",
                lob: "Cinema",
            },
            {
                id: 4,
                kode_outlet: "OUT004",
                nama_outlet: "Central Park",
                lob: "FnB",
            },
            {
                id: 5,
                kode_outlet: "OUT005",
                nama_outlet: "Pondok Indah Mall",
                lob: "Cinema",
            },
        ];
        setOutlets(dummyOutlets);
    }, []);

    // Hitung total omzet
    const calculateTotalOmzet = () => {
        const omzetFnb = parseFloat(formData.omzetFnb) || 0;
        const omzetCinema = parseFloat(formData.omzetCinema) || 0;
        const otherIncome = parseFloat(formData.otherIncome) || 0;
        return omzetFnb + omzetCinema + otherIncome;
    };

    // Hitung average bill
    const calculateAverageBill = () => {
        const totalBills = parseFloat(formData.totalBills) || 0;
        const totalOmzet = calculateTotalOmzet();
        return totalBills > 0 ? totalOmzet / totalBills : 0;
    };

    // Validasi form
    const validateForm = () => {
        const newErrors = {};

        if (!formData.outletId)
            newErrors.outletId = "Pilih outlet terlebih dahulu";
        if (!formData.reportDate)
            newErrors.reportDate = "Tanggal laporan harus diisi";
        if (!formData.totalVisitors)
            newErrors.totalVisitors = "Jumlah pengunjung harus diisi";
        if (!formData.totalBills)
            newErrors.totalBills = "Jumlah bill harus diisi";

        const omzetFnb = parseFloat(formData.omzetFnb);
        const omzetCinema = parseFloat(formData.omzetCinema);

        if (formData.lob === "FnB" && (!formData.omzetFnb || omzetFnb < 0)) {
            newErrors.omzetFnb = "Omzet FnB harus diisi dengan angka positif";
        }
        if (
            formData.lob === "Cinema" &&
            (!formData.omzetCinema || omzetCinema < 0)
        ) {
            newErrors.omzetCinema =
                "Omzet Cinema harus diisi dengan angka positif";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert("Harap perbaiki kesalahan sebelum mengirim");
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulasi API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const reportData = {
                ...formData,
                totalOmzet: calculateTotalOmzet(),
                averageBill: calculateAverageBill(),
                submittedAt: new Date().toISOString(),
            };

            console.log("Report data:", reportData);
            alert("Laporan harian berhasil disimpan!");

            // Reset form
            setFormData({
                reportDate: new Date().toISOString().split("T")[0],
                outletId: "",
                lob: "Cinema",
                totalVisitors: "",
                totalBills: "",
                omzetFnb: "",
                omzetCinema: "",
                otherIncome: "",
                notes: "",
                attachments: [],
            });
        } catch (error) {
            console.error("Error submitting report:", error);
            alert("Gagal menyimpan laporan: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData({
            ...formData,
            attachments: [
                ...formData.attachments,
                ...files.slice(0, 3 - formData.attachments.length),
            ],
        });
    };

    const removeAttachment = (index) => {
        setFormData({
            ...formData,
            attachments: formData.attachments.filter((_, i) => i !== index),
        });
    };

    const handleExportPDF = () => {
        alert("Fitur export PDF dalam pengembangan...");
    };

    const handlePrint = () => {
        window.print();
    };

    // Styles
    const styles = {
        container: {
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem",
        },
        header: {
            marginBottom: "2rem",
        },
        title: {
            fontSize: "2rem",
            fontWeight: "700",
            color: "#1e293b",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
        },
        subtitle: {
            color: "#64748b",
            fontSize: "1rem",
        },
        formContainer: {
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
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
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: "600",
            color: "#334155",
            fontSize: "0.9rem",
        },
        input: {
            width: "100%",
            padding: "0.75rem 1rem",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "1rem",
            transition: "all 0.3s ease",
        },
        inputError: {
            borderColor: "#ef4444",
            boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.1)",
        },
        select: {
            width: "100%",
            padding: "0.75rem 1rem",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "1rem",
            backgroundColor: "white",
            cursor: "pointer",
        },
        textarea: {
            width: "100%",
            padding: "0.75rem 1rem",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            fontSize: "1rem",
            minHeight: "120px",
            resize: "vertical",
        },
        errorText: {
            color: "#ef4444",
            fontSize: "0.85rem",
            marginTop: "0.25rem",
        },
        summaryCard: {
            background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
            borderRadius: "12px",
            padding: "1.5rem",
            marginBottom: "2rem",
            border: "1px solid #e2e8f0",
        },
        summaryTitle: {
            fontSize: "1.1rem",
            fontWeight: "600",
            marginBottom: "1rem",
            color: "#334155",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        },
        summaryGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
        },
        summaryItem: {
            background: "white",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid #f1f5f9",
        },
        summaryLabel: {
            fontSize: "0.85rem",
            color: "#64748b",
            marginBottom: "0.25rem",
        },
        summaryValue: {
            fontSize: "1.2rem",
            fontWeight: "600",
            color: "#1e293b",
        },
        fileUpload: {
            border: "2px dashed #cbd5e1",
            borderRadius: "8px",
            padding: "2rem",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
        },
        fileUploadHover: {
            borderColor: "#667eea",
            backgroundColor: "rgba(102, 126, 234, 0.05)",
        },
        fileList: {
            marginTop: "1rem",
        },
        fileItem: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.75rem",
            background: "#f8fafc",
            borderRadius: "6px",
            marginBottom: "0.5rem",
        },
        fileName: {
            flex: 1,
            marginLeft: "0.5rem",
            color: "#334155",
        },
        removeBtn: {
            background: "none",
            border: "none",
            color: "#ef4444",
            cursor: "pointer",
            padding: "0.25rem",
        },
        buttonGroup: {
            display: "flex",
            gap: "1rem",
            justifyContent: "flex-end",
            marginTop: "2rem",
        },
        submitButton: {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            padding: "0.75rem 2rem",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.3s ease",
        },
        secondaryButton: {
            background: "#f1f5f9",
            color: "#334155",
            border: "1px solid #e2e8f0",
            padding: "0.75rem 2rem",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.3s ease",
        },
        disabledButton: {
            opacity: 0.6,
            cursor: "not-allowed",
        },
    };

    const totalOmzet = calculateTotalOmzet();
    const averageBill = calculateAverageBill();

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <FiCalendar /> Laporan Harian
                </h1>
                <p style={styles.subtitle}>
                    Isi laporan penjualan harian untuk outlet Anda
                </p>
            </div>

            <div style={styles.formContainer}>
                <form onSubmit={handleSubmit}>
                    <div style={styles.formGrid}>
                        {/* Tanggal Laporan */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <FiCalendar style={{ marginRight: "0.5rem" }} />
                                Tanggal Laporan
                            </label>
                            <input
                                type="date"
                                value={formData.reportDate}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        reportDate: e.target.value,
                                    })
                                }
                                style={{
                                    ...styles.input,
                                    ...(errors.reportDate && styles.inputError),
                                }}
                                required
                            />
                            {errors.reportDate && (
                                <span style={styles.errorText}>
                                    {errors.reportDate}
                                </span>
                            )}
                        </div>

                        {/* Pilih Outlet */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                <MdOutlineStore
                                    style={{ marginRight: "0.5rem" }}
                                />
                                Pilih Outlet
                            </label>
                            <select
                                value={formData.outletId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        outletId: e.target.value,
                                    })
                                }
                                style={{
                                    ...styles.select,
                                    ...(errors.outletId && styles.inputError),
                                }}
                                required
                            >
                                <option value="">-- Pilih Outlet --</option>
                                {outlets.map((outlet) => (
                                    <option key={outlet.id} value={outlet.id}>
                                        {outlet.kode_outlet} -{" "}
                                        {outlet.nama_outlet} ({outlet.lob})
                                    </option>
                                ))}
                            </select>
                            {errors.outletId && (
                                <span style={styles.errorText}>
                                    {errors.outletId}
                                </span>
                            )}
                        </div>

                        {/* Line of Business */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Line of Business</label>
                            <select
                                value={formData.lob}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        lob: e.target.value,
                                    })
                                }
                                style={styles.select}
                            >
                                <option value="Cinema">Cinema</option>
                                <option value="FnB">Food & Beverage</option>
                            </select>
                        </div>

                        {/* Total Pengunjung */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Total Pengunjung</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.totalVisitors}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        totalVisitors: e.target.value,
                                    })
                                }
                                style={{
                                    ...styles.input,
                                    ...(errors.totalVisitors &&
                                        styles.inputError),
                                }}
                                required
                            />
                            {errors.totalVisitors && (
                                <span style={styles.errorText}>
                                    {errors.totalVisitors}
                                </span>
                            )}
                        </div>

                        {/* Total Bill */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Total Bill</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.totalBills}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        totalBills: e.target.value,
                                    })
                                }
                                style={{
                                    ...styles.input,
                                    ...(errors.totalBills && styles.inputError),
                                }}
                                required
                            />
                            {errors.totalBills && (
                                <span style={styles.errorText}>
                                    {errors.totalBills}
                                </span>
                            )}
                        </div>

                        {/* Omzet FnB */}
                        {formData.lob === "FnB" && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Omzet FnB (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={formData.omzetFnb}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            omzetFnb: e.target.value,
                                        })
                                    }
                                    style={{
                                        ...styles.input,
                                        ...(errors.omzetFnb &&
                                            styles.inputError),
                                    }}
                                    required={formData.lob === "FnB"}
                                />
                                {errors.omzetFnb && (
                                    <span style={styles.errorText}>
                                        {errors.omzetFnb}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Omzet Cinema */}
                        {formData.lob === "Cinema" && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Omzet Cinema (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={formData.omzetCinema}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            omzetCinema: e.target.value,
                                        })
                                    }
                                    style={{
                                        ...styles.input,
                                        ...(errors.omzetCinema &&
                                            styles.inputError),
                                    }}
                                    required={formData.lob === "Cinema"}
                                />
                                {errors.omzetCinema && (
                                    <span style={styles.errorText}>
                                        {errors.omzetCinema}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Pendapatan Lainnya */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Pendapatan Lainnya (Rp)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1000"
                                value={formData.otherIncome}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        otherIncome: e.target.value,
                                    })
                                }
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {/* Ringkasan */}
                    <div style={styles.summaryCard}>
                        <h3 style={styles.summaryTitle}>
                            <MdAttachMoney /> Ringkasan Laporan
                        </h3>
                        <div style={styles.summaryGrid}>
                            <div style={styles.summaryItem}>
                                <div style={styles.summaryLabel}>
                                    Total Omzet
                                </div>
                                <div style={styles.summaryValue}>
                                    Rp {totalOmzet.toLocaleString()}
                                </div>
                            </div>
                            <div style={styles.summaryItem}>
                                <div style={styles.summaryLabel}>
                                    Average Bill
                                </div>
                                <div style={styles.summaryValue}>
                                    Rp {averageBill.toLocaleString()}
                                </div>
                            </div>
                            <div style={styles.summaryItem}>
                                <div style={styles.summaryLabel}>
                                    Total Pengunjung
                                </div>
                                <div style={styles.summaryValue}>
                                    {formData.totalVisitors || 0}
                                </div>
                            </div>
                            <div style={styles.summaryItem}>
                                <div style={styles.summaryLabel}>
                                    Total Bill
                                </div>
                                <div style={styles.summaryValue}>
                                    {formData.totalBills || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Catatan */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Catatan (Opsional)</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    notes: e.target.value,
                                })
                            }
                            placeholder="Tambahkan catatan khusus atau keterangan tambahan..."
                            style={styles.textarea}
                        />
                    </div>

                    {/* Upload File */}
                    <div style={styles.formGroup}>
                        <label style={styles.label}>
                            <FiUpload style={{ marginRight: "0.5rem" }} />
                            Lampiran (Maks. 3 file)
                        </label>
                        <div style={styles.fileUpload}>
                            <input
                                type="file"
                                id="fileUpload"
                                style={{ display: "none" }}
                                onChange={handleFileUpload}
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
                            />
                            <label
                                htmlFor="fileUpload"
                                style={{ cursor: "pointer" }}
                            >
                                <FiUpload
                                    size={32}
                                    style={{
                                        color: "#64748b",
                                        marginBottom: "1rem",
                                    }}
                                />
                                <div style={{ color: "#64748b" }}>
                                    Klik atau drop file di sini (PDF, Image,
                                    Excel)
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.85rem",
                                        color: "#94a3b8",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    Maksimal 3 file, maks 5MB per file
                                </div>
                            </label>
                        </div>

                        {formData.attachments.length > 0 && (
                            <div style={styles.fileList}>
                                {formData.attachments.map((file, index) => (
                                    <div key={index} style={styles.fileItem}>
                                        <FiUpload />
                                        <span style={styles.fileName}>
                                            {file.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeAttachment(index)
                                            }
                                            style={styles.removeBtn}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Tombol Aksi */}
                    <div style={styles.buttonGroup}>
                        <button
                            type="button"
                            onClick={handleExportPDF}
                            style={styles.secondaryButton}
                        >
                            <FiDownload /> Export PDF
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            style={styles.secondaryButton}
                        >
                            <FiPrinter /> Cetak
                        </button>
                        <button
                            type="submit"
                            style={{
                                ...styles.submitButton,
                                ...(isSubmitting && styles.disabledButton),
                            }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Menyimpan..." : "Simpan Laporan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DailyReportForm;
