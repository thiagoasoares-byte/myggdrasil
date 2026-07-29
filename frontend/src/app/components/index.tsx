import React from 'react'

export const PageShell: React.FC<{ title?: string; subtitle?: string; children?: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="page-shell">
    {title && <h1>{title}</h1>}
    {subtitle && <p className="subtitle">{subtitle}</p>}
    <div>{children}</div>
  </div>
)

export const LoadingState: React.FC<{ label?: string }> = ({ label }) => (
  <div className="loading-state">{label || 'Carregando...'}</div>
)

export const EmptyState: React.FC<{ illustration?: string; title?: string; description?: string; action?: React.ReactNode }> = ({ illustration, title, description, action }) => (
  <div className="empty-state">
    {illustration && <img src={illustration} alt="empty" style={{ maxWidth: '320px' }} />}
    <h3>{title}</h3>
    <p>{description}</p>
    {action}
  </div>
)

export const StatusBanner: React.FC<{ type?: 'error' | 'info' | 'success'; onClose?: () => void; children?: React.ReactNode }> = ({ type='info', onClose, children }) => (
  <div className={`status-banner status-${type}`}>
    <div>{children}</div>
    {onClose && <button onClick={onClose} className="btn-link">✕</button>}
  </div>
)

// Simple modal forms as placeholders — real forms exist elsewhere but these keep the import working
export const EventFormModal: React.FC<{ onClose: () => void; onSave?: () => void }> = ({ onClose, onSave }) => (
  <div className="modal-overlay open">
    <div className="modal">
      <h3>Evento (placeholder)</h3>
      <div style={{display:'flex',gap:8}}>
        <button onClick={() => { onSave && onSave(); onClose(); }} className="btn-primary">Salvar</button>
        <button onClick={onClose} className="btn-ghost">Cancelar</button>
      </div>
    </div>
  </div>
)

export const RelationshipFormModal: React.FC<{ onClose: () => void; onSave?: () => void; defaultParentId?: number }> = ({ onClose, onSave }) => (
  <div className="modal-overlay open">
    <div className="modal">
      <h3>Relacionamento (placeholder)</h3>
      <div style={{display:'flex',gap:8}}>
        <button onClick={() => { onSave && onSave(); onClose(); }} className="btn-primary">Salvar</button>
        <button onClick={onClose} className="btn-ghost">Cancelar</button>
      </div>
    </div>
  </div>
)

export default {
  PageShell,
  LoadingState,
  EmptyState,
  StatusBanner,
  EventFormModal,
  RelationshipFormModal,
}
