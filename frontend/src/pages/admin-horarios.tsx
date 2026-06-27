import { useEffect, useState } from "react";
import api from "../services/api";

interface BusinessHour {
  id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  break_start_time?: string;
  break_end_time?: string;
  is_open: boolean;
}

interface Appointment {
  id: string;
  client_id?: string;
  client_name?: string;
  user_name?: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  total_price?: number;
  cancellation_reason?: string;
  services?: Array<{ id: string; name: string; price: number }>;
}

const dayNames = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

export default function AdminHorarios() {
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  
  const [tempData, setTempData] = useState<Partial<BusinessHour>>({
    is_open: false,
    open_time: "",
    close_time: "",
    break_start_time: "",
    break_end_time: "",
    day_of_week: 0,
  });

  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  async function fetchBusinessHours() {
    try {
      setLoading(true);
      const res = await api.get("/api/dashboard/business-hours");
      setBusinessHours(res.data.business_hours || []);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar horários");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAppointmentsForDay(date: string) {
    try {
      const res = await api.get(`/api/appointments?date=${date}`);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error(err);
      setAppointments([]);
    }
  }

  async function updateAppointmentStatus(appointmentId: string, newStatus: string) {
    try {
      setUpdatingAppointmentId(appointmentId);
      await api.put(`/api/appointments/${appointmentId}`, { status: newStatus });
      alert("Agendamento atualizado!");
      fetchAppointmentsForDay(selectedDate);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao atualizar agendamento");
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  async function cancelAppointment() {
    if (!appointmentToCancel) return;
    if (!cancelReason.trim()) {
      alert("Informe o motivo do cancelamento.");
      return;
    }

    try {
      setUpdatingAppointmentId(appointmentToCancel.id);
      await api.patch(`/api/appointments/${appointmentToCancel.id}/cancel`, {
        cancellation_reason: cancelReason,
      });
      alert("Agendamento cancelado!");
      setShowCancelModal(false);
      setAppointmentToCancel(null);
      setCancelReason("");
      fetchAppointmentsForDay(selectedDate);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao cancelar agendamento");
    } finally {
      setUpdatingAppointmentId(null);
    }
  }

  const handleEdit = (day: BusinessHour) => {
    setEditingDay(day.day_of_week);
    setTempData({ ...day });
  };

  const handleCancel = () => {
    setEditingDay(null);
    setTempData({});
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.patch("/api/dashboard/business-hours", {
        day_of_week: tempData.day_of_week,
        open_time: tempData.open_time,
        close_time: tempData.close_time,
        break_start_time: tempData.break_start_time && tempData.break_start_time !== "00:00:00" ? tempData.break_start_time : null,
        break_end_time: tempData.break_end_time && tempData.break_end_time !== "00:00:00" ? tempData.break_end_time : null,
        is_open: !!tempData.is_open,
      });
      alert("Horários atualizados com sucesso!");
      setEditingDay(null);
      fetchBusinessHours();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Erro ao atualizar horários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessHours();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAppointmentsForDay(selectedDate);
    }
  }, [selectedDate]);

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto", marginBottom: 40 }}>
      <h1>⏰ Administração — Horários & Agenda</h1>

      {/* BLOCO 1: AGENDA DO DIA */}
      <div style={{ marginBottom: 40, padding: 20, backgroundColor: "#e3f2fd", borderRadius: 8, border: "1px solid #2196f3" }}>
        <h2 style={{ margin: "0 0 15px 0" }}>📅 Agendamentos do Dia</h2>
        
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", marginBottom: 10, fontWeight: "bold" }}>Selecione a data:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: "8px 12px", border: "1px solid #2196f3", borderRadius: 4, fontSize: 16 }}
          />
        </div>

        {appointments.length === 0 ? (
          <p style={{ color: "#666" }}>Nenhum agendamento para este dia.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
            <thead>
              <tr style={{ backgroundColor: "#1976d2", color: "white" }}>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>Cliente</th>
                <th style={{ padding: 12, textAlign: "left", borderBottom: "2px solid #ddd" }}>Serviços</th>
                <th style={{ padding: 12, textAlign: "center", borderBottom: "2px solid #ddd" }}>Horário</th>
                <th style={{ padding: 12, textAlign: "center", borderBottom: "2px solid #ddd" }}>Valor</th>
                <th style={{ padding: 12, textAlign: "center", borderBottom: "2px solid #ddd" }}>Status</th>
                <th style={{ padding: 12, textAlign: "center", borderBottom: "2px solid #ddd" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt.id} style={{ borderBottom: "1px solid #ddd", backgroundColor: "#fafafa" }}>
                  <td style={{ padding: 12, textAlign: "left" }}>
                    <strong>{appt.user_name ?? appt.client_name ?? appt.client_id}</strong>
                  </td>
                  <td style={{ padding: 12, textAlign: "left", fontSize: 12 }}>
                    {appt.services?.map((s) => s.name).join(", ") || "—"}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>{appt.start_time}</td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    {appt.total_price ? `R$ ${appt.total_price.toFixed(2)}` : "—"}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    <span style={{
                      display: "inline-block", padding: "4px 8px", borderRadius: 4, fontSize: 11, fontWeight: "bold",
                      backgroundColor: appt.status === "scheduled" ? "#c8e6c9" : appt.status === "completed" ? "#bbdefb" : appt.status === "cancelled" ? "#ffcdd2" : "#e0e0e0",
                      color: appt.status === "scheduled" ? "#2e7d32" : appt.status === "completed" ? "#1565c0" : appt.status === "cancelled" ? "#c62828" : "#424242"
                    }}>
                      {appt.status === "scheduled" && "Agendado"}
                      {appt.status === "completed" && "Concluído"}
                      {appt.status === "cancelled" && "Cancelado"}
                      {appt.status === "blocked" && "Bloqueado"}
                    </span>
                    {appt.status === "cancelled" && appt.cancellation_reason && (
                      <div style={{ marginTop: 8, padding: 8, background: "#fff3cd", border: "1px solid #ffeeba", borderRadius: 4, fontSize: 11, textAlign: "left" }}>
                        <strong>Motivo:</strong><br />{appt.cancellation_reason}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: 12, textAlign: "center" }}>
                    {appt.status === "scheduled" && (
                      <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                        <button onClick={() => updateAppointmentStatus(appt.id, "completed")} disabled={updatingAppointmentId === appt.id} style={{ padding: "4px 10px", fontSize: 11, backgroundColor: "#4caf50", color: "white", border: "none", borderRadius: 3, cursor: "pointer" }}>✓ Concluir</button>
                        <button onClick={() => { setAppointmentToCancel(appt); setCancelReason(""); setShowCancelModal(true); }} disabled={updatingAppointmentId === appt.id} style={{ padding: "4px 10px", fontSize: 11, backgroundColor: "#f44336", color: "white", border: "none", borderRadius: 3, cursor: "pointer" }}>✕ Cancelar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCancelModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Cancelar agendamento</h3>
            <p>Informe o motivo do cancelamento:</p>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={4} style={{ width: "100%", marginBottom: "1rem" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn" onClick={cancelAppointment}>Confirmar cancelamento</button>
              <button className="btn secondary" onClick={() => { setShowCancelModal(false); setAppointmentToCancel(null); setCancelReason(""); }}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {businessHours.length === 0 ? (
        <p>Carregando horários...</p>
      ) : (
        <>
          <h3 style={{ marginTop: 20, marginBottom: 15 }}>Horários por Dia da Semana</h3>
          
          {/* AJUSTE NO GRID: grid-rows assegura o esticamento perfeito */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gridAutoRows: "1fr", 
            gap: 15 
          }}>
            {businessHours.map((day) => (
              <div key={day.day_of_week} style={{
                padding: 20, 
                borderRadius: 8, 
                transition: "all 0.3s",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundColor: editingDay === day.day_of_week ? "#fff3cd" : "#f5f5f5",
                border: editingDay === day.day_of_week ? "2px solid #ffc107" : "1px solid #ddd",
              }}>
                <div>
                  <h3 style={{ margin: "0 0 15px 0" }}>{dayNames[day.day_of_week]}</h3>

                  {editingDay === day.day_of_week ? (
                    /* ==========================================
                       A: MODO EDIÇÃO
                       ========================================== */
                    <div>
                      <div style={{ marginBottom: 15 }}>
                        <label style={{ display: "block", marginBottom: 5 }}>
                          <input type="checkbox" checked={!!tempData.is_open} onChange={(e) => setTempData({ ...tempData, is_open: e.target.checked })} /> Aberto
                        </label>
                      </div>

                      {tempData.is_open && (
                        <>
                          <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", marginBottom: 5, fontSize: 12 }}><strong>Abre às:</strong></label>
                              <input type="time" value={tempData.open_time && tempData.open_time !== "00:00:00" ? tempData.open_time.slice(0, 5) : ""} onChange={(e) => setTempData({ ...tempData, open_time: e.target.value })} style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4, width: "100%" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", marginBottom: 5, fontSize: 12 }}><strong>Fecha às:</strong></label>
                              <input type="time" value={tempData.close_time && tempData.close_time !== "00:00:00" ? tempData.close_time.slice(0, 5) : ""} onChange={(e) => setTempData({ ...tempData, close_time: e.target.value })} style={{ padding: "8px", border: "1px solid #ccc", borderRadius: 4, width: "100%" }} />
                            </div>
                          </div>

                          <div style={{ marginBottom: 15, padding: "10px", backgroundColor: "#fff", borderRadius: 4, border: "1px dashed #ccc" }}>
                            <span style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: "bold", color: "#555" }}>🥪 Intervalo</span>
                            <div style={{ display: "flex", gap: 10 }}>
                              <div style={{ flex: 1 }}>
                                <label style={{ display: "block", marginBottom: 3, fontSize: 11, color: "#666" }}>Início:</label>
                                <input 
                                  type="time" 
                                  value={tempData.break_start_time && tempData.break_start_time !== "00:00:00" ? tempData.break_start_time.slice(0, 5) : ""} 
                                  onChange={(e) => setTempData({ ...tempData, break_start_time: e.target.value })} 
                                  style={{ padding: "6px", border: "1px solid #ccc", borderRadius: 4, width: "100%", fontSize: 13 }} 
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <label style={{ display: "block", marginBottom: 3, fontSize: 11, color: "#666" }}>Fim:</label>
                                <input 
                                  type="time" 
                                  value={tempData.break_end_time && tempData.break_end_time !== "00:00:00" ? tempData.break_end_time.slice(0, 5) : ""} 
                                  onChange={(e) => setTempData({ ...tempData, break_end_time: e.target.value })} 
                                  style={{ padding: "6px", border: "1px solid #ccc", borderRadius: 4, width: "100%", fontSize: 13 }} 
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* ==========================================
                       B: MODO VISUALIZAÇÃO
                       ========================================== */
                    <div>
                      <p style={{ margin: "0 0 10px 0" }}>
                        <strong>Status:</strong>{" "}
                        <span style={{ display: "inline-block", padding: "4px 8px", borderRadius: 4, backgroundColor: day.is_open ? "#d4edda" : "#f8d7da", color: day.is_open ? "#155724" : "#721c24", fontSize: 12 }}>
                          {day.is_open ? "ABERTO" : "FECHADO"}
                        </span>
                      </p>

                      {day.is_open ? (
                        <>
                          <p style={{ margin: "10px 0 5px 0", fontSize: 14 }}>
                            <strong>Horário:</strong> {day.open_time && day.open_time !== "00:00:00" ? day.open_time.slice(0, 5) : "—"} - {day.close_time && day.close_time !== "00:00:00" ? day.close_time.slice(0, 5) : "—"}
                          </p>
                          
                          {day.break_start_time && day.break_end_time && day.break_start_time !== "00:00:00" && day.break_end_time !== "00:00:00" ? (
                            <p style={{ margin: "5px 0 10px 0", fontSize: 13, color: "#666" }}>
                              <strong>Almoço:</strong> {day.break_start_time.slice(0, 5)} às {day.break_end_time.slice(0, 5)}
                            </p>
                          ) : (
                            <p style={{ margin: "5px 0 10px 0", fontSize: 13, color: "#999", fontStyle: "italic" }}>
                              Sem intervalo
                            </p>
                          )}
                        </>
                      ) : (
                        <p style={{ margin: "15px 0 15px 0", fontSize: 14, color: "#721c24", fontWeight: "500", fontStyle: "italic" }}>
                          🚫 Sem expediente hoje
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* BOTÕES ALINHADOS ABAIXO: O margin-top auto joga as ações para o rodapé do card */}
                <div style={{ marginTop: "auto", pt: 10 }}>
                  {editingDay === day.day_of_week ? (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={handleSave} disabled={loading} style={{ flex: 1, padding: "10px", backgroundColor: "#4caf50", color: "white", border: "none", borderRadius: 4, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
                        {loading ? "Salvando..." : "Salvar"}
                      </button>
                      <button onClick={handleCancel} disabled={loading} style={{ flex: 1, padding: "10px", backgroundColor: "#9e9e9e", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>Cancelar</button>
                    </div>
                  ) : (
                    <button onClick={() => handleEdit(day)} style={{ width: "100%", padding: "8px", backgroundColor: "#2196f3", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}>
                      ✏️ Editar
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}