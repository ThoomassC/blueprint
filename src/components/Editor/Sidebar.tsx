import { SidebarItem } from "./SidebarItem";
import HeaderIcon from "../../assets/header.svg?react";
import FooterIcon from "../../assets/footer.svg?react";
import ImageIcon from "../../assets/image.svg?react";
import VideoIcon from "../../assets/video.svg?react";
import CardIcon from "../../assets/card.svg?react";
import TitleIcon from "../../assets/titre.svg?react";
import TextAreaIcon from "../../assets/pargraph.svg?react";
import ButtonIcon from "../../assets/bouton.svg?react";
import ListIcon from "../../assets/list.svg?react";
import NumberIcon from "../../assets/number-fied.svg?react";
import MailIcon from "../../assets/mail.svg?react";
import FormIcon from "../../assets/form.svg?react";
import DateIcon from "../../assets/date.svg?react";
import MapIcon from "../../assets/map.svg?react";

export const Sidebar = () => {
  return (
    <div className="sidebar ps-toolbar">
      <div className="ps-header">OUTILS</div>

      <div className="ps-grid">
        <SidebarItem type="header" icon={<HeaderIcon />} title="En-tête" />
        <SidebarItem type="footer" icon={<FooterIcon />} title="Pied de page" />

        <SidebarItem type="image" icon={<ImageIcon />} title="Image" />
        <SidebarItem type="video" icon={<VideoIcon />} title="Vidéo" />
        <SidebarItem type="card" icon={<CardIcon />} title="Carte" />

        <SidebarItem type="title" icon={<TitleIcon />} title="Titre" />
        <SidebarItem type="text" icon={<TextAreaIcon />} title="Texte" />
        <SidebarItem type="button" icon={<ButtonIcon />} title="Bouton" />

        <SidebarItem type="select" icon={<ListIcon />} title="Menu" />
        <SidebarItem type="input-number" icon={<NumberIcon />} title="Nombre" />
        <SidebarItem type="input-email" icon={<MailIcon />} title="Email" />
        <SidebarItem type="input-form" icon={<FormIcon />} title="Formulaire" />
        <SidebarItem type="calendar" icon={<DateIcon />} title="Date" />
        <SidebarItem type="map" icon={<MapIcon />} title="Carte" />
      </div>
    </div>
  );
};
