import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Route as RouteIcon, 
  Users, 
  Bus, 
  ShieldAlert, 
  LogOut, 
  Plus, 
  Trash2, 
  ClipboardList, 
  CheckCircle,
  FileSpreadsheet
} from "lucide-react";
import "./Admin.css";

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("resumen");
  const [rutas, setRutas] = useState([
    { id: 1, nombre: "Ruta 01 - Norte", conductor: "Carlos Gómez", vehiculo: "TOW-345", paradas: 6, estado: "En servicio" },
    { id: 2, nombre: "Ruta 02 - Sur", conductor: "Marta Rodríguez", vehiculo: "XPF-890", paradas: 8, estado: "En servicio" },
    { id: 3, nombre: "Ruta 03 - Centro", conductor: "Julio Martínez", vehiculo: "KLS-231", paradas: 5, estado: "Mantenimiento" }
  ]);

  const [estudiantes, setEstudiantes] = useState([
    { id: 1, nombre: "Sofía", apellido: "García", acudiente: "María García", ruta: "Ruta 01 - Norte", colegio: "Colegio Distrital A", curso: "4° Primaria" },
    { id: 2, nombre: "Juan", apellido: "López", acudiente: "Pedro López", ruta: "Ruta 02 - Sur", colegio: "Colegio Distrital B", curso: "6° Bachillerato" },
    { id: 3, nombre: "Mateo", apellido: "Ríos", acudiente: "Lucía Ríos", ruta: "Ruta 01 - Norte", colegio: "Colegio Distrital A", curso: "1° Primaria" },
    { id: 4, nombre: "Valeria", apellido: "Díaz", acudiente: "Andrés Díaz", ruta: "Ruta 03 - Centro", colegio: "Colegio Mayor", curso: "9° Bachillerato" }
  ]);

  // Variables para agregar ruta simulada
  const [nuevaRutaNombre, setNuevaRutaNombre] = useState("");
  const [nuevaRutaConductor, setNuevaRutaConductor] = useState("");
  const [nuevaRutaPlaca, setNuevaRutaPlaca] = useState("");

  const agregarRuta = (e) => {
    e.preventDefault();
    if (!nuevaRutaNombre || !nuevaRutaConductor) return;
    const nueva = {
      id: rutas.length + 1,
      nombre: nuevaRutaNombre,
      conductor: nuevaRutaConductor,
      vehiculo: nuevaRutaPlaca || "SIN-PLACA",
      paradas: Math.floor(Math.random() * 5) + 3,
      estado: "En servicio"
    };
    setRutas([...rutas, nueva]);
    setNuevaRutaNombre("");
    setNuevaRutaConductor("");
    setNuevaRutaPlaca("");
  };

  const eliminarRuta = (id) => {
    setRutas(rutas.filter(r => r.id !== id));
  };

  const cerrarSesion = () => {
    navigate("/login");
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <Bus size={28} />
          <span>SchoolTrack</span>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <span className="user-name">Administrador</span>
            <span className="user-role">Super Admin</span>
          </div>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={`menu-item ${activeTab === "resumen" ? "active" : ""}`}
            onClick={() => setActiveTab("resumen")}
          >
            <LayoutDashboard size={20} />
            <span>Resumen</span>
          </button>
          <button 
            className={`menu-item ${activeTab === "rutas" ? "active" : ""}`}
            onClick={() => setActiveTab("rutas")}
          >
            <RouteIcon size={20} />
            <span>Gestionar Rutas</span>
          </button>
          <button 
            className={`menu-item ${activeTab === "estudiantes" ? "active" : ""}`}
            onClick={() => setActiveTab("estudiantes")}
          >
            <Users size={20} />
            <span>Estudiantes</span>
          </button>
        </nav>

        <button className="sidebar-logout-btn" onClick={cerrarSesion}>
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main">
        <header className="main-header">
          <h2>Panel Administrativo</h2>
          <div className="header-date">
            <span>Período Académico 2026</span>
          </div>
        </header>

        <div className="content-container">
          {/* TAB 1: RESUMEN */}
          {activeTab === "resumen" && (
            <div className="tab-pane">
              {/* Grid de Métricas */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-icon routes"><RouteIcon size={24} /></div>
                  <div className="metric-data">
                    <span className="metric-value">{rutas.length}</span>
                    <span className="metric-label">Rutas Creadas</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon drivers"><Users size={24} /></div>
                  <div className="metric-data">
                    <span className="metric-value">5</span>
                    <span className="metric-label">Conductores</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon vehicles"><Bus size={24} /></div>
                  <div className="metric-data">
                    <span className="metric-value">4</span>
                    <span className="metric-label">Vehículos</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon students"><ClipboardList size={24} /></div>
                  <div className="metric-data">
                    <span className="metric-value">{estudiantes.length}</span>
                    <span className="metric-label">Alumnos Asignados</span>
                  </div>
                </div>
              </div>

              {/* Sección de Alertas y Rutas activas rápidas */}
              <div className="dashboard-columns">
                <div className="dashboard-section recent-routes">
                  <h3>Estado Reciente de Rutas</h3>
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Ruta</th>
                          <th>Conductor</th>
                          <th>Vehículo</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rutas.map(r => (
                          <tr key={r.id}>
                            <td><strong>{r.nombre}</strong></td>
                            <td>{r.conductor}</td>
                            <td><span className="badge-plate">{r.vehiculo}</span></td>
                            <td>
                              <span className={`status-badge ${r.estado === "En servicio" ? "online" : "offline"}`}>
                                {r.estado}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="dashboard-section notification-center">
                  <h3>Alertas de Seguridad del Sistema</h3>
                  <div className="notification-list">
                    <div className="notification-item warning">
                      <ShieldAlert size={18} />
                      <div className="notification-text">
                        <p><strong>Vencimiento SOAT</strong></p>
                        <span>El vehículo con placa TOW-345 vence SOAT en 12 días.</span>
                      </div>
                    </div>
                    <div className="notification-item success">
                      <CheckCircle size={18} />
                      <div className="notification-text">
                        <p><strong>Mantenimiento Exitoso</strong></p>
                        <span>Vehículo KLS-231 reincorporado al servicio hoy.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GESTIONAR RUTAS */}
          {activeTab === "rutas" && (
            <div className="tab-pane">
              <div className="section-header">
                <h3>Registro de Rutas Escolares</h3>
              </div>

              <div className="crud-container">
                {/* Formulario */}
                <form className="crud-form card-form" onSubmit={agregarRuta}>
                  <h4>Crear Nueva Ruta</h4>
                  <div className="form-group">
                    <label>Nombre de la Ruta</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Ruta 04 - Occidente" 
                      value={nuevaRutaNombre}
                      onChange={(e) => setNuevaRutaNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Conductor Asignado</label>
                    <input 
                      type="text" 
                      placeholder="Nombre del conductor" 
                      value={nuevaRutaConductor}
                      onChange={(e) => setNuevaRutaConductor(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Placa del Vehículo</label>
                    <input 
                      type="text" 
                      placeholder="Ej. ABC-123" 
                      value={nuevaRutaPlaca}
                      onChange={(e) => setNuevaRutaPlaca(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="add-btn">
                    <Plus size={16} />
                    <span>Guardar Ruta</span>
                  </button>
                </form>

                {/* Listado */}
                <div className="crud-list flex-grow">
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Ruta</th>
                          <th>Conductor</th>
                          <th>Vehículo</th>
                          <th>Paradas</th>
                          <th>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rutas.map(r => (
                          <tr key={r.id}>
                            <td><strong>{r.nombre}</strong></td>
                            <td>{r.conductor}</td>
                            <td><span className="badge-plate">{r.vehiculo}</span></td>
                            <td>{r.paradas} paradas</td>
                            <td>
                              <button className="delete-row-btn" onClick={() => eliminarRuta(r.id)}>
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ESTUDIANTES */}
          {activeTab === "estudiantes" && (
            <div className="tab-pane">
              <div className="section-header">
                <h3>Base de Alumnos Registrados</h3>
              </div>

              <div className="crud-list card-table">
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Acudiente</th>
                        <th>Colegio</th>
                        <th>Grado</th>
                        <th>Ruta Asignada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantes.map(e => (
                        <tr key={e.id}>
                          <td><strong>{e.nombre} {e.apellido}</strong></td>
                          <td>{e.acudiente}</td>
                          <td>{e.colegio}</td>
                          <td>{e.curso}</td>
                          <td>
                            <span className="route-tag">{e.ruta}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Admin;