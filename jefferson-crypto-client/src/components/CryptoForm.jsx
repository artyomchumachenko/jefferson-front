import { useState } from "react";
import {
  jeffersonEncrypt,
  jeffersonDecrypt,
  jeffersonEncryptVerbose,
  jeffersonDecryptVerbose,
} from "../api";

export default function CryptoForm({ onLogs }) {
  const [mode, setMode] = useState("encrypt");
  const [message, setMessage] = useState("");
  const [key, setKey] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verbose, setVerbose] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult("");
    onLogs(null);

    try {
      if (verbose) {
        const fn = mode === "encrypt" ? jeffersonEncryptVerbose : jeffersonDecryptVerbose;
        const verboseRes = await fn(message, key);
        setResult(verboseRes.result ?? verboseRes.cipher);
        onLogs(verboseRes.disks);
      } else {
        const fn = mode === "encrypt" ? jeffersonEncrypt : jeffersonDecrypt;
        const res = await fn(message, key);
        setResult(res);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white shadow-xl rounded-2xl p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Jefferson Disk Cipher</h1>

      {/* Mode switch */}
      <div className="flex justify-center gap-8">
        {[
          { v: "encrypt", label: "Шифровать" },
          { v: "decrypt", label: "Дешифровать" },
        ].map((opt) => (
          <label key={opt.v} className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value={opt.v}
              checked={mode === opt.v}
              onChange={() => setMode(opt.v)}
              className="form-radio text-indigo-600"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>

      {/* Message */}
      <div>
        <label className="font-medium mb-1 block">
          {mode === "encrypt" ? "Открытый текст" : "Шифр-текст"}
        </label>
        <textarea
          required
          className="w-full h-32 p-2 border rounded-lg resize-y"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {/* Key */}
      <div>
        <label className="font-medium mb-1 block">
          Порядок дисков / ключ (необязательно)
        </label>
        <input
          className="w-full p-2 border rounded-lg"
          placeholder="например 3-1-5-2-4"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
      </div>

      {/* Verbose toggle */}
      <div className="flex items-center gap-2 mb-4">
        <input
          id="verbose"
          type="checkbox"
          checked={verbose}
          onChange={(e) => setVerbose(e.target.checked)}
          className="form-checkbox text-indigo-600"
        />
        <label htmlFor="verbose" className="select-none">
          Включить логирование
        </label>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition disabled:opacity-50"
      >
        {loading ? "Обработка…" : mode === "encrypt" ? "Шифровать" : "Дешифровать"}
      </button>

      {/* Result */}
      {result && (
        <div>
          <label className="font-medium mb-1 block">Результат</label>
          <textarea
            readOnly
            className="w-full h-32 p-2 border rounded-lg bg-slate-50 resize-y"
            value={result}
          />
        </div>
      )}

      {/* Error */}
      {error && <p className="text-red-600 font-semibold">{error}</p>}
    </form>
  )
}