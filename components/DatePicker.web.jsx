export default function DatePicker({ value, onChange }) {
  const today = new Date().toISOString().split("T")[0];

  const toInputValue = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <input
      type="date"
      value={toInputValue(value)}
      min={today}
      onChange={(e) => {
        const date = e.target.value ? new Date(e.target.value) : null;
        onChange({ type: "set" }, date);
      }}
      style={{
        width: "100%",
        padding: "12px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        backgroundColor: "#fff",
        color: "#333",
        outline: "none",
        cursor: "pointer",
        boxSizing: "border-box",
      }}
    />
  );
}
