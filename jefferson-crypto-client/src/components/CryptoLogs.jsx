export default function CryptoLogs({ disks }) {
  if (!disks) {
    return (
      <div className="grow lg:w-1/2 flex items-center justify-center rounded-2xl
                      bg-white text-slate-400 shadow-xl p-6 italic">
        Лог появится здесь…
      </div>
    );
  }

  return (
    <div className="grow lg:w-1/2 rounded-2xl bg-white shadow-xl p-6 overflow-auto">
      <h2 className="text-2xl font-bold mb-4">Пошаговый лог</h2>

      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-slate-100">
          <tr className="text-left">
            <th className="border p-2">#</th>
            <th className="border p-2">Исходный</th>
            <th className="border p-2">Алф.</th>
            <th className="border p-2">Перестановка диска</th>
            <th className="border p-2">↓ Результат</th>
          </tr>
        </thead>

        <tbody>
          {disks.map((d) => (
            <tr key={d.index} className="odd:bg-slate-50">
              <td className="border p-2 text-center">{d.index + 1}</td>
              <td className="border p-2 font-mono">{d.original}</td>
              <td className="border p-2">{d.lang}</td>
              <td className="border p-2 font-mono whitespace-nowrap">{d.permutation}</td>
              <td className="border p-2 font-mono font-semibold">{d.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
