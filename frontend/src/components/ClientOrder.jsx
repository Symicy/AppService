import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchOrderByToken } from "../services/api/qrApi.jsx";

function formatDate(dt) {
  if (!dt) return "-";
  try {
    const d = new Date(dt);
    return d.toLocaleString();
  } catch {
    return dt;
  }
}

function maskIdentifier(value = "") {
  const s = String(value).trim();
  if (!s) return "-";
  if (s.length <= 4) return "****";
  return `${"*".repeat(Math.max(0, s.length - 4))}${s.slice(-4)}`;
}

export default function ClientOrder() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    fetchOrderByToken(token)
      .then((json) => alive && setData(json))
      .catch((e) => alive && setErr(e.message || "Failed to load"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [token]);

  const device = useMemo(() => {
    // Attempt common shapes: data.device or fields within data
    const d = data?.device || data?.order?.device || data?.orderDevice || null;
    return d || null;
  }, [data]);

  const order = useMemo(() => {
    // Attempt OrderDetailDTO-like or flattened order
    return data?.order || data || null;
  }, [data]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="card">
          <div className="card-body">Loading order…</div>
        </div>
      </div>
    );
  }

  if (err || !order) {
    return (
      <div style={{ padding: 24 }}>
        <div className="card">
          <div className="card-body">
            <h3 style={{ marginTop: 0 }}>Order not found</h3>
            <p>{err || "This link is invalid or expired."}</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract client-safe fields
  const orderNo = order.number || order.code || order.orderNumber || `#${order.id ?? ""}`;
  const status = order.status || order.currentStatus || "-";
  const createdAt = order.createdAt || order.created || order.createdDate;
  const dueAt = order.dueAt || order.dueDate || order.estimatedReadyAt;
  const clientName = order.clientName || order.client?.name || "-";
  const problem = order.problem || order.reportedIssue || device?.problem || "-";
  const accessories =
    order.accessories ||
    device?.accessories ||
    order.predefinedAccessories ||
    [];
  const notes = order.publicNotes || order.notesPublic || null;

  const brand = device?.brand || device?.manufacturer || "-";
  const model = device?.model || "-";
  const imei = device?.imei || device?.imei1 || device?.imeiNo;
  const serial = device?.serial || device?.sn || device?.serialNumber;
  const color = device?.color || "-";

  return (
    <div style={{ padding: 16 }}>
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0 }}>Order {orderNo}</h2>
            <div style={{ color: "#666" }}>for {clientName}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="badge">{String(status)}</span>
            <button onClick={() => window.print()} className="btn">
              Print
            </button>
          </div>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: 0,
        }}
      >
        <div
          className="card-body"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {/* Device column */}
          <div style={{ borderRight: "1px solid rgba(0,0,0,0.06)", paddingRight: 12 }}>
            <h3 style={{ marginTop: 0 }}>Device</h3>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 8, columnGap: 8 }}>
              <div style={{ color: "#666" }}>Brand</div>
              <div>{brand}</div>

              <div style={{ color: "#666" }}>Model</div>
              <div>{model}</div>

              <div style={{ color: "#666" }}>IMEI</div>
              <div>{maskIdentifier(imei)}</div>

              <div style={{ color: "#666" }}>Serial</div>
              <div>{maskIdentifier(serial)}</div>

              <div style={{ color: "#666" }}>Color</div>
              <div>{color || "-"}</div>

              <div style={{ color: "#666" }}>Problem</div>
              <div>{problem || "-"}</div>

              <div style={{ color: "#666" }}>Accessories</div>
              <div>
                {Array.isArray(accessories)
                  ? accessories.length
                    ? accessories.join(", ")
                    : "-"
                  : accessories || "-"}
              </div>
            </div>
          </div>

          {/* Order column */}
          <div style={{ paddingLeft: 12 }}>
            <h3 style={{ marginTop: 0 }}>Order</h3>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 8, columnGap: 8 }}>
              <div style={{ color: "#666" }}>Order #</div>
              <div>{orderNo}</div>

              <div style={{ color: "#666" }}>Status</div>
              <div><span className="badge">{String(status)}</span></div>

              <div style={{ color: "#666" }}>Created</div>
              <div>{formatDate(createdAt)}</div>

              <div style={{ color: "#666" }}>Estimated Ready</div>
              <div>{formatDate(dueAt)}</div>

              {notes ? (
                <>
                  <div style={{ color: "#666" }}>Notes</div>
                  <div>{notes}</div>
                </>
              ) : null}
            </div>

            {/* Optional public timeline if provided */}
            {Array.isArray(order.logs || order.publicLogs) && (order.logs || order.publicLogs).length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ margin: "16px 0 8px" }}>Updates</h4>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {(order.publicLogs || order.logs).map((l, idx) => (
                    <li key={idx}>
                      <strong>{formatDate(l.createdAt || l.time)}</strong> — {l.message || l.status || l.note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 860px) {
            .card-body {
              grid-template-columns: 1fr !important;
            }
            .card-body > div:first-child {
              border-right: none !important;
              padding-right: 0 !important;
              border-bottom: 1px solid rgba(0,0,0,0.06);
              padding-bottom: 12px;
              margin-bottom: 12px;
            }
            .card-body > div:last-child {
              padding-left: 0 !important;
            }
          }
        `}
      </style>
    </div>
  );
}