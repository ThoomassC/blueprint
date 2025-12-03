import type { EditorElement } from "../../types/editor";
import { useEditorStore } from "../../store/useEditorStore";
import { useState } from "react";

const getEmbedUrl = (url: string) => {
  if (url.includes("youtube.com/watch?v=")) {
    return url.replace("watch?v=", "embed/");
  }
  if (url.includes("youtu.be/")) {
    return url.replace("youtu.be/", "www.youtube.com/embed/");
  }
  return url;
};

export const RenderNode = ({ element }: { element: EditorElement }) => {
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const updateElement = useEditorStore((state) => state.updateElement);
  const [emailError, setEmailError] = useState<string>("");

  const styles: React.CSSProperties = {
    ...element.style,
    width: element.style?.width || "100%",
    height: element.style?.height || "auto",
    fontFamily: element.style?.fontFamily || "Arial",
  };

  const interactionStyle = {
    pointerEvents: isPreviewMode ? "auto" : "none",
  } as const;

  switch (element.type) {
    case "video": {
      const isYoutube =
        element.content.includes("youtube") ||
        element.content.includes("youtu.be");

      if (isYoutube) {
        return (
          <iframe
            src={getEmbedUrl(element.content)}
            style={{ ...styles, ...interactionStyle, border: "none" }}
            title="Video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      } else {
        return (
          <video
            src={element.content}
            style={{ ...styles, ...interactionStyle, backgroundColor: "#000" }}
            controls
          >
            Votre navigateur ne supporte pas la balise vidéo.
          </video>
        );
      }
    }

    case "image":
      return (
        <img
          src={element.content}
          alt="Contenu"
          style={{ ...styles, objectFit: "cover", display: "block" }}
          draggable={false}
        />
      );

    case "select":
      return (
        <div style={{ minWidth: "150px" }}>
          <select
            style={{
              ...interactionStyle,
              width: "100%",
              padding: "5px",
              fontFamily: styles.fontFamily,
            }}
            value={element.content}
            onChange={(e) =>
              updateElement(element.id, { content: e.target.value })
            }
          >
            {element.options?.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );

    case "card":
      return (
        <div
          style={{
            ...styles,
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "10px" }}>
            {element.content}
          </h3>
          <p style={{ color: "#666", fontSize: "14px", margin: 0 }}>
            {element.description}
          </p>
        </div>
      );

    case "header":
      return (
        <header
          style={{
            ...styles,
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          <h2>{element.content}</h2>
        </header>
      );
    case "footer":
      return (
        <footer
          style={{
            ...styles,
            display: "flex",
            justifyContent: "center",
            padding: "10px",
            alignItems: "center",
          }}
        >
          <small>{element.content}</small>
        </footer>
      );
    case "title":
      return <h1 style={{ margin: 0, ...styles }}>{element.content}</h1>;
    case "button":
      return (
        <button className="preview-btn" style={styles}>
          {element.content}
        </button>
      );

    case "input-number":
      return (
        <input
          type="number"
          value={element.content}
          style={{ ...interactionStyle, padding: "5px" }}
          onChange={(e) =>
            updateElement(element.id, { content: e.target.value })
          }
        />
      );
    case "input-email": {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValidEmail = emailRegex.test(element.content);
      const hasError = element.content && !isValidEmail;

      return (
        <div
          style={{
            position: "relative",
            display: "inline-block",
            minWidth: "250px",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "16px",
              color: "#666",
              pointerEvents: "none",
            }}
          >
            📧
          </span>
          <input
            type="email"
            value={element.content}
            placeholder="exemple@email.com"
            required
            style={{
              ...interactionStyle,
              padding: "10px 12px 10px 40px",
              width: "100%",
              border: `2px solid ${hasError ? "#f44336" : "#e0e0e0"}`,
              borderRadius: "8px",
              fontSize: "14px",
              fontFamily: styles.fontFamily,
              transition: "border-color 0.2s",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              if (!hasError) {
                e.target.style.borderColor = "#4CAF50";
              }
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (value && !emailRegex.test(value)) {
                setEmailError(
                  "Veuillez entrer une adresse email valide avec @"
                );
                e.target.style.borderColor = "#f44336";
              } else {
                setEmailError("");
                e.target.style.borderColor = "#e0e0e0";
              }
            }}
            onChange={(e) => {
              const value = e.target.value;
              updateElement(element.id, { content: value });
              if (value && !emailRegex.test(value)) {
                setEmailError(
                  "Veuillez entrer une adresse email valide avec @"
                );
              } else {
                setEmailError("");
              }
            }}
          />
          {hasError && (
            <div
              style={{
                color: "#f44336",
                fontSize: "12px",
                marginTop: "4px",
                paddingLeft: "4px",
              }}
            >
              {emailError || "Veuillez entrer une adresse email valide avec @"}
            </div>
          )}
        </div>
      );
    }
    case "calendar":
      return (
        <input
          type="date"
          value={element.content}
          style={{ ...interactionStyle, padding: "5px" }}
          onChange={(e) =>
            updateElement(element.id, { content: e.target.value })
          }
        />
      );

    default:
      return (
        <p className="preview-text" style={styles}>
          {element.content}
        </p>
      );
  }
};
