export const CONTACT_MODAL_EVENT = 'open-contact-modal'

export const openContactModal = () =>
  window.dispatchEvent(new CustomEvent(CONTACT_MODAL_EVENT))
