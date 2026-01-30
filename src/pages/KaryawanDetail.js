import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faEdit,
    faPrint,
    faDownload,
    faEnvelope,
    faPhone,
    faMapMarkerAlt,
    faCalendar,
    faVenusMars,
    faBuilding,
    faIdBadge,
    faUserCircle,
    faShieldAlt,
    faStore,
    faLocationDot,
    faGraduationCap,
    faBriefcase,
    faHeart,
    faStar,
    faLanguage,
    faCertificate,
    faFlag,
    faDna,
    faRing,
    faCross,
    faHospital,
} from "@fortawesome/free-solid-svg-icons";

const KaryawanDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [karyawan, setKaryawan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("personal");

    useEffect(() => {
        fetchKaryawanData();
    }, [id]);

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
            const data = await response.json();
            if (data.success) {
                setKaryawan(data.data);
            }
        } catch (error) {
            console.error("Error fetching karyawan:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const options = { year: "numeric", month: "long", day: "numeric" };
        return new Date(dateString).toLocaleDateString("id-ID", options);
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return "-";
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birth.getDate())
        ) {
            age--;
        }
        return age;
    };

    const calculateTenure = (joinDate) => {
        if (!joinDate) return "-";
        const today = new Date();
        const join = new Date(joinDate);
        const diffYears = today.getFullYear() - join.getFullYear();
        const diffMonths = today.getMonth() - join.getMonth();
        const months = diffYears * 12 + diffMonths;

        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        if (years === 0) {
            return `${remainingMonths} bulan`;
        } else if (remainingMonths === 0) {
            return `${years} tahun`;
        } else {
            return `${years} tahun ${remainingMonths} bulan`;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Aktif":
                return "#10b981";
            case "Tidak Aktif":
                return "#ef4444";
            case "Cuti":
                return "#f59e0b";
            default:
                return "#6b7280";
        }
    };

    const getGenderText = (code) => {
        return code === "L" ? "Laki-laki" : "Perempuan";
    };

    const getOutletInfo = () => {
        if (!karyawan?.outlet_id) {
            return {
                hasOutlet: false,
                text: "Tanpa Outlet",
                color: "#94a3b8",
            };
        }

        if (karyawan.outlet) {
            return {
                hasOutlet: true,
                text: karyawan.outlet.nama_outlet,
                code: karyawan.outlet.kode_outlet,
                color: "#10b981",
            };
        }

        return {
            hasOutlet: true,
            text: `Outlet ${karyawan.outlet_id}`,
            color: "#8b5cf6",
        };
    };

    const getFotoProfilUrl = () => {
        if (!karyawan) return null;

        // Jika ada foto_profil_url dari API
        if (karyawan.foto_profil_url) {
            return karyawan.foto_profil_url;
        }

        // Jika ada path di foto_profil
        if (karyawan.foto_profil) {
            // Cek apakah sudah ada http:// atau https://
            if (karyawan.foto_profil.startsWith("http")) {
                return karyawan.foto_profil;
            }
            // Jika path relatif
            return `http://localhost:8000/storage/${karyawan.foto_profil}`;
        }

        return null;
    };

    const handlePrint = () => {
        window.print();
    };

    const handleExport = () => {
        if (!karyawan) return;

        const dataStr = JSON.stringify(karyawan, null, 2);
        const dataUri =
            "data:application/json;charset=utf-8," +
            encodeURIComponent(dataStr);
        const exportFileDefaultName = `karyawan-${karyawan.nik}.json`;

        const linkElement = document.createElement("a");
        linkElement.setAttribute("href", dataUri);
        linkElement.setAttribute("download", exportFileDefaultName);
        linkElement.click();
    };

    const handleSendEmail = () => {
        if (!karyawan) return;
        window.location.href = `mailto:${karyawan.email}`;
    };

    const getAgamaIcon = (agama) => {
        switch (agama) {
            case "Islam":
                return faCross;
            case "Kristen":
                return faCross;
            case "Katolik":
                return faCross;
            case "Hindu":
                return faCross;
            case "Buddha":
                return faCross;
            case "Konghucu":
                return faCross;
            default:
                return faCross;
        }
    };

    const renderArrayField = (arrayData) => {
        try {
            let data = arrayData;

            // Jika data adalah string JSON, parse dulu
            if (typeof data === "string") {
                data = JSON.parse(data);
            }

            if (
                !data ||
                (typeof data === "string" && data.trim() === "") ||
                (Array.isArray(data) && data.length === 0)
            ) {
                return "-";
            }

            if (!Array.isArray(data)) {
                console.warn("Data bukan array:", data);
                return "-";
            }

            return data.map((item, index) => (
                <span key={index} style={styles.tag}>
                    {item}
                </span>
            ));
        } catch (error) {
            console.error("Error rendering array field:", error);
            return "-";
        }
    };

    const renderKeahlianWithLevel = () => {
        try {
            let keahlianData = karyawan?.keahlian_teknis;
            let tingkatKeahlianData = karyawan?.tingkat_keahlian;

            // Parse jika string JSON
            if (typeof keahlianData === "string") {
                keahlianData = JSON.parse(keahlianData);
            }
            if (typeof tingkatKeahlianData === "string") {
                tingkatKeahlianData = JSON.parse(tingkatKeahlianData);
            }

            if (
                !keahlianData ||
                (typeof keahlianData === "string" &&
                    keahlianData.trim() === "") ||
                (Array.isArray(keahlianData) && keahlianData.length === 0)
            ) {
                return "-";
            }

            if (!Array.isArray(keahlianData)) {
                console.warn("Keahlian teknis bukan array:", keahlianData);
                return "-";
            }

            return keahlianData.map((keahlian, index) => {
                const level = tingkatKeahlianData?.[keahlian] || "Pemula";
                return (
                    <div key={index} style={styles.skillItem}>
                        <span style={styles.skillName}>{keahlian}</span>
                        <span style={styles.skillLevel}>({level})</span>
                    </div>
                );
            });
        } catch (error) {
            console.error("Error rendering keahlian:", error);
            return "-";
        }
    };

    const renderBahasaWithLevel = () => {
        try {
            let bahasaData = karyawan?.bahasa_dikuasai;
            let tingkatBahasaData = karyawan?.tingkat_bahasa;

            // Parse jika string JSON
            if (typeof bahasaData === "string") {
                bahasaData = JSON.parse(bahasaData);
            }
            if (typeof tingkatBahasaData === "string") {
                tingkatBahasaData = JSON.parse(tingkatBahasaData);
            }

            if (
                !bahasaData ||
                (typeof bahasaData === "string" && bahasaData.trim() === "") ||
                (Array.isArray(bahasaData) && bahasaData.length === 0)
            ) {
                return "-";
            }

            if (!Array.isArray(bahasaData)) {
                console.warn("Bahasa dikuasai bukan array:", bahasaData);
                return "-";
            }

            return bahasaData.map((bahasa, index) => {
                const level = tingkatBahasaData?.[bahasa] || "Dasar";
                return (
                    <div key={index} style={styles.skillItem}>
                        <span style={styles.skillName}>{bahasa}</span>
                        <span style={styles.skillLevel}>({level})</span>
                    </div>
                );
            });
        } catch (error) {
            console.error("Error rendering bahasa:", error);
            return "-";
        }
    };

    const renderSertifikasi = () => {
        try {
            let sertifikasiData = karyawan?.sertifikasi;

            // Jika sertifikasi adalah string JSON, parse dulu
            if (typeof sertifikasiData === "string") {
                sertifikasiData = JSON.parse(sertifikasiData);
            }

            // Jika null/undefined/empty string, return "-"
            if (
                !sertifikasiData ||
                (typeof sertifikasiData === "string" &&
                    sertifikasiData.trim() === "") ||
                (Array.isArray(sertifikasiData) && sertifikasiData.length === 0)
            ) {
                return "-";
            }

            // Pastikan ini adalah array
            if (!Array.isArray(sertifikasiData)) {
                console.warn("Sertifikasi bukan array:", sertifikasiData);
                return "-";
            }

            return sertifikasiData.map((cert, index) => (
                <div key={index} style={styles.certItem}>
                    <div style={styles.certName}>{cert.nama || "-"}</div>
                    <div style={styles.certDetail}>
                        {cert.lembaga ? `${cert.lembaga}` : ""}
                        {cert.tahun ? ` • ${cert.tahun}` : ""}
                    </div>
                </div>
            ));
        } catch (error) {
            console.error("Error rendering sertifikasi:", error);
            return "-";
        }
    };

    const renderPrestasi = () => {
        try {
            let prestasiData = karyawan?.prestasi;

            // Jika prestasi adalah string JSON, parse dulu
            if (typeof prestasiData === "string") {
                prestasiData = JSON.parse(prestasiData);
            }

            // Jika null/undefined/empty string, return "-"
            if (
                !prestasiData ||
                (typeof prestasiData === "string" &&
                    prestasiData.trim() === "") ||
                (Array.isArray(prestasiData) && prestasiData.length === 0)
            ) {
                return "-";
            }

            // Pastikan ini adalah array
            if (!Array.isArray(prestasiData)) {
                console.warn("Prestasi bukan array:", prestasiData);
                return "-";
            }

            return prestasiData.map((prestasi, index) => (
                <div key={index} style={styles.achievementItem}>
                    <div style={styles.achievementName}>
                        {prestasi.nama || "-"}
                    </div>
                    <div style={styles.achievementDetail}>
                        {prestasi.tahun ? `${prestasi.tahun}` : ""}
                        {prestasi.deskripsi ? ` • ${prestasi.deskripsi}` : ""}
                    </div>
                </div>
            ));
        } catch (error) {
            console.error("Error rendering prestasi:", error);
            return "-";
        }
    };

    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Memuat data karyawan...</p>
            </div>
        );
    }

    if (!karyawan) {
        return (
            <div style={styles.notFoundContainer}>
                <h2>Data karyawan tidak ditemukan</h2>
                <button
                    onClick={() => navigate("/admin/karyawan")}
                    style={styles.backButton}
                >
                    Kembali ke Daftar
                </button>
            </div>
        );
    }

    const outletInfo = getOutletInfo();

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header} className="no-print">
                <button
                    onClick={() => navigate("/admin/karyawan")}
                    style={styles.backButton}
                >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span>Kembali</span>
                </button>

                <div style={styles.headerActions}>
                    <button
                        onClick={handleSendEmail}
                        style={styles.iconButton}
                        title="Kirim Email"
                    >
                        <FontAwesomeIcon icon={faEnvelope} />
                    </button>
                    <button
                        onClick={() => navigate(`/admin/karyawan/${id}/edit`)}
                        style={styles.iconButton}
                        title="Edit Data"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                        onClick={handleExport}
                        style={styles.iconButton}
                        title="Export Data"
                    >
                        <FontAwesomeIcon icon={faDownload} />
                    </button>
                    <button
                        onClick={handlePrint}
                        style={styles.iconButton}
                        title="Print"
                    >
                        <FontAwesomeIcon icon={faPrint} />
                    </button>
                </div>
            </div>

            {/* Profile Header */}
            <div style={styles.profileHeader}>
                <div style={styles.avatarContainer}>
                    <div style={styles.avatar}>
                        {getFotoProfilUrl() ? (
                            <img
                                src={getFotoProfilUrl()}
                                alt={karyawan.nama}
                                style={styles.avatarImage}
                                onError={(e) => {
                                    // Jika gagal load, show icon
                                    e.target.style.display = "none";
                                }}
                            />
                        ) : null}
                        <FontAwesomeIcon
                            icon={faUserCircle}
                            style={{
                                ...styles.avatarIcon,
                                display: getFotoProfilUrl() ? "none" : "block",
                            }}
                        />
                    </div>
                    <div style={styles.statusBadgeContainer}>
                        <span
                            style={{
                                ...styles.statusBadge,
                                backgroundColor: getStatusColor(
                                    karyawan.status_karyawan
                                ),
                            }}
                        >
                            {karyawan.status_karyawan || "Aktif"}
                        </span>
                    </div>
                </div>

                <div style={styles.profileInfo}>
                    <h1 style={styles.profileName}>{karyawan.nama}</h1>
                    <div style={styles.profileMeta}>
                        <div style={styles.metaItem}>
                            <FontAwesomeIcon
                                icon={faIdBadge}
                                style={styles.metaIcon}
                            />
                            <span style={styles.metaText}>{karyawan.nik}</span>
                        </div>
                        <div style={styles.metaItem}>
                            <FontAwesomeIcon
                                icon={faBuilding}
                                style={styles.metaIcon}
                            />
                            <span style={styles.metaText}>
                                {karyawan.department} • {karyawan.jabatan}
                                {karyawan.level_jabatan &&
                                    ` (${karyawan.level_jabatan})`}
                            </span>
                        </div>
                        <div style={styles.metaItem}>
                            <FontAwesomeIcon
                                icon={faStore}
                                style={{
                                    ...styles.metaIcon,
                                    color: outletInfo.color,
                                }}
                            />
                            <span style={styles.metaText}>
                                {outletInfo.text}
                                {outletInfo.code && ` (${outletInfo.code})`}
                            </span>
                        </div>
                        <div style={styles.metaItem}>
                            <FontAwesomeIcon
                                icon={faCalendar}
                                style={styles.metaIcon}
                            />
                            <span style={styles.metaText}>
                                Bergabung: {formatDate(karyawan.tanggal_masuk)}{" "}
                                • Masa Kerja:{" "}
                                {calculateTenure(karyawan.tanggal_masuk)}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={styles.profileStats}>
                    <div style={styles.statItem}>
                        <div style={styles.statValue}>ID-{karyawan.id}</div>
                        <div style={styles.statLabel}>Employee ID</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statValue}>
                            {calculateAge(karyawan.tanggal_lahir)}
                        </div>
                        <div style={styles.statLabel}>Usia</div>
                    </div>
                    <div style={styles.statItem}>
                        <div style={styles.statValue}>
                            {karyawan.jenis_karyawan || "Tetap"}
                        </div>
                        <div style={styles.statLabel}>Jenis Karyawan</div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs} className="no-print">
                <button
                    onClick={() => setActiveTab("personal")}
                    style={{
                        ...styles.tab,
                        ...(activeTab === "personal" && styles.activeTab),
                    }}
                >
                    <FontAwesomeIcon icon={faUserCircle} /> Data Pribadi
                </button>
                <button
                    onClick={() => setActiveTab("education")}
                    style={{
                        ...styles.tab,
                        ...(activeTab === "education" && styles.activeTab),
                    }}
                >
                    <FontAwesomeIcon icon={faGraduationCap} /> Pendidikan
                </button>
                <button
                    onClick={() => setActiveTab("work")}
                    style={{
                        ...styles.tab,
                        ...(activeTab === "work" && styles.activeTab),
                    }}
                >
                    <FontAwesomeIcon icon={faBriefcase} /> Pekerjaan
                </button>
                <button
                    onClick={() => setActiveTab("skills")}
                    style={{
                        ...styles.tab,
                        ...(activeTab === "skills" && styles.activeTab),
                    }}
                >
                    <FontAwesomeIcon icon={faStar} /> Keahlian & Minat
                </button>
                <button
                    onClick={() => setActiveTab("identity")}
                    style={{
                        ...styles.tab,
                        ...(activeTab === "identity" && styles.activeTab),
                    }}
                >
                    <FontAwesomeIcon icon={faShieldAlt} /> Identitas
                </button>
                <button
                    onClick={() => setActiveTab("contact")}
                    style={{
                        ...styles.tab,
                        ...(activeTab === "contact" && styles.activeTab),
                    }}
                >
                    <FontAwesomeIcon icon={faEnvelope} /> Kontak
                </button>
            </div>

            {/* Tab Content */}
            <div style={styles.tabContent}>
                {activeTab === "personal" && (
                    <div style={styles.infoGrid}>
                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faUserCircle} /> Data
                                Pribadi
                            </h3>
                            <div style={styles.infoList}>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>NIK:</span>
                                    <span style={styles.infoValue}>
                                        {karyawan.nik}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Nama Lengkap:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.nama}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Tempat/Tanggal Lahir:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.tempat_lahir || "-"},{" "}
                                        {formatDate(karyawan.tanggal_lahir)}
                                        {karyawan.tanggal_lahir &&
                                            ` (${calculateAge(
                                                karyawan.tanggal_lahir
                                            )} tahun)`}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Jenis Kelamin:
                                    </span>
                                    <span style={styles.infoValue}>
                                        <FontAwesomeIcon
                                            icon={faVenusMars}
                                            style={styles.infoIcon}
                                        />
                                        {getGenderText(karyawan.jenis_kelamin)}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Agama:</span>
                                    <span style={styles.infoValue}>
                                        {karyawan.agama || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Status Pernikahan:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.status_pernikahan || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Golongan Darah:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.golongan_darah || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faHeart} /> Hobi & Minat
                            </h3>
                            <div style={styles.infoList}>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Hobi:</span>
                                    <span style={styles.infoValue}>
                                        <div style={styles.tagsContainer}>
                                            {renderArrayField(karyawan.hobi)}
                                        </div>
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Minat Khusus:
                                    </span>
                                    <span style={styles.infoValue}>
                                        <div style={styles.tagsContainer}>
                                            {renderArrayField(
                                                karyawan.minat_khusus
                                            )}
                                        </div>
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Pengalaman Organisasi:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.organisasi || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "education" && (
                    <div style={styles.infoGrid}>
                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faGraduationCap} />{" "}
                                Pendidikan Formal
                            </h3>
                            <div style={styles.infoList}>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Pendidikan Terakhir:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.pendidikan_terakhir || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Nama Institusi:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.nama_sekolah_universitas ||
                                            "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Jurusan:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.jurusan || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Tahun Lulus:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.tahun_lulus || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faCertificate} />{" "}
                                Sertifikasi
                            </h3>
                            <div style={styles.certificationContainer}>
                                {renderSertifikasi()}
                            </div>
                        </div>

                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faFlag} /> Prestasi
                            </h3>
                            <div style={styles.achievementContainer}>
                                {renderPrestasi()}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "work" && (
                    <div style={styles.infoGrid}>
                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faBriefcase} /> Detail
                                Pekerjaan
                            </h3>
                            <div style={styles.infoList}>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Department:
                                    </span>
                                    <span style={styles.infoValue}>
                                        <FontAwesomeIcon
                                            icon={faBuilding}
                                            style={styles.infoIcon}
                                        />
                                        {karyawan.department}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Jabatan:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.jabatan}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Level Jabatan:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.level_jabatan || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Jenis Karyawan:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.jenis_karyawan || "Tetap"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Tanggal Masuk:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {formatDate(karyawan.tanggal_masuk)}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Tanggal Kontrak Berakhir:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {formatDate(
                                            karyawan.tanggal_kontrak_berakhir
                                        ) || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Outlet:
                                    </span>
                                    <span style={styles.infoValue}>
                                        <FontAwesomeIcon
                                            icon={faStore}
                                            style={styles.infoIcon}
                                        />
                                        {outletInfo.text}
                                        {outletInfo.code &&
                                            ` (${outletInfo.code})`}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faShieldAlt} /> Status &
                                Karir
                            </h3>
                            <div style={styles.infoList}>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Status Karyawan:
                                    </span>
                                    <span style={styles.infoValue}>
                                        <span
                                            style={{
                                                ...styles.statusInline,
                                                backgroundColor: getStatusColor(
                                                    karyawan.status_karyawan
                                                ),
                                            }}
                                        >
                                            {karyawan.status_karyawan ||
                                                "Aktif"}
                                        </span>
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Masa Kerja:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {calculateTenure(
                                            karyawan.tanggal_masuk
                                        )}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Aspirasi Karir:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.aspirasi_karir || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Target Karir 5 Tahun:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.target_karir_5tahun || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Terakhir Diupdate:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {formatDate(karyawan.updated_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "skills" && (
                    <div style={styles.infoGrid}>
                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faStar} /> Keahlian
                                Teknis
                            </h3>
                            <div style={styles.skillsContainer}>
                                {renderKeahlianWithLevel()}
                            </div>
                        </div>

                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faHeart} /> Soft Skills
                            </h3>
                            <div style={styles.tagsContainer}>
                                {renderArrayField(karyawan.soft_skills)}
                            </div>
                        </div>

                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faLanguage} /> Bahasa
                            </h3>
                            <div style={styles.skillsContainer}>
                                {renderBahasaWithLevel()}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "identity" && (
                    <div style={styles.infoGrid}>
                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faIdBadge} /> Identitas &
                                Asuransi
                            </h3>
                            <div style={styles.infoList}>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>NPWP:</span>
                                    <span style={styles.infoValue}>
                                        {karyawan.npwp || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        BPJS Kesehatan:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.bpjs_kesehatan || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        BPJS Ketenagakerjaan:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.bpjs_ketenagakerjaan || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faPhone} /> Kontak
                                Darurat
                            </h3>
                            <div style={styles.infoList}>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Nama Kontak Darurat:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.kontak_darurat_nama || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Hubungan:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.kontak_darurat_hubungan ||
                                            "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Telepon Kontak Darurat:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.kontak_darurat_telepon || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "contact" && (
                    <div style={styles.infoGrid}>
                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faEnvelope} /> Kontak
                            </h3>
                            <div style={styles.infoList}>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Email:</span>
                                    <span style={styles.infoValue}>
                                        <FontAwesomeIcon
                                            icon={faEnvelope}
                                            style={styles.infoIcon}
                                        />
                                        <a
                                            href={`mailto:${karyawan.email}`}
                                            style={styles.emailLink}
                                        >
                                            {karyawan.email}
                                        </a>
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Telepon:
                                    </span>
                                    <span style={styles.infoValue}>
                                        <FontAwesomeIcon
                                            icon={faPhone}
                                            style={styles.infoIcon}
                                        />
                                        <a
                                            href={`tel:${karyawan.telepon}`}
                                            style={styles.phoneLink}
                                        >
                                            {karyawan.telepon}
                                        </a>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={styles.infoCard}>
                            <h3 style={styles.infoTitle}>
                                <FontAwesomeIcon icon={faMapMarkerAlt} /> Alamat
                            </h3>
                            <div style={styles.infoList}>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Alamat Lengkap:
                                    </span>
                                    <span style={styles.infoValue}>
                                        <FontAwesomeIcon
                                            icon={faMapMarkerAlt}
                                            style={styles.infoIcon}
                                        />
                                        {karyawan.alamat}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>Kota:</span>
                                    <span style={styles.infoValue}>
                                        {karyawan.kota || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Provinsi:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.provinsi || "-"}
                                    </span>
                                </div>
                                <div style={styles.infoItem}>
                                    <span style={styles.infoLabel}>
                                        Kode Pos:
                                    </span>
                                    <span style={styles.infoValue}>
                                        {karyawan.kode_pos || "-"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {karyawan.outlet && (
                            <div style={styles.infoCard}>
                                <h3 style={styles.infoTitle}>
                                    <FontAwesomeIcon icon={faStore} /> Alamat
                                    Outlet
                                </h3>
                                <div style={styles.infoList}>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>
                                            Nama Outlet:
                                        </span>
                                        <span style={styles.infoValue}>
                                            {karyawan.outlet.nama_outlet}
                                        </span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>
                                            Alamat Outlet:
                                        </span>
                                        <span style={styles.infoValue}>
                                            <FontAwesomeIcon
                                                icon={faLocationDot}
                                                style={styles.infoIcon}
                                            />
                                            {karyawan.outlet.alamat}
                                        </span>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <span style={styles.infoLabel}>
                                            Telepon Outlet:
                                        </span>
                                        <span style={styles.infoValue}>
                                            <a
                                                href={`tel:${karyawan.outlet.telepon}`}
                                                style={styles.phoneLink}
                                            >
                                                {karyawan.outlet.telepon}
                                            </a>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Notes */}
            <div style={styles.footerNotes} className="no-print">
                <div style={styles.note}>
                    <strong>Catatan:</strong> Data karyawan ini bersifat rahasia
                    dan hanya dapat diakses oleh pihak yang berwenang.
                </div>
                <div style={styles.timestamp}>
                    Terakhir diupdate:{" "}
                    {new Date(karyawan.updated_at).toLocaleString("id-ID")}
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "1.5rem",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
    },
    backButton: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 1.25rem",
        backgroundColor: "#f1f5f9",
        color: "#475569",
        border: "none",
        borderRadius: "8px",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#e2e8f0",
        },
    },
    headerActions: {
        display: "flex",
        gap: "0.5rem",
    },
    iconButton: {
        width: "40px",
        height: "40px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f5f9",
        color: "#475569",
        fontSize: "1rem",
        transition: "all 0.2s ease",
        cursor: "pointer",
        border: "none",
        "&:hover": {
            backgroundColor: "#e2e8f0",
        },
    },
    profileHeader: {
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        paddingBottom: "2rem",
        borderBottom: "1px solid #e2e8f0",
        marginBottom: "2rem",
        flexWrap: "wrap",
    },
    avatarContainer: {
        position: "relative",
    },
    avatar: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        backgroundColor: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "4px solid white",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    avatarIcon: {
        fontSize: "5rem",
        color: "#94a3b8",
    },
    statusBadgeContainer: {
        position: "absolute",
        bottom: "10px",
        right: "5px",
    },
    statusBadge: {
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: "500",
        color: "white",
        display: "inline-block",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
    profileInfo: {
        flex: 1,
        minWidth: "300px",
    },
    profileName: {
        fontSize: "1.75rem",
        fontWeight: "bold",
        color: "#1e293b",
        margin: "0 0 0.5rem 0",
    },
    profileMeta: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
    },
    metaItem: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    metaIcon: {
        color: "#94a3b8",
        fontSize: "0.9rem",
        minWidth: "16px",
    },
    metaText: {
        fontSize: "0.9rem",
        color: "#64748b",
    },
    profileStats: {
        display: "flex",
        gap: "2rem",
        backgroundColor: "#f8fafc",
        padding: "1.5rem",
        borderRadius: "12px",
        minWidth: "300px",
    },
    statItem: {
        textAlign: "center",
        flex: 1,
    },
    statValue: {
        fontSize: "1.25rem",
        fontWeight: "bold",
        color: "#1e293b",
        marginBottom: "0.25rem",
    },
    statLabel: {
        fontSize: "0.8rem",
        color: "#64748b",
    },
    tabs: {
        display: "flex",
        borderBottom: "1px solid #e2e8f0",
        marginBottom: "2rem",
        flexWrap: "wrap",
        gap: "0.5rem",
    },
    tab: {
        padding: "1rem 1.5rem",
        backgroundColor: "transparent",
        color: "#64748b",
        border: "none",
        fontSize: "0.95rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s ease",
        borderBottom: "2px solid transparent",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        "&:hover": {
            color: "#3b82f6",
        },
    },
    activeTab: {
        color: "#3b82f6",
        borderBottom: "2px solid #3b82f6",
    },
    tabContent: {
        minHeight: "300px",
    },
    infoGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
        gap: "1.5rem",
    },
    infoCard: {
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        padding: "1.5rem",
        border: "1px solid #e2e8f0",
    },
    infoTitle: {
        fontSize: "1.1rem",
        fontWeight: "600",
        color: "#334155",
        margin: "0 0 1.25rem 0",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        paddingBottom: "0.75rem",
        borderBottom: "1px solid #e2e8f0",
    },
    infoList: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    infoItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "1rem",
    },
    infoLabel: {
        fontSize: "0.9rem",
        color: "#64748b",
        fontWeight: "500",
        minWidth: "140px",
    },
    infoValue: {
        fontSize: "0.9rem",
        color: "#1e293b",
        textAlign: "right",
        flex: 1,
        lineHeight: 1.5,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    infoIcon: {
        color: "#94a3b8",
        fontSize: "0.9rem",
    },
    statusInline: {
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
        fontSize: "0.8rem",
        fontWeight: "500",
        color: "white",
        display: "inline-block",
    },
    emailLink: {
        color: "#3b82f6",
        textDecoration: "none",
        "&:hover": {
            textDecoration: "underline",
        },
    },
    phoneLink: {
        color: "#059669",
        textDecoration: "none",
        "&:hover": {
            textDecoration: "underline",
        },
    },
    tagsContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
    },
    tag: {
        padding: "0.25rem 0.75rem",
        backgroundColor: "#e0f2fe",
        color: "#0369a1",
        borderRadius: "4px",
        fontSize: "0.8rem",
    },
    skillsContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
    },
    skillItem: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0.5rem 0.75rem",
        backgroundColor: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
    },
    skillName: {
        fontWeight: "500",
        color: "#334155",
    },
    skillLevel: {
        fontSize: "0.8rem",
        color: "#64748b",
        fontStyle: "italic",
    },
    certificationContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    certItem: {
        padding: "0.75rem",
        backgroundColor: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
    },
    certName: {
        fontWeight: "500",
        color: "#334155",
        marginBottom: "0.25rem",
    },
    certDetail: {
        fontSize: "0.8rem",
        color: "#64748b",
    },
    achievementContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    },
    achievementItem: {
        padding: "0.75rem",
        backgroundColor: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "6px",
    },
    achievementName: {
        fontWeight: "500",
        color: "#334155",
        marginBottom: "0.25rem",
    },
    achievementDetail: {
        fontSize: "0.8rem",
        color: "#64748b",
    },
    footerNotes: {
        marginTop: "2rem",
        paddingTop: "1.5rem",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.85rem",
        color: "#64748b",
        flexWrap: "wrap",
        gap: "1rem",
    },
    note: {
        flex: 1,
        minWidth: "200px",
    },
    timestamp: {
        textAlign: "right",
    },
    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        color: "#64748b",
    },
    spinner: {
        width: "50px",
        height: "50px",
        border: "4px solid #e2e8f0",
        borderTop: "4px solid #3b82f6",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        marginBottom: "1rem",
    },
    notFoundContainer: {
        textAlign: "center",
        padding: "3rem",
        color: "#64748b",
    },
};

// Add spinner animation
const styleElement = document.createElement("style");
styleElement.innerHTML = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @media print {
        .no-print {
            display: none !important;
        }
        
        .container {
            box-shadow: none !important;
            padding: 0 !important;
        }
        
        .header, .headerActions, .tabs, .footerNotes {
            display: none !important;
        }
        
        .profileHeader {
            border: none !important;
            margin-bottom: 1rem !important;
        }
        
        .infoCard {
            break-inside: avoid;
            page-break-inside: avoid;
        }
        
        .infoGrid {
            display: block !important;
        }
        
        .infoCard {
            margin-bottom: 1rem !important;
        }
    }
`;
document.head.appendChild(styleElement);

export default KaryawanDetail;
