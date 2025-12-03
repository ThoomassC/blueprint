import type { ElementType, EditorElement } from "../types/editor";

class AudioDescriptionService {
  private synth: SpeechSynthesis;
  private enabled: boolean = true;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  private getElementName(type: ElementType): string {
    const names: Record<ElementType, string> = {
      text: "texte",
      button: "bouton",
      image: "image",
      video: "vidéo",
      header: "en-tête",
      footer: "pied de page",
      card: "carte",
      carousel: "carrousel",
      select: "menu déroulant",
      "input-number": "champ numérique",
      "input-email": "champ email",
      "input-text": "champ texte",
      "input-form": "formulaire",
      calendar: "calendrier",
      title: "titre",
      map: "carte",
      textarea: "zone de texte",
      heading: "en-tête",
      input: "champ de saisie",
      logo: "logo",
    };
    return names[type] || type;
  }

  private speak(text: string, priority: "high" | "low" = "low") {
    if (!this.enabled) return;

    // Annuler les annonces précédentes si priorité haute
    if (priority === "high") {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = 1.2;
    utterance.pitch = 1;
    utterance.volume = 1;

    this.synth.speak(utterance);
  }

  enable() {
    this.enabled = true;
    this.speak("Audio description activée", "high");
  }

  disable() {
    this.speak("Audio description désactivée", "high");
    this.enabled = false;
  }

  setEnabled(enabled: boolean) {
    if (enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }

  toggle() {
    if (this.enabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Annonces des actions principales
  announceElementAdded(type: ElementType, x: number, y: number) {
    const name = this.getElementName(type);
    this.speak(
      `${name} ajouté à la position x ${Math.round(x)}, y ${Math.round(y)}`
    );
  }

  announceElementSelected(element: EditorElement | null) {
    if (!element) {
      this.speak("Aucun élément sélectionné");
      return;
    }
    const name = this.getElementName(element.type);
    this.speak(`${name} sélectionné`);
  }

  announceElementRemoved(type: ElementType) {
    const name = this.getElementName(type);
    this.speak(`${name} supprimé`);
  }

  announceElementMoved(type: ElementType, x: number, y: number) {
    const name = this.getElementName(type);
    this.speak(
      `${name} déplacé à la position x ${Math.round(x)}, y ${Math.round(y)}`
    );
  }

  announceContentChanged(type: ElementType, content: string) {
    const name = this.getElementName(type);
    const truncated =
      content.length > 50 ? content.slice(0, 50) + "..." : content;
    this.speak(`Contenu de ${name} modifié : ${truncated}`);
  }

  announceStyleChanged(property: string, value: string) {
    const propertyNames: Record<string, string> = {
      backgroundColor: "couleur de fond",
      color: "couleur du texte",
      fontSize: "taille de police",
      fontFamily: "police de caractères",
      width: "largeur",
      height: "hauteur",
      padding: "espacement interne",
      borderRadius: "arrondi des coins",
    };
    const propertyName = propertyNames[property] || property;
    this.speak(`${propertyName} modifié : ${value}`);
  }

  announceAttributeChanged(attribute: string, value: string) {
    const attributeNames: Record<string, string> = {
      htmlId: "identifiant HTML",
      className: "classes CSS",
    };
    const attributeName = attributeNames[attribute] || attribute;
    this.speak(`${attributeName} modifié : ${value || "vide"}`);
  }

  announceModeChanged(isPreview: boolean) {
    const mode = isPreview ? "aperçu" : "édition";
    this.speak(`Mode ${mode} activé`, "high");
  }

  // Annonces pour les formulaires
  announceFormChildAdded(childType: ElementType) {
    const name = this.getElementName(childType);
    this.speak(`Champ ${name} ajouté au formulaire`);
  }

  announceFormChildRemoved(childType: ElementType) {
    const name = this.getElementName(childType);
    this.speak(`Champ ${name} supprimé du formulaire`);
  }

  announceFormChildUpdated(childType: ElementType, property: string) {
    const name = this.getElementName(childType);
    this.speak(`${property} du champ ${name} modifié`);
  }

  // Annonces pour les options de select
  announceOptionAdded() {
    this.speak("Option ajoutée au menu");
  }

  announceOptionRemoved() {
    this.speak("Option supprimée du menu");
  }

  // Annonces générales
  announceExport() {
    this.speak("Export du projet en JSON", "high");
  }

  announceError(message: string) {
    this.speak(`Erreur : ${message}`, "high");
  }

  announceSuccess(message: string) {
    this.speak(message, "high");
  }
}

export const audioDescription = new AudioDescriptionService();
