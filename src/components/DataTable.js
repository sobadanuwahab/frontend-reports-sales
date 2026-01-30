import React, { useState } from "react";
import {
    Search,
    RefreshCw,
    Trash2,
    Edit,
    ChevronUp,
    ChevronDown,
    Filter,
    Grid,
    List,
    CheckSquare,
    Square,
} from "react-feather";

const DataTable = ({ outlets, loading, onDelete, onRefresh, onEdit }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: "asc",
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState([]);
    const [viewMode, setViewMode] = useState("table"); // 'table' atau 'card'

    // Filter outlets berdasarkan search term
    const filteredOutlets = outlets.filter(
        (outlet) =>
            outlet.kode_outlet
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            outlet.nama_outlet
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            outlet.lob?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort data
    const sortedOutlets = [...filteredOutlets].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedOutlets.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentOutlets = sortedOutlets.slice(
        indexOfFirstItem,
        indexOfLastItem
    );

    // Sort handler
    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // Row selection handler
    const toggleRowSelection = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id)
                ? prev.filter((rowId) => rowId !== id)
                : [...prev, id]
        );
    };

    // Select all rows
    const toggleSelectAll = () => {
        if (selectedRows.length === currentOutlets.length) {
            setSelectedRows([]);
        } else {
            setSelectedRows(currentOutlets.map((outlet) => outlet.id));
        }
    };

    // Delete selected rows
    const handleDeleteSelected = () => {
        if (
            window.confirm(
                `Anda yakin ingin menghapus ${selectedRows.length} outlet?`
            )
        ) {
            selectedRows.forEach((id) => onDelete(id));
            setSelectedRows([]);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <p>Memuat data outlet...</p>
            </div>
        );
    }

    // Render sort icon
    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return <ChevronUp size={14} style={{ opacity: 0.3 }} />;
        }
        return sortConfig.direction === "asc" ? (
            <ChevronUp size={14} />
        ) : (
            <ChevronDown size={14} />
        );
    };

    // Render badge color based on LOB
    const getLobBadgeColor = (lob) => {
        const lobLower = lob?.toLowerCase() || "";
        if (lobLower.includes("retail") || lobLower.includes("ritel")) {
            return { background: "#dcfce7", color: "#166534" };
        }
        if (lobLower.includes("wholesale") || lobLower.includes("grosir")) {
            return { background: "#fef3c7", color: "#92400e" };
        }
        if (lobLower.includes("online")) {
            return { background: "#dbeafe", color: "#1e40af" };
        }
        return { background: "#e5e7eb", color: "#374151" };
    };

    // Render checkbox icon
    const renderCheckboxIcon = (checked) => {
        return checked ? (
            <CheckSquare size={18} />
        ) : (
            <Square size={18} style={{ opacity: 0.5 }} />
        );
    };

    // Card view for mobile
    const renderCardView = () => {
        return (
            <div style={styles.cardContainer}>
                {currentOutlets.length === 0 ? (
                    <div style={styles.emptyState}>
                        <Filter
                            size={48}
                            style={{ marginBottom: "1rem", opacity: 0.5 }}
                        />
                        <p>Tidak ada data outlet yang ditemukan</p>
                    </div>
                ) : (
                    currentOutlets.map((outlet) => {
                        const badgeStyle = getLobBadgeColor(outlet.lob);
                        const isSelected = selectedRows.includes(outlet.id);

                        return (
                            <div
                                key={outlet.id}
                                style={{
                                    ...styles.card,
                                    backgroundColor: isSelected
                                        ? "#e0f2fe"
                                        : "white",
                                }}
                            >
                                <div style={styles.cardHeader}>
                                    <div
                                        onClick={() =>
                                            toggleRowSelection(outlet.id)
                                        }
                                        style={styles.checkboxIcon}
                                    >
                                        {renderCheckboxIcon(isSelected)}
                                    </div>
                                    <div style={styles.cardTitle}>
                                        <h3 style={styles.kodeOutlet}>
                                            {outlet.kode_outlet}
                                        </h3>
                                        <span
                                            style={{
                                                ...styles.lobBadge,
                                                backgroundColor:
                                                    badgeStyle.background,
                                                color: badgeStyle.color,
                                            }}
                                        >
                                            {outlet.lob}
                                        </span>
                                    </div>
                                </div>

                                <div style={styles.cardBody}>
                                    <p style={styles.namaOutlet}>
                                        {outlet.nama_outlet}
                                    </p>
                                </div>

                                <div style={styles.cardActions}>
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(outlet.id)}
                                            style={styles.btnEdit}
                                            title="Edit outlet"
                                        >
                                            <Edit size={16} />
                                            <span
                                                style={{ marginLeft: "0.5rem" }}
                                            >
                                                Edit
                                            </span>
                                        </button>
                                    )}
                                    <button
                                        onClick={() => onDelete(outlet.id)}
                                        style={styles.btnDelete}
                                        title="Hapus outlet"
                                    >
                                        <Trash2 size={16} />
                                        <span style={{ marginLeft: "0.5rem" }}>
                                            Hapus
                                        </span>
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        );
    };

    // Table view for desktop
    const renderTableView = () => {
        return (
            <div style={styles.tableResponsive}>
                <table style={styles.dataTable}>
                    <thead>
                        <tr>
                            <th style={styles.thCheckbox}>
                                <div
                                    onClick={toggleSelectAll}
                                    style={styles.checkboxIcon}
                                >
                                    {renderCheckboxIcon(
                                        selectedRows.length ===
                                            currentOutlets.length &&
                                            currentOutlets.length > 0
                                    )}
                                </div>
                            </th>
                            <th
                                onClick={() => handleSort("kode_outlet")}
                                style={styles.thSortable}
                            >
                                <div style={styles.thContent}>
                                    <span>Kode Outlet</span>
                                    {renderSortIcon("kode_outlet")}
                                </div>
                            </th>
                            <th
                                onClick={() => handleSort("nama_outlet")}
                                style={styles.thSortable}
                            >
                                <div style={styles.thContent}>
                                    <span>Nama Outlet</span>
                                    {renderSortIcon("nama_outlet")}
                                </div>
                            </th>
                            <th
                                onClick={() => handleSort("lob")}
                                style={styles.thSortable}
                            >
                                <div style={styles.thContent}>
                                    <span>LOB</span>
                                    {renderSortIcon("lob")}
                                </div>
                            </th>
                            <th style={styles.th}>Aksi</th>
                        </tr>
                    </thead>

                    <tbody>
                        {currentOutlets.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={styles.emptyStateCell}>
                                    <Filter
                                        size={40}
                                        style={{
                                            marginBottom: "1rem",
                                            opacity: 0.5,
                                        }}
                                    />
                                    <p>Tidak ada data outlet yang ditemukan</p>
                                </td>
                            </tr>
                        ) : (
                            currentOutlets.map((outlet) => {
                                const badgeStyle = getLobBadgeColor(outlet.lob);
                                const isSelected = selectedRows.includes(
                                    outlet.id
                                );

                                return (
                                    <tr
                                        key={outlet.id}
                                        style={{
                                            ...styles.tr,
                                            backgroundColor: isSelected
                                                ? "#e0f2fe"
                                                : "transparent",
                                        }}
                                    >
                                        <td style={styles.td}>
                                            <div
                                                onClick={() =>
                                                    toggleRowSelection(
                                                        outlet.id
                                                    )
                                                }
                                                style={styles.checkboxIcon}
                                            >
                                                {renderCheckboxIcon(isSelected)}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.kodeOutlet}>
                                                {outlet.kode_outlet}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.namaOutlet}>
                                                {outlet.nama_outlet}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <span
                                                style={{
                                                    ...styles.lobBadge,
                                                    backgroundColor:
                                                        badgeStyle.background,
                                                    color: badgeStyle.color,
                                                }}
                                            >
                                                {outlet.lob}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div
                                                style={styles.actionButtonsCell}
                                            >
                                                {onEdit && (
                                                    <button
                                                        onClick={() =>
                                                            onEdit(outlet.id)
                                                        }
                                                        style={
                                                            styles.btnIconEdit
                                                        }
                                                        title="Edit outlet"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() =>
                                                        onDelete(outlet.id)
                                                    }
                                                    style={styles.btnIconDelete}
                                                    title="Hapus outlet"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div style={styles.container}>
            <div style={styles.tableHeader}>
                <h1 style={styles.title}>Data Outlet</h1>

                <div style={styles.headerActions}>
                    <div style={styles.searchContainer}>
                        <Search size={18} style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Cari outlet..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.viewModeToggle}>
                        <button
                            onClick={() => setViewMode("table")}
                            style={{
                                ...styles.viewModeBtn,
                                backgroundColor:
                                    viewMode === "table"
                                        ? "#3b82f6"
                                        : "#e2e8f0",
                                color:
                                    viewMode === "table" ? "white" : "#475569",
                            }}
                            title="Tampilan tabel"
                        >
                            <List size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode("card")}
                            style={{
                                ...styles.viewModeBtn,
                                backgroundColor:
                                    viewMode === "card" ? "#3b82f6" : "#e2e8f0",
                                color:
                                    viewMode === "card" ? "white" : "#475569",
                            }}
                            title="Tampilan kartu"
                        >
                            <Grid size={18} />
                        </button>
                    </div>

                    <div style={styles.actionButtons}>
                        <button
                            onClick={onRefresh}
                            style={styles.btnSecondary}
                            title="Refresh data"
                        >
                            <RefreshCw
                                size={16}
                                style={{ marginRight: "0.5rem" }}
                            />
                            Refresh
                        </button>

                        {selectedRows.length > 0 && (
                            <button
                                onClick={handleDeleteSelected}
                                style={styles.btnDanger}
                                title="Hapus yang dipilih"
                            >
                                <Trash2
                                    size={16}
                                    style={{ marginRight: "0.5rem" }}
                                />
                                Hapus ({selectedRows.length})
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats bar */}
            <div style={styles.statsBar}>
                <span style={styles.statsText}>
                    Menampilkan {indexOfFirstItem + 1} -{" "}
                    {Math.min(indexOfLastItem, sortedOutlets.length)} dari{" "}
                    {sortedOutlets.length} outlet
                </span>

                <div style={styles.paginationControls}>
                    <span style={styles.statsText}>Baris per halaman:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) =>
                            setItemsPerPage(Number(e.target.value))
                        }
                        style={styles.pageSelect}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === "table" ? renderTableView() : renderCardView()}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={styles.paginationContainer}>
                    <button
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        style={{
                            ...styles.paginationBtn,
                            opacity: currentPage === 1 ? 0.5 : 1,
                            cursor:
                                currentPage === 1 ? "not-allowed" : "pointer",
                        }}
                    >
                        ← Sebelumnya
                    </button>

                    <div style={styles.pageNumbers}>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                                if (page === 1 || page === totalPages)
                                    return true;
                                if (
                                    page >= currentPage - 1 &&
                                    page <= currentPage + 1
                                )
                                    return true;
                                return false;
                            })
                            .map((page, index, array) => {
                                let result = [];
                                if (index > 0 && page - array[index - 1] > 1) {
                                    result.push(
                                        <span
                                            key={`ellipsis-${page}`}
                                            style={styles.paginationEllipsis}
                                        >
                                            ...
                                        </span>
                                    );
                                }
                                result.push(
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        style={{
                                            ...styles.paginationBtn,
                                            backgroundColor:
                                                currentPage === page
                                                    ? "#3b82f6"
                                                    : "white",
                                            color:
                                                currentPage === page
                                                    ? "white"
                                                    : "#475569",
                                            borderColor:
                                                currentPage === page
                                                    ? "#3b82f6"
                                                    : "#cbd5e1",
                                        }}
                                    >
                                        {page}
                                    </button>
                                );
                                return result;
                            })}
                    </div>

                    <button
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                            )
                        }
                        disabled={currentPage === totalPages}
                        style={{
                            ...styles.paginationBtn,
                            opacity: currentPage === totalPages ? 0.5 : 1,
                            cursor:
                                currentPage === totalPages
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        Selanjutnya →
                    </button>
                </div>
            )}
        </div>
    );
};

// Styles object for cleaner code
const styles = {
    container: {
        padding: "1.5rem",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        width: "100%",
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
    tableHeader: {
        display: "flex",
        flexDirection: "column",
        marginBottom: "1.5rem",
        gap: "1rem",
    },
    title: {
        margin: "0",
        color: "#1e293b",
        fontSize: "1.75rem",
        fontWeight: "bold",
    },
    headerActions: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        width: "100%",
    },
    searchContainer: {
        display: "flex",
        alignItems: "center",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "0.5rem 1rem",
        flex: "1",
        minWidth: "250px",
        maxWidth: "500px",
    },
    searchIcon: {
        marginRight: "0.5rem",
        color: "#94a3b8",
    },
    searchInput: {
        border: "none",
        outline: "none",
        width: "100%",
        fontSize: "0.95rem",
        color: "#334155",
        backgroundColor: "transparent",
    },
    viewModeToggle: {
        display: "flex",
        gap: "0.5rem",
    },
    viewModeBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        fontSize: "1.2rem",
        transition: "all 0.2s",
    },
    actionButtons: {
        display: "flex",
        gap: "0.75rem",
        flexWrap: "wrap",
    },
    btnSecondary: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.6rem 1rem",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#e2e8f0",
        color: "#475569",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s",
        fontSize: "0.9rem",
    },
    btnDanger: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.6rem 1rem",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s",
        fontSize: "0.9rem",
    },
    statsBar: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        background: "white",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        marginBottom: "1rem",
        fontSize: "0.875rem",
        color: "#64748b",
        border: "1px solid #e2e8f0",
        gap: "0.5rem",
    },
    statsText: {
        fontSize: "0.875rem",
        color: "#64748b",
    },
    paginationControls: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    pageSelect: {
        padding: "0.25rem 0.5rem",
        borderRadius: "4px",
        border: "1px solid #cbd5e1",
        background: "white",
        fontSize: "0.875rem",
    },
    tableResponsive: {
        overflowX: "auto",
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        background: "white",
        marginBottom: "1rem",
        border: "1px solid #e2e8f0",
    },
    dataTable: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "800px",
    },
    th: {
        backgroundColor: "#f1f5f9",
        padding: "1rem",
        textAlign: "left",
        fontWeight: "600",
        color: "#475569",
        borderBottom: "2px solid #e2e8f0",
        whiteSpace: "nowrap",
        fontSize: "0.875rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    thCheckbox: {
        width: "50px",
        backgroundColor: "#f1f5f9",
        padding: "1rem",
        textAlign: "center",
        fontWeight: "600",
        color: "#475569",
        borderBottom: "2px solid #e2e8f0",
        fontSize: "0.875rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
    },
    thSortable: {
        backgroundColor: "#f1f5f9",
        padding: "1rem",
        textAlign: "left",
        fontWeight: "600",
        color: "#475569",
        borderBottom: "2px solid #e2e8f0",
        whiteSpace: "nowrap",
        fontSize: "0.875rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        cursor: "pointer",
        transition: "background-color 0.2s",
        userSelect: "none",
    },
    thContent: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.5rem",
    },
    tr: {
        transition: "background-color 0.2s",
        borderBottom: "1px solid #f1f5f9",
    },
    td: {
        padding: "1rem",
        borderBottom: "1px solid #f1f5f9",
        color: "#334155",
        verticalAlign: "middle",
        fontSize: "0.95rem",
    },
    checkboxIcon: {
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#3b82f6",
    },
    kodeOutlet: {
        fontWeight: "600",
        color: "#1e40af",
        fontSize: "0.95rem",
    },
    namaOutlet: {
        fontSize: "0.95rem",
        color: "#334155",
    },
    lobBadge: {
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: "600",
        display: "inline-block",
        textTransform: "uppercase",
    },
    actionButtonsCell: {
        display: "flex",
        gap: "0.5rem",
    },
    btnIconEdit: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#e0f2fe",
        color: "#0369a1",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    btnIconDelete: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "36px",
        height: "36px",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    emptyStateCell: {
        textAlign: "center",
        padding: "3rem",
        color: "#94a3b8",
        fontSize: "1rem",
    },
    cardContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "1rem",
        marginBottom: "1rem",
    },
    card: {
        background: "white",
        borderRadius: "8px",
        padding: "1.5rem",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        border: "1px solid #e2e8f0",
        transition: "all 0.3s ease",
    },
    cardHeader: {
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        marginBottom: "1rem",
    },
    cardTitle: {
        flex: "1",
    },
    cardBody: {
        marginBottom: "1rem",
    },
    cardActions: {
        display: "flex",
        gap: "0.75rem",
    },
    btnEdit: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "1",
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#e0f2fe",
        color: "#0369a1",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "0.875rem",
    },
    btnDelete: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "1",
        padding: "0.5rem 1rem",
        borderRadius: "6px",
        border: "none",
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        cursor: "pointer",
        fontWeight: "500",
        fontSize: "0.875rem",
    },
    emptyState: {
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "3rem",
        color: "#94a3b8",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
        fontSize: "1rem",
    },
    paginationContainer: {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "1.5rem",
        gap: "1rem",
    },
    paginationBtn: {
        padding: "0.5rem 1rem",
        border: "1px solid #cbd5e1",
        background: "white",
        borderRadius: "6px",
        cursor: "pointer",
        color: "#475569",
        transition: "all 0.2s",
        fontSize: "0.875rem",
        fontWeight: "500",
    },
    pageNumbers: {
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        flexWrap: "wrap",
    },
    paginationEllipsis: {
        color: "#94a3b8",
        padding: "0 0.5rem",
        fontSize: "0.875rem",
    },
};

export default DataTable;
