import { useState, useEffect } from "react";
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
  FileSpreadsheet,
  Pencil,
  X
} from "lucide-react";
import "./Admin.css";

const API_BASE = "https://schooltrack.seminario1.eleueleo.com/api";

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("resumen");
  const [rutas, setRutas] = useState([]);

  // ── Estudiantes state ──
  const [estudiantes, setEstudiantes] = useState([]);
  const [acudientes, setAcudientes] = useState([]);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false);
  const [estudianteEditando, setEstudianteEditando] = useState(null); // null = modo crear, obj = modo editar

  // Variables para agregar ruta
  const [nuevaRutaNombre, setNuevaRutaNombre] = useState("");
  const [nuevaRutaConductor, setNuevaRutaConductor] = useState("");
  const [nuevaRutaPlaca, setNuevaRutaPlaca] = useState("");

  // Variables para agregar/editar estudiante
  const [nuevoEstudianteNombre, setNuevoEstudianteNombre] = useState("");
  const [nuevoEstudianteApellido, setNuevoEstudianteApellido] = useState("");
  const [nuevoEstudianteAcudiente, setNuevoEstudianteAcudiente] = useState("");
  const [nuevoEstudianteColegio, setNuevoEstudianteColegio] = useState("");
  const [nuevoEstudianteCurso, setNuevoEstudianteCurso] = useState("");
  const [nuevoEstudianteRuta, setNuevoEstudianteRuta] = useState("");
  const [mostrarModalEstudiante, setMostrarModalEstudiante] = useState(false);

  // Modales y Edición
  const [mostrarModalConfirmar, setMostrarModalConfirmar] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null);

  const [mostrarModalEditRuta, setMostrarModalEditRuta] = useState(false);
  const [selectedRuta, setSelectedRuta] = useState(null);
  const [editRutaNombre, setEditRutaNombre] = useState("");
  const [editRutaConductor, setEditRutaConductor] = useState("");
  const [editRutaPlaca, setEditRutaPlaca] = useState("");

  const [mostrarModalEditEstudiante, setMostrarModalEditEstudiante] = useState(false);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [editEstudianteNombre, setEditEstudianteNombre] = useState("");
  const [editEstudianteApellido, setEditEstudianteApellido] = useState("");
  const [editEstudianteAcudiente, setEditEstudianteAcudiente] = useState("");
  const [editEstudianteColegio, setEditEstudianteColegio] = useState("");
  const [editEstudianteCurso, setEditEstudianteCurso] = useState("");
  const [editEstudianteRuta, setEditEstudianteRuta] = useState("");

  useEffect(() => {
    cargarRutas();
    cargarEstudiantes();
    cargarAcudientes();
  }, []);

  // ════════════════════════════════════════
  //  RUTAS — funciones existentes sin cambios
  // ════════════════════════════════════════

  const cargarRutas = async () => {
    try {
      const response = await fetch(`${API_BASE}/Ruta`);
      if (response.ok) {
        const data = await response.json();
        const mappedRutas = data.map(r => {
          let conductor = "No asignado";
          let vehiculo = "Sin placa";
          if (r.descripcion && r.descripcion.includes("Conductor:") && r.descripcion.includes("Vehículo:")) {
            const parts = r.descripcion.split(" | ");
            conductor = parts[0].replace("Conductor: ", "");
            vehiculo = parts[1].replace("Vehículo: ", "");
          } else {
            conductor = r.descripcion || "No asignado";
          }
          return {
            id: r.idRuta,
            nombre: r.nombreRuta,
            conductor: conductor,
            vehiculo: vehiculo,
            paradas: Math.floor(Math.random() * 5) + 3,
            estado: r.estado ? "En servicio" : "Mantenimiento"
          };
        });
        setRutas(mappedRutas);
      }
    } catch (err) {
      console.error("Error al cargar rutas de la API:", err);
    }
  };

  const agregarRuta = async (e) => {
    e.preventDefault();
    if (!nuevaRutaNombre || !nuevaRutaConductor) return;

    const descripcion = `Conductor: ${nuevaRutaConductor} | Vehículo: ${nuevaRutaPlaca || "SIN PLACA"}`;

    try {
      const response = await fetch(`${API_BASE}/Ruta`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombreRuta: nuevaRutaNombre,
          descripcion: descripcion
        })
      });

      if (response.ok) {
        await cargarRutas();
        setNuevaRutaNombre("");
        setNuevaRutaConductor("");
        setNuevaRutaPlaca("");
      } else {
        alert("Error al guardar la ruta en el servidor.");
      }
    } catch (err) {
      console.error("Error al guardar ruta:", err);
      alert("No se pudo conectar con el servidor para guardar la ruta.");
    }
  };

  const eliminarRuta = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/Ruta/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setRutas(rutas.filter(r => r.id !== id));
      } else {
        alert("Error al eliminar la ruta del servidor.");
      }
    } catch (err) {
      console.error("Error al eliminar ruta:", err);
      alert("No se pudo conectar con el servidor para eliminar la ruta.");
    }
  };

  // ════════════════════════════════════════
  //  ACUDIENTES — cargar para el dropdown
  // ════════════════════════════════════════

  const cargarAcudientes = async () => {
    try {
      const response = await fetch(`${API_BASE}/Acudiente`);
      if (response.ok) {
        const data = await response.json();
        setAcudientes(data);
      }
    } catch (err) {
      console.error("Error al cargar acudientes:", err);
    }
  };

  // ════════════════════════════════════════
  //  ESTUDIANTES — CRUD conectado a la API
  // ════════════════════════════════════════

  const cargarEstudiantes = async () => {
    setCargandoEstudiantes(true);
    try {
      const response = await fetch(`${API_BASE}/Estudiante`);
      if (response.ok) {
        const data = await response.json();
        setEstudiantes(data);
      }
    } catch (err) {
      console.error("Error al cargar estudiantes:", err);
    } finally {
      setCargandoEstudiantes(false);
    }
  };

  const agregarEstudiante = async (e) => {
    e.preventDefault();
    if (!nuevoEstudianteNombre || !nuevoEstudianteApellido) return;

    const body = {
      idAcudiente: nuevoEstudianteAcudiente ? parseInt(nuevoEstudianteAcudiente) : 0,
      nombre: nuevoEstudianteNombre,
      apellido: nuevoEstudianteApellido,
      colegio: nuevoEstudianteColegio || null,
      cursoGrado: nuevoEstudianteCurso || null,
      idRuta: nuevoEstudianteRuta ? parseInt(nuevoEstudianteRuta) : null,
      idParada: null
    };

    try {
      const response = await fetch(`${API_BASE}/Estudiante`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await cargarEstudiantes();
        limpiarFormularioEstudiante();
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.mensaje || "Error al guardar el estudiante en el servidor.");
      }
    } catch (err) {
      console.error("Error al guardar estudiante:", err);
      alert("No se pudo conectar con el servidor para guardar el estudiante.");
    }
  };

  const actualizarEstudiante = async (e) => {
    e.preventDefault();
    if (!estudianteEditando || !nuevoEstudianteNombre || !nuevoEstudianteApellido) return;

    const body = {
      idAcudiente: nuevoEstudianteAcudiente ? parseInt(nuevoEstudianteAcudiente) : 0,
      nombre: nuevoEstudianteNombre,
      apellido: nuevoEstudianteApellido,
      colegio: nuevoEstudianteColegio || null,
      cursoGrado: nuevoEstudianteCurso || null,
      estado: true,
      idRuta: nuevoEstudianteRuta ? parseInt(nuevoEstudianteRuta) : null,
      idParada: null
    };

    try {
      const response = await fetch(`${API_BASE}/Estudiante/${estudianteEditando.idEstudiante}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        await cargarEstudiantes();
        limpiarFormularioEstudiante();
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.mensaje || "Error al actualizar el estudiante.");
      }
    } catch (err) {
      console.error("Error al actualizar estudiante:", err);
      alert("No se pudo conectar con el servidor para actualizar el estudiante.");
    }
  };

  const eliminarEstudiante = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este estudiante?")) return;

    try {
      const response = await fetch(`${API_BASE}/Estudiante/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        await cargarEstudiantes();
        // Si estábamos editando el que se eliminó, limpiar formulario
        if (estudianteEditando && estudianteEditando.idEstudiante === id) {
          limpiarFormularioEstudiante();
        }
      } else {
        alert("Error al eliminar el estudiante del servidor.");
      }
    } catch (err) {
      console.error("Error al eliminar estudiante:", err);
      alert("No se pudo conectar con el servidor para eliminar el estudiante.");
    }
  };

  const iniciarEdicionEstudiante = (est) => {
    setEstudianteEditando(est);
    setNuevoEstudianteNombre(est.nombre);
    setNuevoEstudianteApellido(est.apellido);
    setNuevoEstudianteAcudiente(est.idAcudiente ? String(est.idAcudiente) : "");
    setNuevoEstudianteColegio(est.colegio || "");
    setNuevoEstudianteCurso(est.cursoGrado || "");
    setNuevoEstudianteRuta(est.idRuta ? String(est.idRuta) : "");
  };

  const limpiarFormularioEstudiante = () => {
    setEstudianteEditando(null);
    setNuevoEstudianteNombre("");
    setNuevoEstudianteApellido("");
    setNuevoEstudianteAcudiente("");
    setNuevoEstudianteColegio("");
    setNuevoEstudianteCurso("");
    setNuevoEstudianteRuta("");
    setMostrarModalEstudiante(false);
  };

  // Confirmación de eliminación genérica
  const abrirConfirmarEliminar = (type, id) => {
    setItemAEliminar({ type, id });
    setMostrarModalConfirmar(true);
  };

  const ejecutarEliminacion = async () => {
    if (!itemAEliminar) return;
    if (itemAEliminar.type === "ruta") {
      await eliminarRuta(itemAEliminar.id);
    } else if (itemAEliminar.type === "estudiante") {
      setEstudiantes(estudiantes.filter(e => e.id !== itemAEliminar.id));
    }
    setMostrarModalConfirmar(false);
    setItemAEliminar(null);
  };

  // Edición de rutas
  const abrirEditarRuta = (ruta) => {
    setSelectedRuta(ruta);
    setEditRutaNombre(ruta.nombre);
    setEditRutaConductor(ruta.conductor);
    setEditRutaPlaca(ruta.vehiculo);
    setMostrarModalEditRuta(true);
  };

  const guardarEdicionRuta = async (e) => {
    e.preventDefault();
    if (!editRutaNombre || !editRutaConductor) return;

    const descripcion = `Conductor: ${editRutaConductor} | Vehículo: ${editRutaPlaca || "SIN PLACA"}`;

    try {
      const response = await fetch(`https://schooltrack.seminario1.eleueleo.com/api/Ruta/${selectedRuta.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idRuta: selectedRuta.id,
          nombreRuta: editRutaNombre,
          descripcion: descripcion,
          estado: selectedRuta.estado === "En servicio"
        })
      });

      if (response.ok) {
        await cargarRutas();
        setMostrarModalEditRuta(false);
        setSelectedRuta(null);
      } else {
        alert("Error al guardar los cambios de la ruta en el servidor.");
      }
    } catch (err) {
      console.error("Error al editar ruta:", err);
      alert("No se pudo conectar con el servidor para guardar los cambios.");
    }
  };

  // Edición de estudiantes
  const abrirEditarEstudiante = (est) => {
    setSelectedEstudiante(est);
    setEditEstudianteNombre(est.nombre);
    setEditEstudianteApellido(est.apellido);
    setEditEstudianteAcudiente(est.acudiente);
    setEditEstudianteColegio(est.colegio);
    setEditEstudianteCurso(est.curso);
    setEditEstudianteRuta(est.ruta);
    setMostrarModalEditEstudiante(true);
  };

  const guardarEdicionEstudiante = (e) => {
    e.preventDefault();
    if (!editEstudianteNombre || !editEstudianteApellido) return;

    setEstudiantes(estudiantes.map(est => {
      if (est.id === selectedEstudiante.id) {
        return {
          ...est,
          nombre: editEstudianteNombre,
          apellido: editEstudianteApellido,
          acudiente: editEstudianteAcudiente || "Sin asignar",
          colegio: editEstudianteColegio || "Sin asignar",
          curso: editEstudianteCurso || "Sin asignar",
          ruta: editEstudianteRuta || "Sin asignar"
        };
      }
      return est;
    }));

    setMostrarModalEditEstudiante(false);
    setSelectedEstudiante(null);
  };

  // Helper: obtener nombre de ruta por id
  const obtenerNombreRuta = (idRuta) => {
    const ruta = rutas.find(r => r.id === idRuta);
    return ruta ? ruta.nombre : "Sin asignar";
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
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
                          <th>Acciones</th>
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
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button className="edit-row-btn" onClick={() => abrirEditarRuta(r)} title="Editar Ruta">
                                  <Pencil size={16} />
                                </button>
                                <button className="delete-row-btn" onClick={() => abrirConfirmarEliminar("ruta", r.id)} title="Eliminar Ruta">
                                  <Trash2 size={16} />
                                </button>
                              </div>
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
              <div className="section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Base de Alumnos Registrados</h3>
                <button className="add-btn" style={{ width: "auto", marginTop: 0 }} onClick={() => setMostrarModalEstudiante(true)}>
                  <Plus size={16} />
                  <span>Nuevo Estudiante</span>
                </button>
              </div>

              <div className="crud-container">
                {/* Formulario Estudiante */}
                <form 
                  className={`crud-form card-form ${estudianteEditando ? "edit-mode" : ""}`} 
                  onSubmit={estudianteEditando ? actualizarEstudiante : agregarEstudiante}
                >
                  <h4>{estudianteEditando ? "Editar Estudiante" : "Crear Nuevo Estudiante"}</h4>
                  <div className="form-group">
                    <label>Nombre</label>
                    <input
                      type="text"
                      placeholder="Ej. Carlos"
                      value={editEstudianteNombre}
                      onChange={(e) => setEditEstudianteNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Apellido</label>
                    <input
                      type="text"
                      placeholder="Ej. Gómez"
                      value={editEstudianteApellido}
                      onChange={(e) => setEditEstudianteApellido(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Acudiente</label>
                    <select
                      value={nuevoEstudianteAcudiente}
                      onChange={(e) => setNuevoEstudianteAcudiente(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar acudiente...</option>
                      {acudientes.map(a => (
                        <option key={a.idAcudiente} value={a.idAcudiente}>
                          Acudiente #{a.idAcudiente} — {a.direccionResidencia || "Sin dirección"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Colegio</label>
                    <input
                      type="text"
                      placeholder="Ej. Colegio Central"
                      value={editEstudianteColegio}
                      onChange={(e) => setEditEstudianteColegio(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Grado</label>
                    <input
                      type="text"
                      placeholder="Ej. 5° Primaria"
                      value={editEstudianteCurso}
                      onChange={(e) => setEditEstudianteCurso(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Ruta Asignada</label>
                    <select
                      value={nuevoEstudianteRuta}
                      onChange={(e) => setNuevoEstudianteRuta(e.target.value)}
                    >
                      <option value="">Sin ruta asignada</option>
                      {rutas.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="add-btn">
                    <Plus size={16} />
                    <span>{estudianteEditando ? "Actualizar Estudiante" : "Guardar Estudiante"}</span>
                  </button>
                  {estudianteEditando && (
                    <button type="button" className="cancel-btn" onClick={limpiarFormularioEstudiante}>
                      <X size={16} />
                      <span>Cancelar Edición</span>
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}

                {/* Listado Estudiantes */}
                <div className="crud-list flex-grow">
                  {cargandoEstudiantes ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>Cargando estudiantes...</p>
                    </div>
                  ) : estudiantes.length === 0 ? (
                    <div className="empty-state">
                      <Users size={40} />
                      <p>No hay estudiantes registrados aún</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Estudiante</th>
                            <th>Acudiente</th>
                            <th>Colegio</th>
                            <th>Grado</th>
                            <th>Ruta Asignada</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {estudiantes.map(est => (
                            <tr key={est.idEstudiante}>
                              <td><strong>{est.nombre} {est.apellido}</strong></td>
                              <td>Acudiente #{est.idAcudiente}</td>
                              <td>{est.colegio || "Sin asignar"}</td>
                              <td>{est.cursoGrado || "Sin asignar"}</td>
                              <td>
                                <span className="route-tag">
                                  {est.idRuta ? obtenerNombreRuta(est.idRuta) : "Sin asignar"}
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button 
                                    className="edit-row-btn" 
                                    onClick={() => iniciarEdicionEstudiante(est)}
                                    title="Editar estudiante"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                  <button 
                                    className="delete-row-btn" 
                                    onClick={() => eliminarEstudiante(est.idEstudiante)}
                                    title="Eliminar estudiante"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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