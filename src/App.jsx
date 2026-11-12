
import { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BrainCircuit, BriefcaseBusiness,
  ChartNoAxesCombined, CircleHelp, Plus, RefreshCw, Search, ShieldCheck,
  Sparkles, Trash2, Wallet, X, Eye, LayoutDashboard, Star, TrendingUp,
  ArrowLeftRight, Settings as SettingsIcon, Bell, UserRound, LogOut, ChevronDown
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";
import { initialHoldings, performance } from "./data";

const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);

const marketData = [
  { symbol: "S&P 500", name: "US large-cap index", price: "5,842.47", change: "+0.62%", up: true },
  { symbol: "NASDAQ", name: "Technology index", price: "18,421.09", change: "+0.84%", up: true },
  { symbol: "DOW", name: "Dow Jones Industrial Average", price: "43,275.18", change: "-0.18%", up: false },
  { symbol: "NIFTY 50", name: "Indian equity index", price: "24,350.35", change: "+0.41%", up: true },
  { symbol: "GOLD", name: "Gold (demo quote)", price: "$2,685.20", change: "+0.27%", up: true },
];

const navItems = [
  { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
  { id: "portfolio", label: "My Portfolio", icon: BriefcaseBusiness },
  { id: "watchlist", label: "Watchlist", icon: Star },
  { id: "market", label: "Market Overview", icon: TrendingUp },
  { id: "insights", label: "AI Insights", icon: BrainCircuit },
  { id: "transactions", label: "Transactions", icon: ArrowLeftRight },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

function StatCard({ icon: Icon, label, value, note, positive }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon"><Icon size={18} /></span>
      </div>
      <strong>{value}</strong>
      <small className={positive === undefined ? "muted" : positive ? "positive" : "negative"}>
        {note}
      </small>
    </article>
  );
}

function App() {
  const [holdings, setHoldings] = useState(initialHoldings);
  const [page, setPage] = useState("overview");
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [watchlist, setWatchlist] = useState(["TSLA", "META", "NFLX"]);
  const [watchInput, setWatchInput] = useState("");
  const [form, setForm] = useState({
    symbol: "", name: "", shares: "", price: "", change: "0", sector: "Other",
  });
  const [analysis, setAnalysis] = useState("");
  const [aiSource, setAiSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [settings, setSettings] = useState({
    emailAlerts: true, weeklySummary: true, darkMode: false,
  });

  const totalValue = useMemo(
    () => holdings.reduce((sum, item) => sum + item.shares * item.price, 0),
    [holdings]
  );
  const totalCost = totalValue * 0.91;
  const profit = totalValue - totalCost;
  const dailyChange = holdings.reduce(
    (sum, item) => sum + item.shares * item.price * item.change / 100, 0
  );
  const filtered = holdings.filter((h) =>
    `${h.symbol} ${h.name} ${h.sector}`.toLowerCase().includes(query.toLowerCase())
  );
  const allocation = holdings
    .map((h) => ({ name: h.symbol, value: h.shares * h.price, color: h.color }))
    .filter((x) => x.value > 0);
  const transactions = holdings.map((h, i) => ({
    id: h.id, symbol: h.symbol, action: "BUY", shares: h.shares,
    price: h.price, date: `Nov ${12 - i}, 2026`,
  }));

  function addHolding(e) {
    e.preventDefault();
    const symbol = form.symbol.trim().toUpperCase();
    const shares = Number(form.shares);
    const price = Number(form.price);

    if (!symbol || shares <= 0 || price <= 0) {
      setNotice("Enter a symbol, positive share quantity and price.");
      return;
    }

    setHoldings((prev) => [
      ...prev,
      {
        id: Date.now(),
        symbol,
        name: form.name.trim() || symbol,
        shares,
        price,
        change: Number(form.change) || 0,
        sector: form.sector || "Other",
        color: ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"][prev.length % 5],
      },
    ]);

    setForm({ symbol: "", name: "", shares: "", price: "", change: "0", sector: "Other" });
    setShowAdd(false);
    setNotice("Holding added successfully.");
    setPage("portfolio");
  }

  function removeHolding(id) {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
    setNotice("Holding removed.");
  }

  function addWatch() {
    const symbol = watchInput.trim().toUpperCase();
    if (!symbol) return;

    if (watchlist.includes(symbol)) {
      setNotice(`${symbol} is already in your watchlist.`);
      return;
    }

    setWatchlist((prev) => [...prev, symbol]);
    setWatchInput("");
    setNotice(`${symbol} added to your watchlist.`);
  }

  async function runAnalysis() {
    if (!holdings.length) {
      setNotice("Add a holding before requesting analysis.");
      return;
    }

    setLoading(true);
    setAnalysis("");
    setNotice("");

    try {
      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holdings, totalValue }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Analysis failed.");

      setAnalysis(data.analysis);
      setAiSource(data.source || "AI assistant");
    } catch {
      setAnalysis(
        "Could not connect to the analysis service. Start the backend with `npm run server` and try again."
      );
      setAiSource("Connection help");
    } finally {
      setLoading(false);
    }
  }

  function goTo(id) {
    setPage(id);
    setProfileOpen(false);
    setNotice("");
  }

  const pageTitle = navItems.find((item) => item.id === page)?.label || "Dashboard Overview";

  return (
    <div className={`app-shell ${settings.darkMode ? "dark-mode" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><ChartNoAxesCombined size={21} /></div>
          <span>Invest<span className="brand-accent">IQ</span></span>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-link ${page === id ? "active" : ""}`}
              onClick={() => goTo(id)}
            >
              <Icon size={18} />
              {label}
              {id === "watchlist" && <span className="nav-count">{watchlist.length}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            type="button"
            className="help-box clickable-card"
            onClick={() => setNotice("Welcome to InvestIQ! Use the sidebar to explore your portfolio, watchlist, market demo and settings.")}
          >
            <CircleHelp size={18} />
            <div><b>Need help?</b><small>Explore your portfolio</small></div>
          </button>

          <button
            type="button"
            className="profile clickable-card"
            onClick={() => setProfileOpen((v) => !v)}
          >
            <div className="avatar">M</div>
            <div><b>Maheswari Tunga</b><small>Personal account</small></div>
            <ChevronDown size={15} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="eyebrow">INVESTIQ / {pageTitle.toUpperCase()}</div>
            <h1>{pageTitle}</h1>
          </div>

          <div className="top-actions">
            <span className="sample-pill"><span /> Demo data</span>
            <button
              className="icon-button"
              title="Refresh view"
              onClick={() => setNotice("View refreshed using the current demo data.")}
            >
              <RefreshCw size={17} />
            </button>

            <div className="profile-menu-wrap">
              <button
                type="button"
                className="avatar profile-button"
                title="Account menu"
                onClick={() => setProfileOpen((v) => !v)}
              >
                M
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <div className="dropdown-user">
                    <div className="avatar">M</div>
                    <div><b>Maheswari Tunga</b><small>Add your email</small></div>
                  </div>
                  <button onClick={() => goTo("settings")}><UserRound size={15} /> Profile</button>
                  <button onClick={() => goTo("settings")}><SettingsIcon size={15} /> Account settings</button>
                  <button onClick={() => { goTo("settings"); setNotice("Manage your notification preferences below."); }}>
                    <Bell size={15} /> Notifications
                  </button>
                  <button onClick={() => setNotice("Help: use the sidebar to navigate and the Add holding button to manage your sample portfolio.")}>
                    <CircleHelp size={15} /> Help &amp; support
                  </button>
                  <button onClick={() => { setProfileOpen(false); setNotice("You are using a local demo account. No sign-out is required."); }}>
                    <LogOut size={15} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {notice && (
          <div className="notice" role="status">
            {notice}
            <button onClick={() => setNotice("")}><X size={15} /></button>
          </div>
        )}

        {page === "overview" && (
          <>
            <section className="welcome-row">
              <div>
                <h2>Welcome back, Maheswari!</h2>
                <p>Monitor your holdings, review performance and explore portfolio insights.</p>
              </div>
              <button className="primary-button" onClick={() => setShowAdd(true)}>
                <Plus size={17} /> Add holding
              </button>
            </section>

            <section className="stats-grid">
              <StatCard icon={Wallet} label="Portfolio value" value={money(totalValue)} note="Based on entered sample prices" />
              <StatCard icon={Activity} label="Total return (demo)" value={money(profit)} note="+9.0% illustrative return" positive />
              <StatCard
                icon={dailyChange >= 0 ? ArrowUpRight : ArrowDownRight}
                label="Today's change"
                value={`${dailyChange >= 0 ? "+" : "-"}${money(Math.abs(dailyChange))}`}
                note="Calculated from sample daily changes"
                positive={dailyChange >= 0}
              />
              <StatCard icon={ShieldCheck} label="Number of holdings" value={holdings.length} note="Across your portfolio" />
            </section>

            <section className="content-grid">
              <article className="panel performance-panel">
                <div className="panel-heading">
                  <div><h3>Portfolio performance</h3><p>Illustrative portfolio value over 12 months</p></div>
                  <span className="period-chip">1Y <span>⌄</span></span>
                </div>
                <div className="chart-summary">
                  <strong>{money(totalValue)}</strong>
                  <span className="positive"><ArrowUpRight size={15} /> Sample holdings value</span>
                </div>
                <div className="performance-chart">
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={performance}>
                      <defs>
                        <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9e7ef" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fill="url(#performanceGradient)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="panel allocation-panel">
                <div className="panel-heading">
                  <div><h3>Portfolio allocation</h3><p>Distribution by holding</p></div>
                </div>
                {allocation.length ? (
                  <>
                    <div className="allocation-chart">
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie data={allocation} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={4}>
                            {allocation.map((entry, index) => (
                              <Cell key={entry.name} fill={entry.color || ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"][index % 4]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => money(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="allocation-legend">
                      {allocation.map((item) => (
                        <div key={item.name}>
                          <span><i style={{ background: item.color }} />{item.name}</span>
                          <b>{money(item.value)}</b>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <div className="empty-state">Add holdings to see your allocation.</div>}
              </article>
            </section>

            <HoldingsTable
              holdings={filtered}
              allCount={holdings.length}
              query={query}
              setQuery={setQuery}
              removeHolding={removeHolding}
            />
          </>
        )}

        {page === "portfolio" && (
          <>
            <section className="welcome-row">
              <div><h2>My portfolio</h2><p>Manage your investments and review your holdings.</p></div>
              <button className="primary-button" onClick={() => setShowAdd(true)}><Plus size={17} /> Add holding</button>
            </section>
            <section className="stats-grid">
              <StatCard icon={Wallet} label="Portfolio value" value={money(totalValue)} note="Based on sample prices" />
              <StatCard icon={TrendingUp} label="Estimated return" value={money(profit)} note="Illustrative demo return" positive />
              <StatCard icon={BriefcaseBusiness} label="Total holdings" value={holdings.length} note="Positions in your portfolio" />
            </section>
            <HoldingsTable holdings={filtered} allCount={holdings.length} query={query} setQuery={setQuery} removeHolding={removeHolding} />
          </>
        )}

        {page === "watchlist" && (
          <>
            <section className="welcome-row">
              <div><h2>Your watchlist</h2><p>Keep an eye on stocks you may want to research.</p></div>
            </section>
            <section className="panel page-panel">
              <form className="watch-add" onSubmit={(e) => { e.preventDefault(); addWatch(); }}>
                <input value={watchInput} onChange={(e) => setWatchInput(e.target.value)} placeholder="Enter stock symbol, e.g. AAPL" />
                <button className="primary-button" type="submit"><Plus size={16} /> Add to watchlist</button>
              </form>
              <div className="watch-grid">
                {watchlist.map((symbol) => (
                  <article className="watch-card" key={symbol}>
                    <div className="watch-card-top">
                      <span className="asset-icon">{symbol.slice(0, 1)}</span>
                      <button className="delete-button" title={`Remove ${symbol}`} onClick={() => setWatchlist((prev) => prev.filter((x) => x !== symbol))}><X size={16} /></button>
                    </div>
                    <h3>{symbol}</h3>
                    <p>Saved symbol · Demo watchlist</p>
                    <span className="muted">No live quote connected</span>
                  </article>
                ))}
              </div>
              {watchlist.length === 0 && <div className="empty-state">Your watchlist is empty. Add a stock symbol to get started.</div>}
            </section>
          </>
        )}

        {page === "market" && (
          <>
            <section className="welcome-row">
              <div><h2>Market snapshot</h2><p>Illustrative market indicators for the dashboard interface.</p></div>
              <span className="sample-pill">Sample quotes · Not live</span>
            </section>
            <section className="market-banner">
              <div><span className="market-label">MARKET STATUS</span><h2>Market overview</h2><p>Use this page to explore a sample market-watch layout.</p></div>
              <div className="market-banner-icon"><TrendingUp size={34} /></div>
            </section>
            <section className="panel page-panel">
              <div className="panel-heading"><div><h3>Market indices &amp; assets</h3><p>Example values for UI demonstration only</p></div></div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>INSTRUMENT</th><th>DESCRIPTION</th><th>DEMO VALUE</th><th>CHANGE</th></tr></thead>
                  <tbody>
                    {marketData.map((item) => (
                      <tr key={item.symbol}>
                        <td><b className="market-symbol">{item.symbol}</b></td>
                        <td>{item.name}</td>
                        <td className="value-cell">{item.price}</td>
                        <td><span className={item.up ? "positive" : "negative"}>{item.change}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="chart-footnote">These figures are hard-coded sample values. They should not be used for trading or investment decisions.</p>
            </section>
          </>
        )}

        {page === "insights" && (
          <>
            <section className="welcome-row">
              <div><h2>AI portfolio insights</h2><p>Generate an educational summary of your current holdings.</p></div>
            </section>
            <section className="panel ai-panel">
              <div className="ai-heading">
                <div className="ai-icon"><Sparkles size={21} /></div>
                <div><h3>AI portfolio assistant</h3><p>Review concentration, diversification and portfolio movement.</p></div>
                <span className="ai-tag">AI ASSISTANT</span>
              </div>
              <div className="ai-content">
                <div className="ai-prompt">
                  <b>Analyze your current holdings</b>
                  <p>The assistant uses the holdings entered in this demo. It does not provide personalized financial advice.</p>
                  <button className="primary-button" onClick={runAnalysis} disabled={loading}>
                    {loading ? <><span className="spinner" /> Analyzing...</> : <><Sparkles size={16} /> Analyze my portfolio</>}
                  </button>
                </div>
                <div className="analysis-result">
                  {analysis ? (
                    <>
                      <div className="result-top"><b>Analysis result</b><span>{aiSource}</span></div>
                      <p className="analysis-text">{analysis}</p>
                    </>
                  ) : (
                    <div className="empty-analysis">
                      <BrainCircuit size={28} />
                      <b>Your insights will appear here</b>
                      <span>Run an analysis to get started.</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="disclaimer">Educational demo only. This is not an investment recommendation.</div>
            </section>
          </>
        )}

        {page === "transactions" && (
          <>
            <section className="welcome-row">
              <div><h2>Transaction history</h2><p>Example activity generated from your current holdings.</p></div>
            </section>
            <section className="panel page-panel">
              <div className="panel-heading"><div><h3>Recent transactions</h3><p>Demo entries · Not connected to a brokerage</p></div></div>
              <div className="table-scroll">
                <table>
                  <thead><tr><th>DATE</th><th>TYPE</th><th>ASSET</th><th>SHARES</th><th>PRICE</th><th>STATUS</th></tr></thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id}>
                        <td>{t.date}</td><td><span className="transaction-type">{t.action}</span></td>
                        <td><b>{t.symbol}</b></td><td>{t.shares}</td><td>{money(t.price)}</td>
                        <td><span className="status-complete">Completed (demo)</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {transactions.length === 0 && <div className="empty-state">No transactions to display.</div>}
            </section>
          </>
        )}

        {page === "settings" && (
          <>
            <section className="welcome-row">
              <div><h2>Account settings</h2><p>Manage your profile and dashboard preferences.</p></div>
            </section>
            <section className="settings-grid">
              <article className="panel settings-card">
                <div className="settings-title">
                  <div className="avatar large-avatar">M</div>
                  <div><h3>Maheswari Tunga</h3><p>Personal account · InvestIQ demo</p></div>
                </div>
                <label className="setting-field">Full name<input value="Maheswari Tunga" readOnly /></label>
                <label className="setting-field">Email address<input value="Add your email" readOnly /></label>
                <label className="setting-field">Account type<input value="Personal demo account" readOnly /></label>
              </article>

              <article className="panel settings-card">
                <h3>Preferences</h3>
                <p className="settings-description">Choose how your demo dashboard behaves.</p>
                <SettingToggle label="Email notifications" description="Receive important account alerts (demo setting)." checked={settings.emailAlerts} onChange={(v) => setSettings((s) => ({ ...s, emailAlerts: v }))} />
                <SettingToggle label="Weekly portfolio summary" description="Show a weekly portfolio summary preference." checked={settings.weeklySummary} onChange={(v) => setSettings((s) => ({ ...s, weeklySummary: v }))} />
                <SettingToggle label="Dark appearance" description="Switch the dashboard to a dark color theme." checked={settings.darkMode} onChange={(v) => setSettings((s) => ({ ...s, darkMode: v }))} />
              </article>
            </section>
          </>
        )}

        <footer>InvestIQ <span>•</span> Stock portfolio dashboard demo <span>•</span> Sample data only</footer>
      </main>

      {showAdd && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowAdd(false)}>
          <form className="modal" onSubmit={addHolding}>
            <div className="modal-heading">
              <div><h2>Add a holding</h2><p>Enter a stock position manually.</p></div>
              <button type="button" className="icon-button" onClick={() => setShowAdd(false)}><X size={18} /></button>
            </div>

            <div className="form-grid">
              <label>Stock symbol<input required maxLength="8" placeholder="e.g. TSLA" value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} /></label>
              <label>Company name<input placeholder="e.g. Tesla Inc." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
              <label>Number of shares<input required type="number" min="0.01" step="0.01" placeholder="10" value={form.shares} onChange={(e) => setForm({ ...form, shares: e.target.value })} /></label>
              <label>Price per share ($)<input required type="number" min="0.01" step="0.01" placeholder="150.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
              <label>Daily change (%)<input type="number" step="0.01" placeholder="0.50" value={form.change} onChange={(e) => setForm({ ...form, change: e.target.value })} /></label>
              <label>Sector
                <select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })}>
                  <option>Technology</option><option>Healthcare</option><option>Finance</option>
                  <option>Consumer</option><option>Energy</option><option>Semiconductors</option>
                  <option>Communication</option><option>Other</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="primary-button" type="submit"><Plus size={16} /> Save holding</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function HoldingsTable({ holdings, allCount, query, setQuery, removeHolding }) {
  return (
    <section className="panel holdings-panel">
      <div className="panel-heading holdings-heading">
        <div><h3>Your holdings</h3><p>Review and manage your stock positions</p></div>
        <div className="table-actions">
          <label className="search-box">
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search holdings" />
          </label>
        </div>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr><th>ASSET</th><th>SECTOR</th><th>SHARES</th><th>PRICE</th><th>MARKET VALUE</th><th>DAY CHANGE</th><th></th></tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr key={h.id}>
                <td>
                  <div className="asset-cell">
                    <span className="asset-icon" style={{ background: h.color }}>{h.symbol.slice(0, 1)}</span>
                    <div><b>{h.symbol}</b><small>{h.name}</small></div>
                  </div>
                </td>
                <td><span className="sector-tag">{h.sector}</span></td>
                <td>{h.shares}</td><td>{money(h.price)}</td>
                <td className="value-cell">{money(h.shares * h.price)}</td>
                <td><span className={h.change >= 0 ? "positive" : "negative"}>{h.change >= 0 ? "+" : ""}{h.change.toFixed(2)}%</span></td>
                <td><button className="delete-button" title={`Remove ${h.symbol}`} onClick={() => removeHolding(h.id)}><Trash2 size={15} /></button></td>
              </tr>
            ))}
            {holdings.length === 0 && (
              <tr><td colSpan="7" className="empty-state">No holdings {query ? "match your search" : "yet"}.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-foot">
        <span>Showing {holdings.length} of {allCount} holdings</span>
        <span>Prices are manually entered sample values</span>
      </div>
    </section>
  );
}

function SettingToggle({ label, description, checked, onChange }) {
  return (
    <div className="setting-toggle">
      <div><b>{label}</b><small>{description}</small></div>
      <button
        type="button"
        className={`toggle ${checked ? "on" : ""}`}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

export default App;
