/** Shared ERP footer used by every page wrapped in AppLayout. */
export default function Footer() {
  return (
    <footer className="dashboard-footer">
      <span>© {new Date().getFullYear()} SalePro. All rights reserved.</span>
      <span className="footer-links">
        <a href="/help">Help</a>
        <span aria-hidden="true">·</span>
        <a href="/documentation">Documentation</a>
      </span>
    </footer>
  );
}
