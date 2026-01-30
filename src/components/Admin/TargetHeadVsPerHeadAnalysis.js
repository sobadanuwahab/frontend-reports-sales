import React, { useMemo, useRef } from "react";
import {
    BarChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    ComposedChart,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faBullseye,
    faUserFriends,
    faChartBar,
    faCalendarDay,
    faArrowUp,
    faArrowDown,
    faEquals,
    faStore,
    faFilePdf,
    faPercentage,
} from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const TargetHeadVsPerHeadAnalysis = ({
    performanceData,
    filterOutlet = "all",
}) => {
    const chartRef = useRef(null);

    // Tentukan mode berdasarkan filter outlet
    const isAllOutletsMode = filterOutlet === "all";

    // DS Threshold (33-34%)
    const DS_THRESHOLD_MIN = 33;
    const DS_THRESHOLD_MAX = 34;
    const DS_THRESHOLD_AVG = 33.5; // Rata-rata 33.5%

    // Proses data berdasarkan mode
    const processChartData = () => {
        if (!performanceData || performanceData.length === 0) {
            return { chartData: [], isAllOutletsMode, outletCount: 0 };
        }

        if (isAllOutletsMode) {
            // Mode: Semua Outlet - Tampilkan per outlet
            return processOutletModeData();
        } else {
            // Mode: Outlet Spesifik - Tampilkan per hari
            return processDailyModeData();
        }
    };

    // Process data untuk mode outlet (per outlet)
    const processOutletModeData = () => {
        // Group by outlet
        const outletGroups = {};

        performanceData.forEach((item) => {
            const outletName = item.outlet_name;
            const outletId = item.outlet_id;
            const lob = item.lob || "Unknown";

            if (!outletGroups[outletId]) {
                outletGroups[outletId] = {
                    outletId,
                    outletName,
                    lob,
                    targetHeadSum: 0,
                    perHeadSum: 0,
                    totalFnb: 0,
                    totalAudience: 0,
                    dsSum: 0,
                    reportCount: 0,
                    dates: new Set(),
                };
            }

            // Hitung per head actual
            const perHeadActual =
                item.total_audience > 0
                    ? Math.round(item.omzet_fnb / item.total_audience)
                    : 0;
            const targetHead = item.target_head || 0;
            const dsPercentage = parseFloat(item.ds_percentage) || 0;

            outletGroups[outletId].targetHeadSum += targetHead;
            outletGroups[outletId].perHeadSum += perHeadActual;
            outletGroups[outletId].dsSum += dsPercentage;
            outletGroups[outletId].totalFnb += item.omzet_fnb || 0;
            outletGroups[outletId].totalAudience += item.total_audience || 0;
            outletGroups[outletId].reportCount += 1;
            if (item.date) outletGroups[outletId].dates.add(item.date);
        });

        // Hitung rata-rata per outlet
        const outletData = Object.values(outletGroups).map((group) => {
            const avgTargetHead =
                group.reportCount > 0
                    ? Math.round(group.targetHeadSum / group.reportCount)
                    : 0;
            const avgPerHead =
                group.reportCount > 0
                    ? Math.round(group.perHeadSum / group.reportCount)
                    : 0;
            const avgDS =
                group.reportCount > 0
                    ? parseFloat((group.dsSum / group.reportCount).toFixed(1))
                    : 0;

            // Hitung selisih per head
            const difference = avgPerHead - avgTargetHead;

            // Tentukan status berdasarkan DS
            let status = "Below DS Target";
            let statusColor = "#ef4444"; // Merah
            let statusIcon = faArrowDown;
            let achievementText = "DS Rendah";

            if (avgDS >= DS_THRESHOLD_AVG) {
                status = "Above DS Target";
                statusColor = "#10b981"; // Hijau
                statusIcon = faArrowUp;
                achievementText = "DS Baik";
            } else if (avgDS >= DS_THRESHOLD_MIN && avgDS < DS_THRESHOLD_AVG) {
                status = "Near DS Target";
                statusColor = "#f59e0b"; // Kuning
                statusIcon = faEquals;
                achievementText = "DS Mendekati";
            }

            // Hitung per head overall
            const perHeadOverall =
                group.totalAudience > 0
                    ? Math.round(group.totalFnb / group.totalAudience)
                    : 0;

            return {
                id: `outlet-${group.outletId}`,
                name:
                    group.outletName.length > 20
                        ? group.outletName.substring(0, 20) + "..."
                        : group.outletName,
                fullName: group.outletName,
                lob: group.lob,
                avgTargetHead,
                avgPerHead,
                avgDS,
                difference,
                achievementPercentage: avgDS, // Gunakan DS sebagai achievement
                status,
                statusColor,
                statusIcon,
                achievementText,
                totalFnb: group.totalFnb,
                totalAudience: group.totalAudience,
                reportCount: group.reportCount,
                dateCount: group.dates.size,
                isOutlet: true,
                // Flag untuk threshold
                isAboveDSTarget: avgDS >= DS_THRESHOLD_AVG,
                isNearDSTarget:
                    avgDS >= DS_THRESHOLD_MIN && avgDS < DS_THRESHOLD_AVG,
                isBelowDSTarget: avgDS < DS_THRESHOLD_MIN,
            };
        });

        // Sort by DS descending
        const sortedData = outletData.sort((a, b) => b.avgDS - a.avgDS);

        return {
            chartData: sortedData,
            isAllOutletsMode,
            outletCount: sortedData.length,
        };
    };

    // Process data untuk mode daily (per hari)
    const processDailyModeData = () => {
        // Group data by date
        const dateGroups = {};

        performanceData.forEach((item) => {
            if (!item.date) return;

            const date = new Date(item.date);
            const dateKey = date.toISOString().split("T")[0];
            const dateLabel = date.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
            });

            if (!dateGroups[dateKey]) {
                dateGroups[dateKey] = {
                    date: dateKey,
                    dateLabel: dateLabel,
                    fullDate: item.date,
                    targetHeadSum: 0,
                    perHeadSum: 0,
                    dsSum: 0,
                    totalFnb: 0,
                    totalAudience: 0,
                    outletCount: 0,
                    outletNames: new Set(),
                };
            }

            // Hitung per head actual untuk hari ini
            const perHeadActual =
                item.total_audience > 0
                    ? Math.round(item.omzet_fnb / item.total_audience)
                    : 0;
            const targetHead = item.target_head || 0;
            const dsPercentage = parseFloat(item.ds_percentage) || 0;

            dateGroups[dateKey].targetHeadSum += targetHead;
            dateGroups[dateKey].perHeadSum += perHeadActual;
            dateGroups[dateKey].dsSum += dsPercentage;
            dateGroups[dateKey].totalFnb += item.omzet_fnb || 0;
            dateGroups[dateKey].totalAudience += item.total_audience || 0;
            dateGroups[dateKey].outletCount += 1;
            dateGroups[dateKey].outletNames.add(item.outlet_name);
        });

        // Sort by date
        const sortedDates = Object.keys(dateGroups).sort();

        // Siapkan data untuk chart
        const chartData = sortedDates.map((dateKey) => {
            const group = dateGroups[dateKey];
            const avgTargetHead =
                group.outletCount > 0
                    ? Math.round(group.targetHeadSum / group.outletCount)
                    : 0;
            const avgPerHead =
                group.outletCount > 0
                    ? Math.round(group.perHeadSum / group.outletCount)
                    : 0;
            const avgDS =
                group.outletCount > 0
                    ? parseFloat((group.dsSum / group.outletCount).toFixed(1))
                    : 0;

            // Hitung selisih
            const difference = avgPerHead - avgTargetHead;

            // Tentukan status berdasarkan DS
            let status = "Below DS Target";
            let statusColor = "#ef4444"; // Merah
            let statusIcon = faArrowDown;
            let achievementText = "DS Rendah";

            if (avgDS >= DS_THRESHOLD_AVG) {
                status = "Above DS Target";
                statusColor = "#10b981"; // Hijau
                statusIcon = faArrowUp;
                achievementText = "DS Baik";
            } else if (avgDS >= DS_THRESHOLD_MIN && avgDS < DS_THRESHOLD_AVG) {
                status = "Near DS Target";
                statusColor = "#f59e0b"; // Kuning
                statusIcon = faEquals;
                achievementText = "DS Mendekati";
            }

            return {
                id: `date-${group.date}`,
                name: group.dateLabel,
                fullDate: group.fullDate,
                avgTargetHead,
                avgPerHead,
                avgDS,
                difference,
                achievementPercentage: avgDS, // Gunakan DS sebagai achievement
                status,
                statusColor,
                statusIcon,
                achievementText,
                totalFnb: group.totalFnb,
                totalAudience: group.totalAudience,
                outletCount: group.outletCount,
                outletNames: Array.from(group.outletNames),
                isOutlet: false,
                // Flag untuk threshold
                isAboveDSTarget: avgDS >= DS_THRESHOLD_AVG,
                isNearDSTarget:
                    avgDS >= DS_THRESHOLD_MIN && avgDS < DS_THRESHOLD_AVG,
                isBelowDSTarget: avgDS < DS_THRESHOLD_MIN,
            };
        });

        return {
            chartData,
            isAllOutletsMode,
            outletCount: performanceData.length > 0 ? 1 : 0,
        };
    };

    const formatNumber = (num) => {
        if (num === null || num === undefined || isNaN(num)) return "0";
        return Math.floor(num)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const formatPercentage = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return "0%";
        return `${num.toFixed(1)}%`;
    };

    const formatDate = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("id-ID", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        } catch (e) {
            return dateStr;
        }
    };

    const formatDateForFilename = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toISOString().split("T")[0];
        } catch (e) {
            return new Date().toISOString().split("T")[0];
        }
    };

    const {
        chartData,
        isAllOutletsMode: isOutletMode,
        outletCount,
    } = processChartData();

    // Calculate overall statistics dengan DS
    const calculateOverallStats = () => {
        if (chartData.length === 0) return null;

        const totalItems = chartData.length;
        const itemsAboveDSTarget = chartData.filter(
            (d) => d.isAboveDSTarget
        ).length;
        const itemsNearDSTarget = chartData.filter(
            (d) => d.isNearDSTarget
        ).length;
        const itemsBelowDSTarget = chartData.filter(
            (d) => d.isBelowDSTarget
        ).length;

        const avgDS =
            chartData.reduce((sum, d) => sum + d.avgDS, 0) / totalItems;
        const avgTargetHead =
            chartData.reduce((sum, d) => sum + d.avgTargetHead, 0) / totalItems;
        const avgPerHead =
            chartData.reduce((sum, d) => sum + d.avgPerHead, 0) / totalItems;
        const totalFnb = chartData.reduce((sum, d) => sum + d.totalFnb, 0);
        const totalAudience = chartData.reduce(
            (sum, d) => sum + d.totalAudience,
            0
        );

        return {
            totalItems,
            itemsAboveDSTarget,
            itemsNearDSTarget,
            itemsBelowDSTarget,
            avgDS: parseFloat(avgDS.toFixed(1)),
            avgTargetHead: Math.round(avgTargetHead),
            avgPerHead: Math.round(avgPerHead),
            overallDifference: Math.round(avgPerHead - avgTargetHead),
            totalFnb,
            totalAudience,
            avgPerHeadOverall:
                totalAudience > 0 ? Math.round(totalFnb / totalAudience) : 0,
        };
    };

    const overallStats = calculateOverallStats();

    // Fungsi untuk export PDF dengan informasi outlet lengkap
    const exportToPDF = async () => {
        try {
            // Buat PDF baru
            const pdf = new jsPDF("p", "mm", "a4");
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;

            // Judul PDF berdasarkan mode
            const title = isOutletMode
                ? "ANALISIS TARGET HEAD VS PER HEAD - SEMUA OUTLET"
                : "ANALISIS TARGET HEAD VS PER HEAD - OUTLET SPESIFIK";

            const subtitle = isOutletMode
                ? `Laporan Performa ${outletCount} Outlet (Berdasarkan DS)`
                : `Laporan Performa Harian Outlet Spesifik (Berdasarkan DS)`;

            // Header dengan logo/identitas
            pdf.setFillColor(59, 130, 246); // Biru
            pdf.rect(0, 0, pageWidth, 25, "F");

            pdf.setFontSize(18);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont("helvetica", "bold");
            pdf.text("DASHBOARD PERFORMANCE REPORT", pageWidth / 2, 15, {
                align: "center",
            });

            pdf.setFontSize(12);
            pdf.text(title, pageWidth / 2, 22, { align: "center" });

            // Reset untuk konten
            pdf.setTextColor(0, 0, 0);

            // Informasi laporan
            let currentY = 35;

            pdf.setFontSize(11);
            pdf.setFont("helvetica", "bold");
            pdf.text("INFORMASI LAPORAN", margin, currentY);
            currentY += 7;

            pdf.setFont("helvetica", "normal");
            const reportInfo = [
                `Tanggal Generate: ${new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                })}`,
                `Jenis Analisis: ${isOutletMode ? "Per Outlet" : "Per Hari"}`,
                `Periode Data: ${
                    performanceData.length > 0
                        ? `Data dari ${performanceData.length} laporan`
                        : "Tidak ada data periode spesifik"
                }`,
                `Threshold DS: ${DS_THRESHOLD_MIN}% - ${DS_THRESHOLD_MAX}% (Avg: ${DS_THRESHOLD_AVG}%)`,
            ];

            reportInfo.forEach((info, index) => {
                pdf.text(info, margin, currentY + index * 5);
            });
            currentY += 25;

            // Informasi outlet (jika mode outlet spesifik)
            if (!isOutletMode && performanceData.length > 0) {
                const outletInfo = performanceData[0];
                pdf.setFont("helvetica", "bold");
                pdf.text("INFORMASI OUTLET", margin, currentY);
                currentY += 7;

                pdf.setFont("helvetica", "normal");
                const outletDetails = [
                    `Nama Outlet: ${
                        outletInfo.outlet_name || "Tidak diketahui"
                    }`,
                    `LOB: ${outletInfo.lob || "Tidak diketahui"}`,
                    `Class: ${outletInfo.class || "Tidak diketahui"}`,
                    `Total Laporan: ${performanceData.length}`,
                ];

                outletDetails.forEach((detail, index) => {
                    pdf.text(detail, margin, currentY + index * 5);
                });
                currentY += 25;
            }

            // Statistik Ringkasan
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.text("RINGKASAN STATISTIK", margin, currentY);
            currentY += 7;

            if (overallStats) {
                pdf.setFontSize(10);
                pdf.setFont("helvetica", "normal");

                // Buat box untuk statistik
                const statBoxWidth = pageWidth - 2 * margin;
                const statBoxHeight = 45;

                pdf.setDrawColor(200, 200, 200);
                pdf.setFillColor(248, 250, 252); // Light gray background
                pdf.rect(margin, currentY, statBoxWidth, statBoxHeight, "FD");

                // Isi statistik dalam 2 kolom
                const leftColX = margin + 5;
                const rightColX = margin + statBoxWidth / 2;

                const leftStats = [
                    `Total ${isOutletMode ? "Outlet" : "Hari"}: ${
                        overallStats.totalItems
                    }`,
                    `DS Baik (≥${DS_THRESHOLD_AVG}%): ${overallStats.itemsAboveDSTarget}`,
                    `DS Mendekati (${DS_THRESHOLD_MIN}-${DS_THRESHOLD_AVG}%): ${overallStats.itemsNearDSTarget}`,
                    `DS Rendah (<${DS_THRESHOLD_MIN}%): ${overallStats.itemsBelowDSTarget}`,
                ];

                const rightStats = [
                    `Rata-rata DS: ${formatPercentage(overallStats.avgDS)}`,
                    `Rata-rata Target Head: Rp ${formatNumber(
                        overallStats.avgTargetHead
                    )}`,
                    `Rata-rata Per Head: Rp ${formatNumber(
                        overallStats.avgPerHead
                    )}`,
                    `Selisih Rata-rata: ${
                        overallStats.overallDifference >= 0 ? "+" : "-"
                    }Rp ${formatNumber(
                        Math.abs(overallStats.overallDifference)
                    )}`,
                ];

                // Tambah persentase untuk DS categories
                const percentages = [
                    `(${Math.round(
                        (overallStats.itemsAboveDSTarget /
                            overallStats.totalItems) *
                            100
                    )}%)`,
                    `(${Math.round(
                        (overallStats.itemsNearDSTarget /
                            overallStats.totalItems) *
                            100
                    )}%)`,
                    `(${Math.round(
                        (overallStats.itemsBelowDSTarget /
                            overallStats.totalItems) *
                            100
                    )}%)`,
                ];

                leftStats.forEach((stat, index) => {
                    let yPos = currentY + 8 + index * 6;
                    pdf.text(stat, leftColX, yPos);

                    // Tambah persentase untuk 3 stat terakhir
                    if (index > 0 && index < 4) {
                        pdf.setFont("helvetica", "italic");
                        pdf.setTextColor(100, 100, 100);
                        pdf.text(percentages[index - 1], leftColX + 60, yPos);
                        pdf.setTextColor(0, 0, 0);
                        pdf.setFont("helvetica", "normal");
                    }
                });

                rightStats.forEach((stat, index) => {
                    pdf.text(stat, rightColX, currentY + 8 + index * 6);
                });

                currentY += statBoxHeight + 10;
            }

            // Informasi outlet lengkap jika mode semua outlet
            if (isOutletMode && chartData.length > 0) {
                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bold");
                pdf.text("DAFTAR OUTLET YANG DIANALISIS", margin, currentY);
                currentY += 7;

                pdf.setFontSize(9);
                pdf.setFont("helvetica", "normal");

                // Header tabel outlet
                const outletHeaders = [
                    "No",
                    "Nama Outlet",
                    "LOB",
                    "DS (%)",
                    "Status DS",
                    "Laporan",
                ];
                const colWidths = [10, 60, 20, 15, 30, 20];

                let x = margin;
                pdf.setFont("helvetica", "bold");
                outletHeaders.forEach((header, i) => {
                    pdf.text(header, x + 2, currentY);
                    x += colWidths[i];
                });

                currentY += 6;

                // Garis header
                pdf.line(
                    margin,
                    currentY - 2,
                    pageWidth - margin,
                    currentY - 2
                );

                // Data outlet
                pdf.setFont("helvetica", "normal");
                chartData.forEach((outlet, index) => {
                    // Cek jika perlu halaman baru
                    if (currentY > pageHeight - 20) {
                        pdf.addPage();
                        currentY = margin + 10;
                    }

                    x = margin;
                    const rowData = [
                        (index + 1).toString(),
                        outlet.fullName,
                        outlet.lob,
                        formatPercentage(outlet.avgDS),
                        outlet.achievementText,
                        outlet.reportCount.toString(),
                    ];

                    rowData.forEach((cell, cellIndex) => {
                        // Warnai kolom DS dan Status
                        if (cellIndex === 3 || cellIndex === 4) {
                            if (outlet.isAboveDSTarget) {
                                pdf.setTextColor(16, 185, 129); // Green
                            } else if (outlet.isNearDSTarget) {
                                pdf.setTextColor(245, 158, 11); // Orange/Yellow
                            } else {
                                pdf.setTextColor(239, 68, 68); // Red
                            }
                        } else {
                            pdf.setTextColor(0, 0, 0);
                        }

                        pdf.text(cell.toString(), x + 2, currentY, {
                            maxWidth: colWidths[cellIndex] - 4,
                        });
                        x += colWidths[cellIndex];
                    });

                    currentY += 6;

                    // Reset warna
                    pdf.setTextColor(0, 0, 0);

                    // Tambah garis pemisah setiap 10 baris
                    if (
                        (index + 1) % 10 === 0 &&
                        index < chartData.length - 1
                    ) {
                        pdf.setDrawColor(200, 200, 200);
                        pdf.line(
                            margin,
                            currentY - 2,
                            pageWidth - margin,
                            currentY - 2
                        );
                        currentY += 2;
                    }
                });

                currentY += 10;
            }

            // Chart
            if (chartRef.current) {
                // Cek jika perlu halaman baru untuk chart
                if (currentY > pageHeight - 100) {
                    pdf.addPage();
                    currentY = margin;
                }

                pdf.setFontSize(12);
                pdf.setFont("helvetica", "bold");
                pdf.text("VISUALISASI DATA", margin, currentY);
                currentY += 7;

                const chartCanvas = await html2canvas(chartRef.current, {
                    scale: 2,
                    backgroundColor: "#ffffff",
                    useCORS: true,
                });

                const chartImgData = chartCanvas.toDataURL("image/png");
                const chartWidth = pageWidth - 2 * margin;
                const chartHeight =
                    (chartCanvas.height * chartWidth) / chartCanvas.width;

                pdf.addImage(
                    chartImgData,
                    "PNG",
                    margin,
                    currentY,
                    chartWidth,
                    chartHeight
                );
                currentY += chartHeight + 15;
            }

            // Tabel detail data
            if (currentY > pageHeight - 50) {
                pdf.addPage();
                currentY = margin;
            }

            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.text("DETAIL DATA PERFORMANSI", margin, currentY);
            currentY += 7;

            // Siapkan data untuk tabel
            const tableHeaders = isOutletMode
                ? [
                      "No",
                      "Outlet",
                      "LOB",
                      "Target Head",
                      "Per Head Aktual",
                      "Selisih",
                      "DS (%)",
                      "Status DS",
                  ]
                : [
                      "No",
                      "Tanggal",
                      "Hari",
                      "Target Head",
                      "Per Head Aktual",
                      "Selisih",
                      "DS (%)",
                      "Outlet",
                      "Status DS",
                  ];

            const columnWidths = isOutletMode
                ? [8, 45, 20, 25, 25, 20, 15, 25]
                : [8, 25, 15, 22, 22, 20, 15, 15, 25];

            // Header tabel
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "bold");
            let x = margin;

            tableHeaders.forEach((header, i) => {
                pdf.text(header, x + 2, currentY, {
                    maxWidth: columnWidths[i] - 4,
                });
                x += columnWidths[i];
            });

            currentY += 6;

            // Garis header
            pdf.line(margin, currentY - 2, pageWidth - margin, currentY - 2);

            // Data tabel
            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(8);

            chartData.forEach((item, rowIndex) => {
                // Cek jika perlu halaman baru
                if (currentY > pageHeight - 15) {
                    pdf.addPage();
                    currentY = margin + 10;

                    // Cetak header lagi di halaman baru
                    x = margin;
                    pdf.setFont("helvetica", "bold");
                    pdf.setFontSize(9);
                    tableHeaders.forEach((header, i) => {
                        pdf.text(header, x + 2, currentY, {
                            maxWidth: columnWidths[i] - 4,
                        });
                        x += columnWidths[i];
                    });
                    currentY += 6;
                    pdf.line(
                        margin,
                        currentY - 2,
                        pageWidth - margin,
                        currentY - 2
                    );
                    pdf.setFont("helvetica", "normal");
                    pdf.setFontSize(8);
                }

                x = margin;
                const rowData = isOutletMode
                    ? [
                          (rowIndex + 1).toString(),
                          item.fullName,
                          item.lob,
                          `Rp ${formatNumber(item.avgTargetHead)}`,
                          `Rp ${formatNumber(item.avgPerHead)}`,
                          `${item.difference >= 0 ? "+" : ""}Rp ${formatNumber(
                              item.difference
                          )}`,
                          formatPercentage(item.avgDS),
                          item.achievementText,
                      ]
                    : [
                          (rowIndex + 1).toString(),
                          item.name,
                          formatDate(item.fullDate).split(" ")[0],
                          `Rp ${formatNumber(item.avgTargetHead)}`,
                          `Rp ${formatNumber(item.avgPerHead)}`,
                          `${item.difference >= 0 ? "+" : ""}Rp ${formatNumber(
                              item.difference
                          )}`,
                          formatPercentage(item.avgDS),
                          item.outletCount.toString(),
                          item.achievementText,
                      ];

                rowData.forEach((cell, cellIndex) => {
                    // Warnai kolom DS dan Status
                    if (
                        cellIndex === rowData.length - 1 ||
                        cellIndex === rowData.length - 2
                    ) {
                        // Kolom DS dan Status DS
                        if (item.isAboveDSTarget) {
                            pdf.setTextColor(16, 185, 129); // Green
                        } else if (item.isNearDSTarget) {
                            pdf.setTextColor(245, 158, 11); // Orange/Yellow
                        } else {
                            pdf.setTextColor(239, 68, 68); // Red
                        }
                    } else {
                        pdf.setTextColor(0, 0, 0);
                    }

                    // Truncate text if too long (khusus untuk nama outlet)
                    let displayText = cell.toString();
                    if (
                        isOutletMode &&
                        cellIndex === 1 &&
                        displayText.length > 25
                    ) {
                        displayText = displayText.substring(0, 25) + "...";
                    }

                    pdf.text(displayText, x + 2, currentY, {
                        maxWidth: columnWidths[cellIndex] - 4,
                    });
                    x += columnWidths[cellIndex];
                });

                currentY += 6;

                // Reset warna
                pdf.setTextColor(0, 0, 0);

                // Tambah garis pemisah setiap 15 baris
                if (
                    (rowIndex + 1) % 15 === 0 &&
                    rowIndex < chartData.length - 1
                ) {
                    pdf.setDrawColor(200, 200, 200);
                    pdf.line(
                        margin,
                        currentY - 2,
                        pageWidth - margin,
                        currentY - 2
                    );
                    currentY += 2;
                }
            });

            // Legend/Keterangan
            if (currentY > pageHeight - 40) {
                pdf.addPage();
                currentY = margin;
            }

            pdf.setFontSize(10);
            pdf.setFont("helvetica", "bold");
            pdf.text("KETERANGAN DS (DAILY SALES)", margin, currentY);
            currentY += 7;

            pdf.setFont("helvetica", "normal");
            pdf.setFontSize(9);

            const legendItems = [
                {
                    color: "#10b981",
                    text: `Hijau: DS ≥ ${DS_THRESHOLD_AVG}% (Target tercapai/baik)`,
                },
                {
                    color: "#f59e0b",
                    text: `Kuning: DS ${DS_THRESHOLD_MIN}-${DS_THRESHOLD_AVG}% (Mendekati target)`,
                },
                {
                    color: "#ef4444",
                    text: `Merah: DS < ${DS_THRESHOLD_MIN}% (Di bawah target)`,
                },
                {
                    text: `DS Threshold: ${DS_THRESHOLD_MIN}% - ${DS_THRESHOLD_MAX}% (Rata-rata ${DS_THRESHOLD_AVG}%)`,
                },
                {
                    text: `Garis putus-putus merah = Target Head, Bar chart = Per Head Aktual`,
                },
            ];

            legendItems.forEach((item, index) => {
                if (item.color) {
                    // Tambah kotak warna kecil
                    pdf.setFillColor(item.color);
                    pdf.rect(margin, currentY - 2.5, 5, 5, "F");
                    pdf.text(item.text, margin + 8, currentY);
                } else {
                    pdf.text(item.text, margin, currentY);
                }
                currentY += 6;
            });

            // Informasi kontak/footer
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);

                // Footer dengan informasi perusahaan
                pdf.setFontSize(8);
                pdf.setFont("helvetica", "italic");
                pdf.setTextColor(100, 100, 100);

                // Garis footer
                pdf.setDrawColor(200, 200, 200);
                pdf.line(
                    margin,
                    pageHeight - 15,
                    pageWidth - margin,
                    pageHeight - 15
                );

                // Teks footer
                pdf.text(
                    `Laporan ini dibuat otomatis oleh Dashboard Performa Outlet`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: "center" }
                );

                pdf.text(
                    `Halaman ${i} dari ${totalPages}`,
                    pageWidth - margin,
                    pageHeight - 10,
                    { align: "right" }
                );

                // Info kontak di halaman terakhir
                if (i === totalPages) {
                    pdf.setFont("helvetica", "normal");
                    pdf.setTextColor(0, 0, 0);
                    pdf.setFontSize(9);

                    const contactInfo = [
                        "Untuk informasi lebih lanjut, hubungi:",
                        "Email: performance@company.com",
                        "Telepon: (021) 1234-5678",
                        "© 2024 Dashboard Performa Outlet. All rights reserved.",
                    ];

                    contactInfo.forEach((info, idx) => {
                        pdf.text(
                            info,
                            pageWidth / 2,
                            pageHeight - 25 + idx * 5,
                            { align: "center" }
                        );
                    });
                }
            }

            // Simpan PDF dengan nama yang informatif
            const outletName =
                !isOutletMode && performanceData.length > 0
                    ? performanceData[0].outlet_name
                          .replace(/[^a-z0-9]/gi, "_")
                          .toLowerCase()
                    : "semua_outlet";

            const filename = `analisis_ds_target_${outletName}_${formatDateForFilename(
                new Date()
            )}.pdf`;
            pdf.save(filename);

            // Feedback ke user
            alert("PDF berhasil diekspor! File akan diunduh secara otomatis.");
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Terjadi kesalahan saat mengekspor PDF. Silakan coba lagi.");
        }
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = chartData.find((d) => d.name === label);
            if (!data) return null;

            return (
                <div style={styles.customTooltip}>
                    {data.isOutlet ? (
                        // Tooltip untuk mode outlet
                        <>
                            <p style={styles.tooltipLabel}>
                                <strong>{data.fullName}</strong>
                            </p>
                            <p
                                style={{
                                    margin: "4px 0",
                                    color: "#64748b",
                                    fontSize: "0.85rem",
                                }}
                            >
                                <FontAwesomeIcon
                                    icon={faStore}
                                    style={{ marginRight: "6px" }}
                                />
                                {data.lob}
                            </p>
                            <p
                                style={{
                                    margin: "4px 0",
                                    color: "#64748b",
                                    fontSize: "0.85rem",
                                }}
                            >
                                {data.reportCount} laporan • {data.dateCount}{" "}
                                hari
                            </p>
                        </>
                    ) : (
                        // Tooltip untuk mode daily
                        <>
                            <p style={styles.tooltipLabel}>
                                <strong>{formatDate(data.fullDate)}</strong>
                            </p>
                            <p
                                style={{
                                    margin: "4px 0",
                                    color: "#64748b",
                                    fontSize: "0.85rem",
                                }}
                            >
                                {data.outletCount} outlet aktif
                            </p>
                        </>
                    )}

                    {payload.map((entry, index) => {
                        if (entry.dataKey === "avgPerHead") {
                            return (
                                <p
                                    key={index}
                                    style={{
                                        margin: "6px 0",
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "#10b981",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Per Head Aktual:
                                    </span>
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            marginLeft: "10px",
                                        }}
                                    >
                                        {formatNumber(data.avgPerHead)}
                                    </span>
                                </p>
                            );
                        }
                        if (entry.dataKey === "avgTargetHead") {
                            return (
                                <p
                                    key={index}
                                    style={{
                                        margin: "6px 0",
                                        display: "flex",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <span
                                        style={{
                                            color: "#ef4444",
                                            fontWeight: 500,
                                        }}
                                    >
                                        Target Head:
                                    </span>
                                    <span
                                        style={{
                                            fontWeight: 600,
                                            marginLeft: "10px",
                                        }}
                                    >
                                        {formatNumber(data.avgTargetHead)}
                                    </span>
                                </p>
                            );
                        }
                        return null;
                    })}

                    <p
                        style={{
                            margin: "6px 0",
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <span style={{ fontWeight: 500 }}>
                            Selisih Per Head:
                        </span>
                        <span
                            style={{
                                color:
                                    data.difference >= 0
                                        ? "#10b981"
                                        : "#ef4444",
                                fontWeight: 600,
                            }}
                        >
                            {data.difference >= 0 ? "+" : ""}
                            {formatNumber(data.difference)}
                        </span>
                    </p>

                    <p
                        style={{
                            margin: "6px 0",
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <span style={{ fontWeight: 500 }}>
                            <FontAwesomeIcon
                                icon={faPercentage}
                                style={{ marginRight: "5px" }}
                            />
                            DS (Daily Sales):
                        </span>
                        <span
                            style={{
                                color: data.statusColor,
                                fontWeight: 600,
                            }}
                        >
                            {formatPercentage(data.avgDS)}
                        </span>
                    </p>

                    <div
                        style={{
                            marginTop: "10px",
                            padding: "6px 10px",
                            backgroundColor: data.statusColor + "20",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <FontAwesomeIcon
                            icon={data.statusIcon}
                            style={{ color: data.statusColor }}
                        />
                        <span
                            style={{
                                color: data.statusColor,
                                fontWeight: 600,
                                fontSize: "0.85rem",
                            }}
                        >
                            {data.status} ({data.achievementText})
                        </span>
                    </div>

                    <div
                        style={{
                            marginTop: "8px",
                            fontSize: "0.75rem",
                            color: "#64748b",
                            padding: "4px 6px",
                            backgroundColor: "#f8fafc",
                            borderRadius: "4px",
                        }}
                    >
                        <div>
                            Threshold DS: {DS_THRESHOLD_MIN}% -{" "}
                            {DS_THRESHOLD_MAX}%
                        </div>
                        <div>Target: ≥{DS_THRESHOLD_AVG}%</div>
                    </div>

                    {!data.isOutlet &&
                        data.outletNames &&
                        data.outletNames.length > 0 && (
                            <div
                                style={{
                                    marginTop: "10px",
                                    paddingTop: "10px",
                                    borderTop: "1px solid #e2e8f0",
                                }}
                            >
                                <p
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "#64748b",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Outlet aktif:
                                </p>
                                <div
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "#6b7280",
                                        maxHeight: "60px",
                                        overflowY: "auto",
                                    }}
                                >
                                    {data.outletNames
                                        .slice(0, 3)
                                        .map((name, idx) => (
                                            <div key={idx}>• {name}</div>
                                        ))}
                                    {data.outletNames.length > 3 && (
                                        <div>
                                            + {data.outletNames.length - 3}{" "}
                                            lainnya
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div style={styles.noDataContainer}>
                <FontAwesomeIcon
                    icon={faCalendarDay}
                    size="3x"
                    style={{ color: "#d1d5db" }}
                />
                <p style={styles.noDataText}>Tidak ada data untuk analisis</p>
                <p style={styles.noDataSubtext}>
                    Data diperlukan: Target Head, Per Head F&B, dan DS
                    Percentage
                </p>
            </div>
        );
    }

    // Tentukan judul dan subtitle berdasarkan mode
    const getChartTitle = () => {
        if (isOutletMode) {
            return "Analisis per Outlet: Target Head vs Per Head (Berdasarkan DS)";
        }
        return "Analisis Harian: Target Head vs Per Head (Berdasarkan DS)";
    };

    const getChartSubtitle = () => {
        if (isOutletMode) {
            return `Perbandingan target vs actual dengan DS threshold ${DS_THRESHOLD_MIN}%-${DS_THRESHOLD_MAX}% untuk ${outletCount} outlet`;
        }
        return `Perbandingan harian target vs actual dengan DS threshold ${DS_THRESHOLD_MIN}%-${DS_THRESHOLD_MAX}%`;
    };

    const getStatsLabel = () => {
        if (isOutletMode) {
            return {
                aboveTarget: `Outlet DS ≥ ${DS_THRESHOLD_AVG}%`,
                nearTarget: `Outlet DS ${DS_THRESHOLD_MIN}-${DS_THRESHOLD_AVG}%`,
                belowTarget: `Outlet DS < ${DS_THRESHOLD_MIN}%`,
            };
        }
        return {
            aboveTarget: `Hari DS ≥ ${DS_THRESHOLD_AVG}%`,
            nearTarget: `Hari DS ${DS_THRESHOLD_MIN}-${DS_THRESHOLD_AVG}%`,
            belowTarget: `Hari DS < ${DS_THRESHOLD_MIN}%`,
        };
    };

    const statsLabels = getStatsLabel();

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.headerTop}>
                    <div>
                        <h3 style={styles.title}>
                            <FontAwesomeIcon
                                icon={faBullseye}
                                style={{
                                    marginRight: "10px",
                                    color: "#ef4444",
                                }}
                            />
                            {getChartTitle()}
                        </h3>
                        <p style={styles.subtitle}>{getChartSubtitle()}</p>

                        {/* Info Threshold DS */}
                        <div style={styles.dsThresholdInfo}>
                            <FontAwesomeIcon
                                icon={faPercentage}
                                style={{ marginRight: "6px", color: "#3b82f6" }}
                            />
                            <span style={styles.dsThresholdText}>
                                <strong>Threshold DS:</strong>{" "}
                                {DS_THRESHOLD_MIN}% - {DS_THRESHOLD_MAX}% |
                                <strong> Target:</strong> ≥{DS_THRESHOLD_AVG}%
                            </span>
                        </div>
                    </div>
                    <button onClick={exportToPDF} style={styles.exportButton}>
                        <FontAwesomeIcon
                            icon={faFilePdf}
                            style={{ marginRight: "8px" }}
                        />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* Mode Indicator */}
            <div style={styles.modeIndicator}>
                <span style={styles.modeLabel}>
                    Mode:{" "}
                    {isOutletMode ? "Analisis per Outlet" : "Analisis Harian"}
                </span>
                <span style={styles.dataCount}>
                    {isOutletMode
                        ? `${outletCount} outlet`
                        : `${chartData.length} hari`}
                </span>
            </div>

            {/* Overall Statistics */}
            {overallStats && (
                <div style={styles.statsContainer}>
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    backgroundColor: "#10b981",
                                }}
                            >
                                <FontAwesomeIcon icon={faArrowUp} />
                            </div>
                            <div style={styles.statContent}>
                                <div style={styles.statLabel}>
                                    {statsLabels.aboveTarget}
                                </div>
                                <div style={styles.statValue}>
                                    {overallStats.itemsAboveDSTarget} /{" "}
                                    {overallStats.totalItems}
                                </div>
                                <div style={styles.statPercentage}>
                                    {Math.round(
                                        (overallStats.itemsAboveDSTarget /
                                            overallStats.totalItems) *
                                            100
                                    )}
                                    %
                                </div>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    backgroundColor: "#f59e0b",
                                }}
                            >
                                <FontAwesomeIcon icon={faEquals} />
                            </div>
                            <div style={styles.statContent}>
                                <div style={styles.statLabel}>
                                    {statsLabels.nearTarget}
                                </div>
                                <div style={styles.statValue}>
                                    {overallStats.itemsNearDSTarget} /{" "}
                                    {overallStats.totalItems}
                                </div>
                                <div style={styles.statPercentage}>
                                    {Math.round(
                                        (overallStats.itemsNearDSTarget /
                                            overallStats.totalItems) *
                                            100
                                    )}
                                    %
                                </div>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    backgroundColor: "#ef4444",
                                }}
                            >
                                <FontAwesomeIcon icon={faArrowDown} />
                            </div>
                            <div style={styles.statContent}>
                                <div style={styles.statLabel}>
                                    {statsLabels.belowTarget}
                                </div>
                                <div style={styles.statValue}>
                                    {overallStats.itemsBelowDSTarget} /{" "}
                                    {overallStats.totalItems}
                                </div>
                                <div style={styles.statPercentage}>
                                    {Math.round(
                                        (overallStats.itemsBelowDSTarget /
                                            overallStats.totalItems) *
                                            100
                                    )}
                                    %
                                </div>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div
                                style={{
                                    ...styles.statIcon,
                                    backgroundColor: "#8b5cf6",
                                }}
                            >
                                <FontAwesomeIcon icon={faPercentage} />
                            </div>
                            <div style={styles.statContent}>
                                <div style={styles.statLabel}>Rata-rata DS</div>
                                <div style={styles.statValue}>
                                    {formatPercentage(overallStats.avgDS)}
                                </div>
                                <div style={styles.statSubtext}>
                                    Target: Rp{" "}
                                    {formatNumber(overallStats.avgTargetHead)} |
                                    Actual: Rp{" "}
                                    {formatNumber(overallStats.avgPerHead)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Combined Chart: Bar + Line */}
            <div ref={chartRef} style={styles.chartContainer}>
                <ResponsiveContainer
                    width="100%"
                    height={isOutletMode ? 500 : 400}
                >
                    <ComposedChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: isOutletMode ? 100 : 60,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e2e8f0"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="name"
                            angle={isOutletMode ? -45 : -45}
                            textAnchor="end"
                            height={isOutletMode ? 100 : 60}
                            tick={{ fontSize: isOutletMode ? 10 : 11 }}
                            interval={0}
                        />
                        <YAxis
                            tickFormatter={formatNumber}
                            label={{
                                value: "Nilai (Rupiah)",
                                angle: -90,
                                position: "insideLeft",
                                offset: 10,
                                style: { textAnchor: "middle", fontSize: 12 },
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="top"
                            height={40}
                            wrapperStyle={{ fontSize: "12px" }}
                        />

                        {/* Bar untuk Per Head Aktual - Warna berdasarkan DS */}
                        <Bar
                            dataKey="avgPerHead"
                            name="Per Head Aktual"
                            fill="#10b981"
                            radius={[4, 4, 0, 0]}
                            barSize={isOutletMode ? 25 : 30}
                            opacity={0.8}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        entry.isAboveDSTarget
                                            ? "#10b981" // Hijau untuk DS ≥ 33.5%
                                            : entry.isNearDSTarget
                                            ? "#f59e0b" // Kuning untuk 33-33.5%
                                            : "#ef4444" // Merah untuk DS < 33%
                                    }
                                    opacity={0.8}
                                />
                            ))}
                        </Bar>

                        {/* Line untuk Target Head (garis putus-putus merah) */}
                        <Line
                            type="monotone"
                            dataKey="avgTargetHead"
                            name="Target Head"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={{
                                r: 4,
                                stroke: "#ef4444",
                                strokeWidth: 2,
                                fill: "white",
                            }}
                            activeDot={{
                                r: 6,
                                stroke: "#ef4444",
                                strokeWidth: 2,
                                fill: "white",
                            }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div style={styles.legendContainer}>
                <div style={styles.legendTitle}>
                    Keterangan Visual (Berdasarkan DS):
                </div>
                <div style={styles.legendGrid}>
                    <div style={styles.legendSection}>
                        <div style={styles.legendSubtitle}>
                            Bar Chart (Per Head Aktual):
                        </div>
                        <div style={styles.legendItems}>
                            <div style={styles.legendItem}>
                                <div
                                    style={{
                                        ...styles.legendColor,
                                        backgroundColor: "#10b981",
                                    }}
                                ></div>
                                <span style={styles.legendText}>
                                    DS ≥ {DS_THRESHOLD_AVG}% (Target tercapai)
                                </span>
                            </div>
                            <div style={styles.legendItem}>
                                <div
                                    style={{
                                        ...styles.legendColor,
                                        backgroundColor: "#f59e0b",
                                    }}
                                ></div>
                                <span style={styles.legendText}>
                                    DS {DS_THRESHOLD_MIN}-{DS_THRESHOLD_AVG}%
                                    (Mendekati target)
                                </span>
                            </div>
                            <div style={styles.legendItem}>
                                <div
                                    style={{
                                        ...styles.legendColor,
                                        backgroundColor: "#ef4444",
                                    }}
                                ></div>
                                <span style={styles.legendText}>
                                    DS &lt; {DS_THRESHOLD_MIN}% (Di bawah
                                    target)
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={styles.legendSection}>
                        <div style={styles.legendSubtitle}>
                            Line Chart (Target Head):
                        </div>
                        <div style={styles.legendItems}>
                            <div style={styles.legendItem}>
                                <div
                                    style={{
                                        ...styles.legendLine,
                                        background:
                                            "repeating-linear-gradient(90deg, #ef4444, #ef4444 5px, transparent 5px, transparent 10px)",
                                    }}
                                ></div>
                                <span style={styles.legendText}>
                                    Garis putus-putus merah = Target Head
                                </span>
                            </div>
                            <div style={styles.legendItem}>
                                <div
                                    style={{
                                        ...styles.legendDot,
                                        backgroundColor: "white",
                                        border: "2px solid #ef4444",
                                    }}
                                ></div>
                                <span style={styles.legendText}>
                                    Titik = Nilai target
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Table */}
            <div style={styles.summaryTable}>
                <div style={styles.tableHeader}>
                    <FontAwesomeIcon
                        icon={isOutletMode ? faStore : faCalendarDay}
                        style={{ marginRight: "8px" }}
                    />
                    {isOutletMode
                        ? "Detail Performa per Outlet (Berdasarkan DS)"
                        : "Detail Performa Harian (Berdasarkan DS)"}
                </div>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                {isOutletMode ? (
                                    <>
                                        <th style={styles.tableTh}>Outlet</th>
                                        <th style={styles.tableTh}>LOB</th>
                                    </>
                                ) : (
                                    <>
                                        <th style={styles.tableTh}>Tanggal</th>
                                        <th style={styles.tableTh}>Hari</th>
                                    </>
                                )}
                                <th style={styles.tableTh}>Target Head</th>
                                <th style={styles.tableTh}>Per Head Aktual</th>
                                <th style={styles.tableTh}>Selisih</th>
                                <th style={styles.tableTh}>DS (%)</th>
                                <th style={styles.tableTh}>
                                    {isOutletMode ? "Laporan" : "Outlet"}
                                </th>
                                <th style={styles.tableTh}>Status DS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chartData.map((item, index) => (
                                <tr key={index} style={styles.tableRow}>
                                    {isOutletMode ? (
                                        <>
                                            <td style={styles.tableTd}>
                                                <div
                                                    style={{ fontWeight: 500 }}
                                                >
                                                    {item.fullName}
                                                </div>
                                            </td>
                                            <td style={styles.tableTd}>
                                                <span style={styles.lobBadge}>
                                                    {item.lob}
                                                </span>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={styles.tableTd}>
                                                <div
                                                    style={{ fontWeight: 500 }}
                                                >
                                                    {item.name}
                                                </div>
                                            </td>
                                            <td style={styles.tableTd}>
                                                <div
                                                    style={{
                                                        fontSize: "0.8rem",
                                                        color: "#64748b",
                                                    }}
                                                >
                                                    {
                                                        formatDate(
                                                            item.fullDate
                                                        ).split(" ")[0]
                                                    }
                                                </div>
                                            </td>
                                        </>
                                    )}
                                    <td style={styles.tableTd}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "12px",
                                                    height: "2px",
                                                    background:
                                                        "repeating-linear-gradient(90deg, #ef4444, #ef4444 2px, transparent 2px, transparent 4px)",
                                                }}
                                            ></div>
                                            <strong
                                                style={{ color: "#ef4444" }}
                                            >
                                                {formatNumber(
                                                    item.avgTargetHead
                                                )}
                                            </strong>
                                        </div>
                                    </td>
                                    <td style={styles.tableTd}>
                                        <strong
                                            style={{
                                                color: item.statusColor,
                                            }}
                                        >
                                            {formatNumber(item.avgPerHead)}
                                        </strong>
                                    </td>
                                    <td style={styles.tableTd}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                            }}
                                        >
                                            <FontAwesomeIcon
                                                icon={item.statusIcon}
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: item.statusColor,
                                                }}
                                            />
                                            <span
                                                style={{
                                                    color:
                                                        item.difference >= 0
                                                            ? "#10b981"
                                                            : "#ef4444",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {item.difference >= 0
                                                    ? "+"
                                                    : ""}
                                                {formatNumber(item.difference)}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={styles.tableTd}>
                                        <span
                                            style={{
                                                color: item.statusColor,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {formatPercentage(item.avgDS)}
                                        </span>
                                    </td>
                                    <td style={styles.tableTd}>
                                        <div
                                            style={{
                                                fontSize: "0.8rem",
                                                color: "#64748b",
                                            }}
                                        >
                                            {isOutletMode
                                                ? `${item.reportCount} laporan`
                                                : `${item.outletCount} outlet`}
                                        </div>
                                    </td>
                                    <td style={styles.tableTd}>
                                        <span
                                            style={{
                                                ...styles.statusBadge,
                                                backgroundColor:
                                                    item.statusColor + "20",
                                                color: item.statusColor,
                                            }}
                                        >
                                            {item.achievementText}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e2e8f0",
    },
    header: {
        marginBottom: "1rem",
    },
    headerTop: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "1rem",
    },
    title: {
        fontSize: "1.25rem",
        fontWeight: 600,
        color: "#1e293b",
        margin: "0 0 0.5rem 0",
        display: "flex",
        alignItems: "center",
    },
    subtitle: {
        fontSize: "0.9rem",
        color: "#64748b",
        margin: 0,
    },
    dsThresholdInfo: {
        display: "flex",
        alignItems: "center",
        marginTop: "0.5rem",
        padding: "0.5rem",
        backgroundColor: "#f0f9ff",
        borderRadius: "6px",
        borderLeft: "3px solid #3b82f6",
    },
    dsThresholdText: {
        fontSize: "0.85rem",
        color: "#1e293b",
    },
    exportButton: {
        padding: "0.5rem 1rem",
        backgroundColor: "#ef4444",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: 500,
        fontSize: "0.85rem",
        display: "flex",
        alignItems: "center",
        transition: "all 0.2s ease",
        "&:hover": {
            backgroundColor: "#dc2626",
            transform: "translateY(-1px)",
        },
    },
    modeIndicator: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        padding: "0.75rem 1rem",
        borderRadius: "8px",
        marginBottom: "1.5rem",
        border: "1px solid #e2e8f0",
    },
    modeLabel: {
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "#4b5563",
    },
    dataCount: {
        fontSize: "0.85rem",
        fontWeight: 600,
        color: "#3b82f6",
        backgroundColor: "#eff6ff",
        padding: "0.25rem 0.75rem",
        borderRadius: "20px",
    },
    noDataContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem",
        color: "#94a3b8",
        textAlign: "center",
    },
    noDataText: {
        fontSize: "1rem",
        fontWeight: 500,
        margin: "1rem 0 0.5rem 0",
    },
    noDataSubtext: {
        fontSize: "0.85rem",
        color: "#cbd5e1",
    },
    statsContainer: {
        marginBottom: "1.5rem",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        marginBottom: "1rem",
    },
    statCard: {
        backgroundColor: "#f8fafc",
        borderRadius: "10px",
        padding: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        border: "1px solid #e2e8f0",
        transition: "transform 0.2s ease",
        "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        },
    },
    statIcon: {
        width: "45px",
        height: "45px",
        borderRadius: "8px",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
    },
    statContent: {
        flex: 1,
    },
    statLabel: {
        fontSize: "0.75rem",
        color: "#64748b",
        marginBottom: "0.25rem",
    },
    statValue: {
        fontSize: "1.1rem",
        fontWeight: 600,
        color: "#1e293b",
        marginBottom: "0.25rem",
    },
    statPercentage: {
        fontSize: "0.75rem",
        color: "#64748b",
        fontWeight: 500,
    },
    statSubtext: {
        fontSize: "0.7rem",
        color: "#94a3b8",
        marginTop: "0.25rem",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    chartContainer: {
        width: "100%",
        marginBottom: "1.5rem",
        backgroundColor: "white",
        padding: "1rem",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
    },
    customTooltip: {
        backgroundColor: "white",
        padding: "1rem",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        maxWidth: "300px",
        fontSize: "0.85rem",
    },
    tooltipLabel: {
        fontWeight: 600,
        margin: "0 0 0.5rem 0",
        color: "#1e293b",
        fontSize: "0.9rem",
        borderBottom: "2px solid #e2e8f0",
        paddingBottom: "0.25rem",
    },
    legendContainer: {
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "1rem",
        marginBottom: "1.5rem",
        fontSize: "0.85rem",
    },
    legendTitle: {
        fontWeight: 600,
        color: "#4b5563",
        marginBottom: "0.75rem",
        fontSize: "0.9rem",
    },
    legendGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
    },
    legendSection: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
    },
    legendSubtitle: {
        fontSize: "0.8rem",
        fontWeight: 600,
        color: "#4b5563",
        marginBottom: "0.25rem",
    },
    legendItems: {
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
    },
    legendItem: {
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
    },
    legendColor: {
        width: "16px",
        height: "16px",
        borderRadius: "4px",
        flexShrink: 0,
    },
    legendLine: {
        width: "40px",
        height: "3px",
        flexShrink: 0,
    },
    legendDot: {
        width: "12px",
        height: "12px",
        borderRadius: "50%",
        flexShrink: 0,
    },
    legendText: {
        fontSize: "0.8rem",
        color: "#6b7280",
        lineHeight: 1.3,
    },
    summaryTable: {
        marginTop: "1.5rem",
    },
    tableHeader: {
        fontSize: "0.9rem",
        fontWeight: 600,
        color: "#4b5563",
        marginBottom: "0.75rem",
        paddingBottom: "0.5rem",
        borderBottom: "2px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
    },
    tableContainer: {
        overflowX: "auto",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        minWidth: "900px",
    },
    tableTh: {
        padding: "0.75rem",
        textAlign: "left",
        backgroundColor: "#f8fafc",
        color: "#4b5563",
        fontWeight: 600,
        fontSize: "0.8rem",
        borderBottom: "1px solid #e2e8f0",
        whiteSpace: "nowrap",
    },
    tableRow: {
        backgroundColor: "white",
        transition: "background-color 0.2s ease",
        "&:hover": {
            backgroundColor: "#f8fafc",
        },
    },
    tableTd: {
        padding: "0.75rem",
        borderBottom: "1px solid #e2e8f0",
        fontSize: "0.85rem",
        verticalAlign: "middle",
    },
    lobBadge: {
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        backgroundColor: "#e0e7ff",
        color: "#3730a3",
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: 500,
    },
    statusBadge: {
        display: "inline-block",
        padding: "0.25rem 0.75rem",
        borderRadius: "12px",
        fontSize: "0.75rem",
        fontWeight: 500,
        textAlign: "center",
        whiteSpace: "nowrap",
    },
};

export default TargetHeadVsPerHeadAnalysis;
