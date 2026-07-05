import { CheckCircle2 } from "lucide-react";

export function ConnectedApps() {
  const apps = [
    { name: "Slack", status: "Connected", desc: "Ingesting #general and #engineering channels", icon: "💬" },
    { name: "Gmail", status: "Connected", desc: "Syncing founder@glink.com emails", icon: "📧" },
    { name: "Microsoft Teams", status: "Connected", desc: "Enterprise tenant synced", icon: "🤝" },
    { name: "iOS App", status: "Connected", desc: "Mobile telemetry & user interactions", icon: "📱" },
    { name: "Notion", status: "Connected", desc: "Wiki & Strategy docs", icon: "📝" },
    { name: "GitHub", status: "Connected", desc: "Commit history & PRs", icon: "🐙" },
  ];

  return (
    <div className="w-full h-full bg-[#fafafa] flex flex-col p-8 font-sans overflow-auto">
      <div className="max-w-4xl w-full">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Connected Apps & Data Sources</h2>
        <p className="text-sm text-slate-500 mt-1 mb-8">Manage the external tools feeding data into G-Brain for enrichment.</p>

        <div className="grid grid-cols-2 gap-6">
          {apps.map(app => (
            <div key={app.name} className="bg-white border border-slate-200 rounded-xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-lg border">{app.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800">{app.name}</h3>
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200">
                    <CheckCircle2 className="w-3 h-3" /> {app.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{app.desc}</p>
                <div className="mt-4 flex gap-2">
                  <button className="text-[10px] uppercase tracking-wider font-semibold text-slate-600 hover:text-slate-900 border px-3 py-1.5 rounded-md bg-slate-50 shadow-sm transition-colors hover:bg-slate-100">Configure</button>
                  <button className="text-[10px] uppercase tracking-wider font-semibold text-red-600 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-md bg-red-50 shadow-sm transition-colors hover:bg-red-100">Disconnect</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
