import { useRef, useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  BarChart2,
  Settings,
  Building2,
  ChevronRight,
  ArrowLeft,
  Bell,
  Upload,
  FileUp,
  CheckCircle2,
  XCircle,
  ClipboardList,
  Loader2,
  Download,
  ExternalLink,
} from "lucide-react";

const API_URL =
  "https://ryze.granitestack.io/sl-api/process/webapi_handler/Registration_Create";

const BUILD_REPORT_URL =
  "https://ryze.granitestack.io/sl-api/process/webapi_handler/BuildReport";

const DOWNLOAD_REPORT_URL =
  "https://ryze.granitestack.io/sl-api/process/webapi_handler/DownloadReport";

const COOLDOWN_SECONDS = 30;


const applicant = {
  firstName: "Sarthak",
  lastName: "Hans",
  employeeId: "1120",
};

const navigationSections = [
  {
    label: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard" },
      { icon: Users, label: "Customers" },
      { icon: FileText, label: "Loan Applications", active: true },
      { icon: FileText, label: "Loans" },
      { icon: CreditCard, label: "Credit Line Facilities" },
      { icon: CreditCard, label: "Cards" },
    ],
  },
  {
    label: "Reports",
    items: [{ icon: BarChart2, label: "Reports" }],
  },
  {
    label: "Settings",
    items: [
      { icon: Users, label: "Employees" },
      { icon: Building2, label: "Businesses" },
    ],
  },
];

const tabs = [
  "Overview",
  "Needs",
  "Applicants and Parties",
  "Collaterals",
  "Documents",
  "KYC | KYB",
  "Financials",
  "Review and Lodge",
];

export default function DocumentWorkspace() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [appId, setAppId] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportStatus, setReportStatus] = useState(null);
  const [reportReady, setReportReady] = useState(false);
  const [reportCountdown, setReportCountdown] = useState(0);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    if (reportCountdown <= 0) return;
    if (reportCountdown === 1) setReportReady(true);
    const timer = setTimeout(() => setReportCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [reportCountdown]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleUploadClick = () => {
    if (!file) {
      fileInputRef.current?.click();
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setStatus(null);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const payload = {
    pdf_url:"https://ryze.granitestack.io/documents/public/1b1210ae-c99a-4cf2-a7a4-47c986356e52-15-10-2026-11-32-17.pdf",
    app_ref:`SARTHAK${randomSuffix}`
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data = await response.json();
      const raw = data?.Response?.[0]?.App_ID;
      const extractedAppId = raw != null ? Number(raw) : null;
      setAppId(extractedAppId);
      setCooldown(COOLDOWN_SECONDS);
      setStatus({ success: true, message: "Document submitted successfully." });
    } catch (error) {
      setStatus({
        success: false,
        message: error instanceof Error ? error.message : "The request failed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuildReport = async () => {
    setReportLoading(true);
    setReportStatus(null);
    try {
      const response = await fetch(BUILD_REPORT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ App_ID: appId }),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      setReportStatus({ success: true, message: "Report build initiated successfully." });
      setReportReady(false);
      setReportCountdown(60);
    } catch (error) {
      setReportStatus({
        success: false,
        message: error instanceof Error ? error.message : "Report request failed.",
      });
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    setDownloadLoading(true);
    setReportStatus(null);
    const tab = window.open("", "_blank");
    try {
      const response = await fetch(DOWNLOAD_REPORT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ App_ID: appId }),
      });
      if (!response.ok) throw new Error(`Request failed (${response.status})`);
      const data = await response.json();
      const reportUrl = data?.report;
      console.log("report key received:", reportUrl ?? null);
      if (!reportUrl) throw new Error("No report URL returned.");
      tab.location.href = reportUrl;
    } catch (error) {
      tab.close();
      setReportStatus({
        success: false,
        message: error instanceof Error ? error.message : "Download failed.",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Elders home">
          Elders
        </a>
        <nav className="side-navigation" aria-label="Main navigation">
          {navigationSections.map((section) => (
            <section className="nav-section" key={section.label}>
              <h2>{section.label}</h2>
              {section.items.map(({ icon: Icon, label, active }) => (
                <a
                  className={`side-link${active ? " active" : ""}`}
                  href="#"
                  key={label}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="side-icon" aria-hidden="true">
                    <Icon size={13} strokeWidth={1.8} />
                  </span>
                  {label}
                </a>
              ))}
            </section>
          ))}
        </nav>
        <div className="sidebar-footer">
          <a className="side-link" href="#">
            <span className="side-icon"><ArrowLeft size={13} strokeWidth={1.8} /></span>
            Back to admin console
          </a>
          <a className="side-link" href="#">
            <span className="side-icon"><Bell size={13} strokeWidth={1.8} /></span>
            Notifications
          </a>
          <div className="profile">
            <span className="profile-avatar" aria-hidden="true">S</span>
            <span>
              <strong>sarthak.hans</strong>
              <small>Elders</small>
            </span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="page-header">
          <div className="breadcrumb">
            <button className="back-button" type="button" aria-label="Back">
              <ArrowLeft size={14} strokeWidth={2} />
            </button>
            <span>Loan Applications</span>
            <ChevronRight size={16} className="breadcrumb-separator" />
            <strong>Edit Loan Application | LA-00511</strong>
          </div>
          <nav className="page-tabs" aria-label="Loan application sections">
            {tabs.map((tab) => (
              <a className={tab === "Documents" ? "selected" : ""} href="#" key={tab}>
                {tab}
              </a>
            ))}
          </nav>
        </header>

        <section className="content-card" aria-labelledby="documents-heading">
          <div className="content-heading">
            <div>
              <h1 id="documents-heading">Documents</h1>
              <p>Manage and submit documents for this loan application.</p>
            </div>
          </div>

          <div className="applicant-list">
            <button
              className="applicant-row"
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((c) => !c)}
            >
              <ChevronRight
                size={18}
                strokeWidth={2}
                className={`row-chevron${expanded ? " open" : ""}`}
              />
              <span className="applicant-info">
                <strong>{applicant.firstName} {applicant.lastName}</strong>
                <span>Borrower</span>
              </span>
              <span className="upload-count">Document submission</span>
            </button>

            {expanded && (
              <div className="document-details">
                <div className="document-description">
                  <span className="document-icon" aria-hidden="true">
                    <FileText size={16} strokeWidth={1.5} color="#d9434d" />
                    <small>PDF</small>
                  </span>
                  <span>
                    <strong>{file?.name ?? "Bank Statements"}</strong>
                    <small>
                      {file
                        ? `${(file.size / 1024 / 1024).toFixed(2)} MB · Ready to submit`
                        : "Choose a PDF or image to submit"}
                    </small>
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  className="visually-hidden"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] ?? null);
                    setStatus(null);
                  }}
                />

                <div className="action-buttons">
                  <button
                    className="submit-button"
                    type="button"
                    disabled={loading}
                    onClick={handleUploadClick}
                  >
                    {loading ? (
                      <><Loader2 size={14} strokeWidth={2} className="spin" /> Submitting…</>
                    ) : file ? (
                      <><Upload size={14} strokeWidth={2} /> Upload document</>
                    ) : (
                      <><FileUp size={14} strokeWidth={2} /> Choose document</>
                    )}
                  </button>

                  {appId && (
                    <button
                      className="report-button"
                      type="button"
                      disabled={cooldown > 0 || reportLoading || downloadLoading || reportCountdown > 0}
                      onClick={reportReady ? handleDownloadReport : handleBuildReport}
                      title={cooldown > 0 ? `Available in ${cooldown}s` : undefined}
                    >
                      {reportLoading || downloadLoading ? (
                        <><Loader2 size={14} strokeWidth={2} className="spin" /> {reportReady ? "Opening…" : "Building…"}</>
                      ) : reportCountdown > 0 ? (
                        <><Loader2 size={14} strokeWidth={2} className="spin" /> Preparing… ({reportCountdown}s)</>
                      ) : reportReady ? (
                        <><ExternalLink size={14} strokeWidth={2} /> View Report</>
                      ) : (
                        <><ClipboardList size={14} strokeWidth={2} />{cooldown > 0 ? ` Build Report (${cooldown}s)` : " Build Report"}</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="list-footer">
            <span>1-1 of 1</span>
            <div className="status-group">
              {status && (
                <p className={`status-message ${status.success ? "success" : "error"}`} role="status">
                  {status.success
                    ? <><CheckCircle2 size={13} /> {status.message}</>
                    : <><XCircle size={13} /> {status.message}</>}
                </p>
              )}
              {reportStatus && (
                <p className={`status-message ${reportStatus.success ? "success" : "error"}`} role="status">
                  {reportStatus.success
                    ? <><CheckCircle2 size={13} /> {reportStatus.message}</>
                    : <><XCircle size={13} /> {reportStatus.message}</>}
                </p>
              )}
            </div>
          </div>
          <p className="upload-note">
            This demo submits the configured document URL with the request; the selected local file is not sent to the endpoint.
          </p>
        </section>
      </main>
    </div>
  );
}
