const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:8080/api/jefferson";

/* --- обычные, короткие ответы 1 --- */
export const jeffersonEncrypt  = (m, k = "") => call("encrypt",  { message: m, key: k });
export const jeffersonDecrypt  = (m, k = "") => call("decrypt",  { message: m, key: k });

/* --- «подробные» ответы с дисками --- */
export const jeffersonEncryptVerbose = (m, k = "") =>
  callRaw("encrypt/verbose", { message: m, key: k });
export const jeffersonDecryptVerbose = (m, k = "") =>
  callRaw("decrypt/verbose", { message: m, key: k });

/* ---------- helpers ---------- */
async function call(endpoint, body) {
  const res = await callRaw(endpoint, body);  // JeffersonResponse -> {result}
  // На бэке бывают и {cipher}, и {result}. Возьмём то, что есть.
  return res.result ?? res.cipher;
}
async function callRaw(endpoint, body) {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Server ${res.status}: ${await res.text()}`);
  return res.json();              // вернёт либо {cipher:"…"}, либо VerboseResponse
}
