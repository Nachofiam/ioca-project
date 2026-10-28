import React, { useState } from "react";

// Correo que recibe las consultas
export const CONTACT_EMAIL = "info@ioca.com.ar";

// TODO: conectar el envío real cuando la web pase a DreamHost (script PHP o servicio de formularios).
// Mientras tanto falla a propósito, para que nadie crea que su mensaje fue enviado.
async function sendContact() {
  throw new Error("Envío de formulario todavía no configurado");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactForm({ floor, mode, mobile, whatsappUrl }) {
  const [values, setValues] = useState({ nombre: "", correo: "", mensaje: "" });
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const errors = {
    nombre: !values.nombre.trim() && "Ingresá tu nombre",
    correo: !EMAIL_RE.test(values.correo.trim()) && "Ingresá un correo válido",
    mensaje: !values.mensaje.trim() && "Escribí tu mensaje",
  };
  const valid = !errors.nombre && !errors.correo && !errors.mensaje;

  const set = field => e => { setValues(v => ({ ...v, [field]: e.target.value })); if (status === "error") setStatus("idle"); };

  const onSubmit = async e => {
    e.preventDefault();
    setTouched(true);
    if (!valid || status === "sending") return;
    setStatus("sending");
    try {
      await sendContact(values);
      setStatus("sent");
      setValues({ nombre: "", correo: "", mensaje: "" });
      setTouched(false);
    } catch {
      setStatus("error");
    }
  };

  const light = mode === "light";
  const mono = "'Courier New', monospace";
  const labelStyle = { fontFamily: mono, fontSize: "10px", letterSpacing: "0.18em", color: floor.accent, textTransform: "uppercase", marginBottom: "6px", display: "block" };
  const inputStyle = hasError => ({
    width: "100%", boxSizing: "border-box",
    background: light ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)",
    border: `1px solid ${hasError ? "#e07a7a" : floor.accent + "44"}`,
    color: floor.text, fontFamily: "Georgia, serif", fontSize: "15px",
    padding: "10px 12px", outline: "none", borderRadius: 0, transition: "border-color 0.2s",
    userSelect: "text",
  });
  const errorStyle = { fontFamily: mono, fontSize: "10px", color: "#e07a7a", marginTop: "4px", letterSpacing: "0.04em" };
  const focus = e => { e.target.style.borderColor = floor.accent; };
  const blur = hasError => e => { e.target.style.borderColor = hasError ? "#e07a7a" : floor.accent + "44"; };

  if (status === "sent") {
    return (
      <div style={{ border: `1px solid ${floor.accent}55`, padding: "20px", marginBottom: "2rem", color: floor.text }}>
        <div style={labelStyle}>Mensaje enviado</div>
        <p style={{ margin: "0 0 12px", opacity: 0.8, lineHeight: 1.6 }}>Gracias por escribirnos. Te respondemos a la brevedad.</p>
        <button type="button" onClick={() => setStatus("idle")} style={{ background: "transparent", border: "none", color: floor.accent, fontFamily: mono, fontSize: "11px", letterSpacing: "0.12em", cursor: "pointer", padding: 0, textTransform: "uppercase" }}>Enviar otro</button>
      </div>
    );
  }

  const field = (name, label, input) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <label htmlFor={`contacto-${name}`} style={labelStyle}>{label}</label>
      {input}
      {touched && errors[name] && <div style={errorStyle}>{errors[name]}</div>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "2rem", maxWidth: "460px" }}>
      <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", gap: "14px" }}>
        {field("nombre", "Nombre",
          <input id="contacto-nombre" type="text" autoComplete="name" value={values.nombre} onChange={set("nombre")}
            onFocus={focus} onBlur={blur(touched && errors.nombre)} style={inputStyle(touched && errors.nombre)} />)}
        {field("correo", "Correo",
          <input id="contacto-correo" type="email" autoComplete="email" inputMode="email" value={values.correo} onChange={set("correo")}
            onFocus={focus} onBlur={blur(touched && errors.correo)} style={inputStyle(touched && errors.correo)} />)}
      </div>
      {field("mensaje", "Mensaje",
        <textarea id="contacto-mensaje" rows={mobile ? 5 : 4} value={values.mensaje} onChange={set("mensaje")}
          onFocus={focus} onBlur={blur(touched && errors.mensaje)}
          style={{ ...inputStyle(touched && errors.mensaje), resize: "vertical", minHeight: "96px", lineHeight: 1.5 }} />)}

      {status === "error" && (
        <div style={{ ...errorStyle, fontSize: "11px", lineHeight: 1.6 }}>
          No pudimos enviar el mensaje. Escribinos a <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: floor.accent }}>{CONTACT_EMAIL}</a>
          {whatsappUrl && <> o por <a href={whatsappUrl} target="_blank" rel="noreferrer" style={{ color: floor.accent }}>WhatsApp</a></>}.
        </div>
      )}

      <button type="submit" disabled={status === "sending"} style={{
        alignSelf: mobile ? "stretch" : "flex-start",
        background: `${floor.accent}22`, border: `1px solid ${floor.accent}`, color: floor.accent,
        padding: "12px 28px", fontFamily: mono, fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
        cursor: status === "sending" ? "default" : "pointer", opacity: status === "sending" ? 0.6 : 1, transition: "all 0.2s",
      }}>{status === "sending" ? "Enviando…" : "Enviar"}</button>
    </form>
  );
}
