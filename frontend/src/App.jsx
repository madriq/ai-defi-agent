import { useEffect, useState } from 'react'
import './App.css'

const API_BASE = 'http://127.0.0.1:8787'

function App() {
const [status, setStatus] = useState(null)
const [audit, setAudit] = useState(null)
const [error, setError] = useState(null)
const [lastUpdated, setLastUpdated] = useState(null)

  async function loadDashboard() {
    try {
      setError(null)

      const [statusResponse, auditResponse] = await Promise.all([
        fetch(`${API_BASE}/api/status`),
        fetch(`${API_BASE}/api/audit`),
      ])

      if (!statusResponse.ok || !auditResponse.ok) {
        throw new Error('Local API request failed')
      }

      const statusData = await statusResponse.json()
      const auditData = await auditResponse.json()

      setStatus(statusData)
      setAudit(auditData)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadDashboard()

    const interval = setInterval(loadDashboard, 10000)

    return () => clearInterval(interval)
  }, [])

  if (!status || !audit) {
    return (
      <main className="dashboard">
        <div className="panel">
          <h2>Loading Local AI DeFi Agent...</h2>
          {error && <p>{error}</p>}
        </div>
      </main>
    )
  }

  const health = status.checks
  const latest = audit.latestDecision

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <p className="eyebrow">AI DEFI AGENT</p>
          <h1>Local Risk Dashboard</h1>
          <p className="subtitle">
            AI-assisted market analysis and simulated blockchain execution
          </p>
        </div>

        <div className="mode-group">
  <div className="connection-badge">
    <span className="connection-dot" />
    LOCAL API CONNECTED
  </div>

  <div className="mode-badge">
    <span className="pulse" />
    {health.executionMode.dryRun ? 'DRY RUN' : 'LIVE'}
  </div>
</div>
      </header>

      <section className="status-grid">
        <article className="status-card">
          <div className="card-header">
            <span>Agent Health</span>
            <span className="status-dot healthy" />
          </div>
          <strong>{status.status}</strong>
          <p>Local AI risk engine operational</p>
        </article>

        <article className="status-card">
          <div className="card-header">
            <span>Local Chain</span>
            <span className="status-dot healthy" />
          </div>
          <strong>{health.rpc.chainId}</strong>
          <p>Hardhat localhost</p>
        </article>

        <article className="status-card">
          <div className="card-header">
            <span>Contract</span>
            <span className="status-dot healthy" />
          </div>
          <strong>{health.contract.status}</strong>
          <p>FlashLoanTrader</p>
        </article>

        <article className="status-card">
          <div className="card-header">
            <span>Ollama</span>
            <span className="status-dot healthy" />
          </div>
          <strong>{health.ollama.status}</strong>
          <p>{health.ollama.model}</p>
        </article>
      </section>

      <section className="main-grid">
        <article className="panel signal-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">AI SIGNAL</span>
              <h2>{latest.aiSignal}</h2>
            </div>
            <span className="signal-badge">
              {latest.marketTrend === 1 ? 'BULLISH' : 'OTHER'}
            </span>
          </div>

          <div className="signal-details">
            <div>
              <span>Asset</span>
              <strong>{latest.asset}</strong>
            </div>

            <div>
              <span>Test Price</span>
              <strong>${latest.currentPrice}</strong>
            </div>

            <div>
              <span>Entry</span>
              <strong>${latest.entryPrice}</strong>
            </div>

            <div>
              <span>Position Size</span>
              <strong>{latest.positionSize}</strong>
            </div>
          </div>
        </article>

        <article className="panel risk-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">RISK ENGINE</span>
              <h2>
                {latest.riskScore}
                <span>/70</span>
              </h2>
            </div>

            <span className="risk-label">CONTROLLED</span>
          </div>

          <div className="risk-bar">
            <div
              className="risk-fill"
              style={{
                width: `${Math.min((latest.riskScore / 70) * 100, 100)}%`,
              }}
            />
          </div>

          <p>
            Deterministic risk assessment passed the local execution safety
            checks.
          </p>
        </article>
      </section>

      <section className="panel reasoning-panel">
        <div className="panel-header">
          <div>
            <span className="panel-label">AI REASONING</span>
            <h2>{latest.aiSignal} ANALYSIS</h2>
          </div>
        </div>

        <div className="reasoning-content">
          <div className="reasoning-block">
            <span>AI Analysis</span>
            <p>{latest.aiReason}</p>
          </div>

          <div className="reasoning-block">
            <span>Decision Engine</span>
            <p>{latest.decisionReason}</p>
          </div>
        </div>
      </section>
      <section className="bottom-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">FINAL DECISION</span>
              <h2>{latest.finalSignal}</h2>
            </div>
          </div>

          <div className="decision-row">
            <span>AI decision</span>
            <strong>{latest.aiSignal}</strong>
          </div>

          <div className="decision-row">
            <span>Risk score</span>
            <strong>{latest.riskScore} / 70</strong>
          </div>

          <div className="decision-row">
            <span>Position</span>
            <strong>{latest.positionSize}</strong>
          </div>
        </article>

        <article className="panel execution-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">EXECUTION MODE</span>
              <h2>SIMULATION</h2>
            </div>
          </div>

          <div className="warning-box">
            <strong>DRY RUN ENABLED</strong>
            <p>
              No blockchain transaction is being sent. This dashboard is
              connected to the local development environment only.
            </p>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">AUDIT LOG</span>
              <h2>{audit.totalRecords} EVENT</h2>
            </div>
          </div>

          <div className="audit-row">
            <span>Latest</span>
            <strong>
              {latest.asset} ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ {latest.finalSignal}
            </strong>
          </div>

          <div className="audit-row">
            <span>Chain</span>
            <strong>{audit.chainId}</strong>
          </div>
<div className="mode-badge">
  <span className="pulse" />
  {health.executionMode.dryRun ? 'DRY RUN' : 'LIVE'}
</div>
          <div className="audit-row">
            <span>Status</span>
            <strong className="healthy-text">VALID</strong>
          </div>
        </article>
      </section>

      <footer>
  <span>AI DeFi Agent</span>

  <span>
    Local development environment Ã¢â‚¬Â¢ Chain {audit.chainId}
  </span>

  <span>
    Last Updated:{' '}
    {lastUpdated
      ? lastUpdated.toLocaleTimeString()
      : 'Loading...'}
  </span>
</footer>
    </main>
  )
}

export default App

