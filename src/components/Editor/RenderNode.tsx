import type { EditorElement } from "../../types/editor";
import { useEditorStore } from "../../store/useEditorStore";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

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
    const addChildToForm = useEditorStore((state) => state.addChildToForm);
    const removeChildFromForm = useEditorStore(
        (state) => state.removeChildFromForm
    );
    const updateFormChild = useEditorStore((state) => state.updateFormChild);
    const [emailError, setEmailError] = useState<string>("");

    const styles: React.CSSProperties = {
        ...element.style,
        width: element.style?.width || "100%",
        height: element.style?.height || "auto",
        fontFamily: element.style?.fontFamily || "Arial",
        color: element.style?.color || undefined,
        backgroundColor: element.style?.backgroundColor || undefined,
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
                        style={{ ...styles, ...interactionStyle, backgroundColor: element.style?.backgroundColor || "#000" }}
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
                            ...styles,
                            ...interactionStyle,
                            width: "100%",
                            padding: "5px",
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
                    <h3 style={{
                        marginTop: 0,
                        marginBottom: "10px",
                        color: element.style?.color || "#000",
                        fontFamily: element.style?.fontFamily || "Arial"
                    }}>
                        {element.content}
                    </h3>
                    <p style={{
                        color: element.style?.color || "#666",
                        fontSize: "14px",
                        margin: 0,
                        fontFamily: element.style?.fontFamily || "Arial"
                    }}>
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
                    <h2 style={{
                        color: element.style?.color || "#000",
                        fontFamily: element.style?.fontFamily || "Arial"
                    }}>
                        {element.content}
                    </h2>
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
                    <small style={{
                        color: element.style?.color || "#000",
                        fontFamily: element.style?.fontFamily || "Arial"
                    }}>
                        {element.content}
                    </small>
                </footer>
            );

        case "title":
            return <h1 style={{ margin: 0, ...styles }}>{element.content}</h1>;

        case "button":
            return (
                <button className="preview-btn" style={{
                    ...styles,
                    backgroundColor: element.style?.backgroundColor || "#3498db",
                    color: element.style?.color || "#ffffff",
                    fontFamily: element.style?.fontFamily || "Arial",
                }}>
                    {element.content}
                </button>
            );

        case "input-number":
            return (
                <input
                    type="number"
                    value={element.content}
                    style={{
                        ...styles,
                        ...interactionStyle,
                        padding: "5px"
                    }}
                    onChange={(e) =>
                        updateElement(element.id, { content: e.target.value })
                    }
                />
            );

        case "input-text":
            return (
                <input
                    type="text"
                    value={element.content}
                    placeholder={element.description || "Entrez du texte..."}
                    style={{
                        ...interactionStyle,
                        padding: "10px 12px",
                        width: "100%",
                        border: "2px solid #e0e0e0",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontFamily: element.style?.fontFamily || "Arial",
                        color: element.style?.color || "#000",
                        backgroundColor: element.style?.backgroundColor || "#ffffff",
                        outline: "none",
                        boxSizing: "border-box",
                    }}
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
                            fontFamily: element.style?.fontFamily || "Arial",
                            color: element.style?.color || "#000",
                            backgroundColor: element.style?.backgroundColor || "#ffffff",
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
                    style={{
                        ...styles,
                        ...interactionStyle,
                        padding: "5px"
                    }}
                    onChange={(e) =>
                        updateElement(element.id, { content: e.target.value })
                    }
                />
            );

        case "input-form":
            return (
                <form
                    style={{
                        ...styles,
                        border: "2px solid #3498db",
                        borderRadius: "12px",
                        padding: "20px",
                        backgroundColor: element.style?.backgroundColor || "#f8f9fa",
                        minWidth: "300px",
                        maxWidth: "500px",
                    }}
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (isPreviewMode) {
                            alert("Formulaire soumis !");
                        }
                    }}
                >
                    <h3
                        style={{
                            marginTop: 0,
                            marginBottom: "15px",
                            color: element.style?.color || "#2c3e50",
                            fontFamily: element.style?.fontFamily || "Arial",
                        }}
                    >
                        {element.content}
                    </h3>

                    {/* Inputs du formulaire */}
                    {element.children && element.children.length > 0 ? (
                        <div
                            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                        >
                            {element.children.map((child) => (
                                <div key={child.id} style={{ position: "relative" }}>
                                    {!isPreviewMode && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                marginBottom: "4px",
                                            }}
                                        >
                                            <input
                                                type="text"
                                                value={child.description || ""}
                                                placeholder="Label du champ..."
                                                style={{
                                                    flex: 1,
                                                    padding: "4px 8px",
                                                    fontSize: "12px",
                                                    border: "1px solid #ddd",
                                                    borderRadius: "4px",
                                                }}
                                                onChange={(e) =>
                                                    updateFormChild(element.id, child.id, {
                                                        description: e.target.value,
                                                    })
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <button
                                                type="button"
                                                style={{
                                                    padding: "4px 8px",
                                                    fontSize: "18px",
                                                    border: "none",
                                                    background: "#f44336",
                                                    color: "white",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeChildFromForm(element.id, child.id);
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    )}
                                    {child.description && isPreviewMode && (
                                        <label
                                            style={{
                                                display: "block",
                                                fontSize: "13px",
                                                fontWeight: "bold",
                                                marginBottom: "4px",
                                                color: "#555",
                                            }}
                                        >
                                            {child.description}
                                        </label>
                                    )}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        {child.type === "input-text" && (
                                            <input
                                                type="text"
                                                value={child.content}
                                                placeholder={child.description || "Entrez du texte..."}
                                                style={{
                                                    ...interactionStyle,
                                                    padding: "10px 12px",
                                                    width: "100%",
                                                    border: "2px solid #e0e0e0",
                                                    borderRadius: "8px",
                                                    fontSize: "14px",
                                                    fontFamily: element.style?.fontFamily || "Arial",
                                                    outline: "none",
                                                    boxSizing: "border-box",
                                                }}
                                                onChange={(e) =>
                                                    updateFormChild(element.id, child.id, {
                                                        content: e.target.value,
                                                    })
                                                }
                                            />
                                        )}
                                        {child.type === "input-email" && (
                                            <input
                                                type="email"
                                                value={child.content}
                                                placeholder={child.description || "exemple@email.com"}
                                                style={{
                                                    ...interactionStyle,
                                                    padding: "10px 12px",
                                                    width: "100%",
                                                    border: "2px solid #e0e0e0",
                                                    borderRadius: "8px",
                                                    fontSize: "14px",
                                                    fontFamily: element.style?.fontFamily || "Arial",
                                                    outline: "none",
                                                    boxSizing: "border-box",
                                                }}
                                                onChange={(e) =>
                                                    updateFormChild(element.id, child.id, {
                                                        content: e.target.value,
                                                    })
                                                }
                                            />
                                        )}
                                        {child.type === "input-number" && (
                                            <input
                                                type="number"
                                                value={child.content}
                                                placeholder={child.description || "0"}
                                                style={{
                                                    ...interactionStyle,
                                                    padding: "10px 12px",
                                                    width: "100%",
                                                    border: "2px solid #e0e0e0",
                                                    borderRadius: "8px",
                                                    fontSize: "14px",
                                                    fontFamily: element.style?.fontFamily || "Arial",
                                                    outline: "none",
                                                    boxSizing: "border-box",
                                                }}
                                                onChange={(e) =>
                                                    updateFormChild(element.id, child.id, {
                                                        content: e.target.value,
                                                    })
                                                }
                                            />
                                        )}
                                        {child.type === "calendar" && (
                                            <input
                                                type="date"
                                                value={child.content}
                                                style={{
                                                    ...interactionStyle,
                                                    padding: "10px 12px",
                                                    width: "100%",
                                                    border: "2px solid #e0e0e0",
                                                    borderRadius: "8px",
                                                    fontSize: "14px",
                                                    fontFamily: element.style?.fontFamily || "Arial",
                                                    outline: "none",
                                                    boxSizing: "border-box",
                                                }}
                                                onChange={(e) =>
                                                    updateFormChild(element.id, child.id, {
                                                        content: e.target.value,
                                                    })
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: "#666", fontSize: "14px", fontStyle: "italic" }}>
                            Ajoutez des champs ci-dessous
                        </p>
                    )}

                    {/* Boutons d'ajout de champs (en mode édition uniquement) */}
                    {!isPreviewMode && (
                        <div
                            style={{
                                marginTop: "15px",
                                display: "flex",
                                gap: "8px",
                                flexWrap: "wrap",
                            }}
                        >
                            <button
                                type="button"
                                style={{
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    border: "1px solid #3498db",
                                    backgroundColor: "white",
                                    color: "#3498db",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addChildToForm(element.id, {
                                        id: uuidv4(),
                                        type: "input-text",
                                        content: "",
                                        description: "Texte",
                                        x: 0,
                                        y: 0,
                                        style: { fontFamily: "Arial" },
                                        attributes: { htmlId: "", className: "" },
                                    });
                                }}
                            >
                                + Texte
                            </button>
                            <button
                                type="button"
                                style={{
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    border: "1px solid #3498db",
                                    backgroundColor: "white",
                                    color: "#3498db",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addChildToForm(element.id, {
                                        id: uuidv4(),
                                        type: "input-email",
                                        content: "",
                                        description: "Email",
                                        x: 0,
                                        y: 0,
                                        style: { fontFamily: "Arial" },
                                        attributes: { htmlId: "", className: "" },
                                    });
                                }}
                            >
                                + Email
                            </button>
                            <button
                                type="button"
                                style={{
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    border: "1px solid #3498db",
                                    backgroundColor: "white",
                                    color: "#3498db",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addChildToForm(element.id, {
                                        id: uuidv4(),
                                        type: "input-number",
                                        content: "0",
                                        description: "Nombre",
                                        x: 0,
                                        y: 0,
                                        style: { fontFamily: "Arial" },
                                        attributes: { htmlId: "", className: "" },
                                    });
                                }}
                            >
                                + Nombre
                            </button>
                            <button
                                type="button"
                                style={{
                                    padding: "6px 12px",
                                    fontSize: "12px",
                                    border: "1px solid #3498db",
                                    backgroundColor: "white",
                                    color: "#3498db",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    addChildToForm(element.id, {
                                        id: uuidv4(),
                                        type: "calendar",
                                        content: new Date().toISOString().split("T")[0],
                                        description: "Date",
                                        x: 0,
                                        y: 0,
                                        style: { fontFamily: "Arial" },
                                        attributes: { htmlId: "", className: "" },
                                    });
                                }}
                            >
                                + Date
                            </button>
                        </div>
                    )}

                    {/* Bouton Submit */}
                    <button
                        type="submit"
                        style={{
                            ...interactionStyle,
                            marginTop: "15px",
                            padding: "10px 20px",
                            backgroundColor: "#3498db",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            cursor: isPreviewMode ? "pointer" : "default",
                            width: "100%",
                            transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            if (isPreviewMode) {
                                e.currentTarget.style.backgroundColor = "#2980b9";
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#3498db";
                        }}
                    >
                        Envoyer
                    </button>
                </form>
            );

        default:
            return (
                <p className="preview-text" style={styles}>
                    {element.content}
                </p>
            );
    }
};