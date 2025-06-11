import React, { useState, useEffect } from "react";
import Footer from './Footer';
import { useNavigate } from 'react-router-dom';
import NavbarWithNotification from './NavbarWithNotification';
import Loader from './Loader';
import { useTranslation } from 'react-i18next';

export default function NotificationPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [data2, setData2] = useState([]);
  const [isLoadingHardware, setIsLoadingHardware] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.user_type !== 'administrator') {
      alert(t("notifications.accessDenied"));
      setIsAuthorized(false);
      navigate('/homein');
    } else {
      setIsAuthorized(true);
    }
  }, [navigate]);

  useEffect(() => {
    if (isAuthorized !== true) return;

    const token = localStorage.getItem("token");

    // Mark notifications as read
    fetch("http://localhost:8000/api/mark-requests-read/", {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ type: "publisher" }),
    });

    fetch("http://localhost:8000/api/mark-requests-read/", {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ type: "hardware" }),
    }).then(() => {
      localStorage.setItem("unreadNotifications", 0);
    });

    // Fetch unread counts
    Promise.all([
      fetch("http://localhost:8000/api/unread-publisher-count/", {
        headers: { "Authorization": `Token ${token}` }
      }).then(res => res.json()),

      fetch("http://localhost:8000/api/unread-hardware-count/", {
        headers: { "Authorization": `Token ${token}` }
      }).then(res => res.json()),
    ]).then(([publisherData, hardwareData]) => {
      const totalUnread = (publisherData.unread_count || 0) + (hardwareData.unread_count || 0);
      localStorage.setItem("unreadNotifications", totalUnread);
    });

    // Fetch publisher requests
    fetch("http://localhost:8000/api/publisher-requests/", {
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(response => {
        if (Array.isArray(response)) {
          setData(response);
          localStorage.setItem("unreadNotifications", response.length);
        } else {
          setData([]);
          localStorage.setItem("unreadNotifications", 0);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setData([]);
        setIsLoading(false);
        localStorage.setItem("unreadNotifications", 0);
      });

    // Fetch hardware requests
    fetch("http://localhost:8000/api/hardware-requests/", {
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(response => {
        if (Array.isArray(response)) {
          const filteredData = response.filter(item => item.status === 'pending');
          const processedData = filteredData.map(item => ({
            ...item,
            type: item.type || "hardware",
            kits: item.kits !== undefined ? item.kits : 1,
          }));
          setData2(processedData);
        } else {
          setData2([]);
        }
        setIsLoadingHardware(false);
      })
      .catch(() => {
        setData2([]);
        setIsLoadingHardware(false);
      });

  }, [isAuthorized]);

  const handleStatusChange = (id, status, isHardware = false) => {
    const token = localStorage.getItem("token");
    const endpoint = isHardware
      ? `http://localhost:8000/api/hardware-requests/${id}/`
      : `http://localhost:8000/api/publisher-requests/${id}/`;

    fetch(endpoint, {
      method: "PATCH",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to update status");
        return res.json();
      })
      .then(() => {
        alert(status === "accepted" ? t("notifications.requestAccepted") : t("notifications.requestRefused"));
        if (isHardware) {
          setData2(prev => prev.filter(item => item.id !== id));
        } else {
          setData(prev => prev.filter(item => item.id !== id));
        }

        let currentUnread = parseInt(localStorage.getItem("unreadNotifications")) || 0;
        if (currentUnread > 0) {
          localStorage.setItem("unreadNotifications", currentUnread - 1);
        }
      })
      .catch(() => {
        alert(t("notifications.errorUpdating"));
      });
  };

  // Show loader while authorizing or loading data
  if (isAuthorized === null || isLoading || isLoadingHardware) {
    return <Loader />;
  }

return (
    <div>
      <NavbarWithNotification />
      <div className="container" dir={isRTL ? "rtl" : "ltr"}>
        <div className="table-responsive pt-5">
          <h2 className={`text-${isRTL ? 'end' : 'start'}`}>{t("notifications.publisherTitle")}</h2>
          <table className="table table-bordered table-hover notif-table">
            <thead>
              <tr>
                <th></th>
                <th>{t("notifications.name")}</th>
                <th>{t("notifications.email")}</th>
                <th>{t("notifications.link")}</th>
                <th>{t("notifications.phone")}</th>
                <th style={{ color: "green" }}>{t("notifications.accept")}</th>
                <th style={{ color: "red" }}>{t("notifications.refuse")}</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr><td colSpan="7" className="text-center">{t("notifications.noEntries")}</td></tr>
              )}
              {data.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>
                    <a href={row.article_link} target="_blank" rel="noreferrer">{t("notifications.viewArticle")}</a>
                  </td>
                  <td>{row.phone}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.status === "accepted"}
                      onChange={() => handleStatusChange(row.id, "accepted")}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.status === "refused"}
                      onChange={() => handleStatusChange(row.id, "refused")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-responsive pt-3">
          <h2  className={`text-${isRTL ? 'end' : 'start'}`}>{t("notifications.hardwareTitle")}</h2>
          <table className="table table-bordered table-hover notif-table">
            <thead>
              <tr>
                <th></th>
                <th>{t("notifications.name")}</th>
                <th>{t("notifications.email")}</th>
                <th>{t("notifications.phone")}</th>
                <th>{t("notifications.kitsOrSetup")}</th>
                <th style={{ color: "green" }}>{t("notifications.accept")}</th>
                <th style={{ color: "red" }}>{t("notifications.refuse")}</th>
              </tr>
            </thead>
            <tbody>
              {data2.length === 0 && (
                <tr><td colSpan="7" className="text-center">{t("notifications.noEntries")}</td></tr>
              )}
              {data2.map((row, index) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: "bold" }}>{index + 1}</td>
                  <td>{row.name}</td>
                  <td>{row.email}</td>
                  <td>{row.phone}</td>
                  <td>{row.type === "hardware" ? row.kits : "Setup"}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.status === "accepted"}
                      onChange={() => handleStatusChange(row.id, "accepted", true)}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={row.status === "refused"}
                      onChange={() => handleStatusChange(row.id, "refused", true)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-end">
          <button className="btn main-btn mb-5 rounded-pill" onClick={() => navigate(-1)}> {t("notifications.back")}</button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
