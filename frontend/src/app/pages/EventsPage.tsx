import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageShell, LoadingState, EmptyState, StatusBanner, EventFormModal, RelationshipFormModal } from '../components';
import api from '../../api';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRelModal, setShowRelModal] = useState(false);
  const [relParentId, setRelParentId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/event');
      setEvents(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setShowCreateModal(true);
  };

  const handleEditEvent = (event: any) => {
    // TODO: Implement edit event functionality
    console.log('Edit event:', event);
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta decisão?')) {
      return;
    }

    try {
      await api.delete(`/event/${eventId}`);
      fetchEvents();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const openRelationshipModal = (parentId: number) => {
    setRelParentId(parentId);
    setShowRelModal(true);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <PageShell title="Minhas Decisões" subtitle="Visualize e gerencie suas decisões">
        <LoadingState label="Carregando decisões..." />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Minhas Decisões" subtitle="Visualize e gerencie suas decisões">
        <StatusBanner type="error" onClose={() => setError(null)}>
          {error}
          <button onClick={() => { setError(null); fetchEvents(); }} className="btn btn--link ms-2">
            Tentar novamente
          </button>
        </StatusBanner>
        {events.length > 0 ? (
          <EventsList events={events} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />
        ) : (
          <EmptyState
            illustration="/illustrations/empty-events.svg"
            title="Você ainda não tem decisões"
            description="Crie sua primeira decisão para começar a construir sua árvore de escolhas."
            action={<button onClick={handleCreateEvent} className="btn btn--primary">Criar primeira decisão</button>}
          />
        )}

      </PageShell>
    );
  }

  if (events.length === 0) {
    return (
      <PageShell title="Minhas Decisões" subtitle="Visualize e gerencie suas decisões">
        <EmptyState
          illustration="/illustrations/empty-events.svg"
          title="Você ainda não tem decisões"
          description="Crie sua primeira decisão para começar a construir sua árvore de escolhas."
          action={<button onClick={handleCreateEvent} className="btn btn--primary">
            Criar primeira decisão
          </button>}
          />

      </PageShell>
    );
  }

  return (
    <PageShell title="Minhas Decisões" subtitle="Visualize e gerencie suas decisões">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Minhas Decisões</h2>
        <div className="d-flex gap-2">
          <button onClick={handleCreateEvent} className="btn btn--primary">
          + Nova Decisão
          </button>
          <button onClick={() => setShowRelModal(true)} className="btn btn--secondary">
            Nova Relação
          </button>
        </div>
      </div>

      <EventsList events={events} onEdit={handleEditEvent} onDelete={handleDeleteEvent} onOpenRelationship={openRelationshipModal} />

      {/* Create/Edit Event Modal */}
      {showCreateModal && (
        <EventFormModal
          onClose={() => setShowCreateModal(false)}
          onSave={fetchEvents}
        />
      )}

      {showRelModal && (
        <RelationshipFormModal
          onClose={() => { setShowRelModal(false); setRelParentId(null); }}
          onSave={() => { setShowRelModal(false); setRelParentId(null); fetchEvents(); }}
          defaultParentId={relParentId ?? undefined}
        />
      )}
    </PageShell>
  );
};

// Helper component for rendering events list
const EventsList: React.FC<{
  events: any[];
  onEdit: (event: any) => void;
  onDelete: (eventId: number) => void;
  onOpenRelationship?: (parentId: number) => void;
}> = ({ events, onEdit, onDelete }) => {
  return (
    <div className="events-list">
      {events.map((event) => (
        <EventCard key={event.id} event={event} onEdit={onEdit} onDelete={onDelete} onOpenRelationship={onOpenRelationship} />
      ))}
    </div>
  );
};

// Event card component
const EventCard: React.FC<{
  event: any;
  onEdit: (event: any) => void;
  onDelete: (eventId: number) => void;
  onOpenRelationship?: (parentId: number) => void;
}> = ({ event, onEdit, onDelete }) => {
  const statusColors: Record<string, string> = {
    Pendente: '#fff3cd',
    Concluída: '#d4edda',
    Cancelada: '#f8d7da'
  };

  const statusTextColors: Record<string, string> = {
    Pendente: '#664d03',
    Concluída: '#0f5132',
    Cancelada: '#842029'
  };

  const statusBgColor = statusColors[event.status] || '#fff3cd';
  const statusTextColor = statusTextColors[event.status] || '#664d03';

  const date = event.when ? new Date(event.when) : new Date();
  const formattedDate = date.toLocaleDateString('pt-BR');

  return (
    <div className="event-card">
      <div className="event-card-content">
        <div className="event-card-header">
          <h3 className="event-title">{event.name}</h3>
          <div className="event-meta">
            <span className="event-date">{formattedDate}</span>
            <span className="event-type-badge">
              {event.event_type?.name || 'Tipo não especificado'}
            </span>
          </div>
        </div>
        <p className="event-reason">
          {event.why?.length > 50 ? event.why.substring(0, 50) + '...' : event.why}
        </p>
        <div className="event-footer">
          <span
            className="event-status-badge"
            style={{
              backgroundColor: statusBgColor,
              color: statusTextColor
            }}
          >
            {event.status}
          </span>
            <div className="event-actions">
            <button
              onClick={() => onEdit(event)}
              className="btn btn--link btn--sm"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="btn btn--link btn--sm text-danger"
            >
              Excluir
            </button>
            <button
              onClick={() => onOpenRelationship && onOpenRelationship(event.id)}
              className="btn btn--link btn--sm"
            >
              Relacionar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;