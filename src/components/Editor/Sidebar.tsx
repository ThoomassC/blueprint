import { SidebarItem } from "./SidebarItem";

export const Sidebar = () => {
  return (
    <div className="sidebar ps-toolbar">
      <div className="ps-header">OUTILS</div>

      <div className="ps-grid">
        <SidebarItem type="header" label="🔝" title="En-tête" />
        <SidebarItem type="footer" label="⬇️" title="Pied de page" />

        <SidebarItem type="image" label="🖼️" title="Image" />
        <SidebarItem type="video" label="🎥" title="Vidéo" />
        <SidebarItem type="card" label="🃏" title="Carte" />

        <SidebarItem type="title" label="H1" title="Titre" />
        <SidebarItem type="text" label="¶" title="Texte" />
        <SidebarItem type="button" label="🆗" title="Bouton" />

        <SidebarItem type="select" label="▼" title="Menu" />
        <SidebarItem type="input-number" label="123" title="Nombre" />
        <SidebarItem type="input-email" label="📧" title="Email" />
        <SidebarItem type="calendar" label="📅" title="Date" />
      </div>
    </div>
  );
};
