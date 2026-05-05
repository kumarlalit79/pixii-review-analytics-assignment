import pixiiLogo from "../src/assets/pixiilogo.svg";

export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: "#FFFFFF",
        borderBottom: "1px solid #e8e4e0",
        padding: "16px 32px",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ maxWidth: "1280px", margin: "0 auto" }}
      >
        <img src={pixiiLogo} alt="Pixii.ai" style={{ height: "28px" }} />
        <span
          style={{
            fontFamily: "'Switzer', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            color: "#6b6b6b",
          }}
        >
          Review Analytics
        </span>
      </div>
    </nav>
  );
}
