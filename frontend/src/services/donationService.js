import api from "./api";

export const getDonationQr = (requestId) => api.get(`/donations/qr/${requestId}`);
export const inspectToken = (token) => api.post("/donations/inspect", { token });
export const verifyToken = (token) => api.post("/donations/verify", { token });
export const getMyDonations = () => api.get("/donations/mine");

export const downloadCertificateFile = async (donation) => {
  const { data } = await api.get(`/donations/${donation._id}/certificate`, {
    responseType: "blob",
  });
  const url = URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${donation.certificateId}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};