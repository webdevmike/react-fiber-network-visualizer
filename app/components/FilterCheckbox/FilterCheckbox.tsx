import styles from "./FilterCheckbox.module.css";

type FilterCheckboxProps = {
  display?: {
    type: "bar" | "circle";
    color: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
};

export default function FilterCheckbox({
  display,
  onChange,
  label,
}: FilterCheckboxProps) {
  return (
    <label
      className={[
        styles.filter,
        display?.type === "bar" && styles.bar,
        display?.type === "circle" && styles.circle,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input type="checkbox" defaultChecked onChange={onChange} aria-label={`Toggle ${label}`} />
      <div className={styles.labelContent}>
        {display?.type === "circle" && (
          <span
            style={{ backgroundColor: display.color }}
            className={styles.labelDisplay}
          />
        )}
        <span className={styles.labelText}>
          {label}
        </span>
        {display?.type === "bar" && (
          <span
            style={{ backgroundColor: display.color }}
            className={styles.labelDisplay}
          />
        )}
      </div>
    </label>
  );
}
