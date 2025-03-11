const ADMIN_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3001/admin"
    : "http://43.201.136.44:3001/admin";

export default ADMIN_URL;