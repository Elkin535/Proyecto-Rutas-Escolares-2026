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
  Pencil,
  X,
  UserSquare2,
  Contact
} from "lucide-react";
import "./Admin.css";

const API_BASE = "https://schooltrack.seminario1.eleueleo.com/api";

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("resumen");
  const [rutas, setRutas] = useState([]);

  // ── Estados generales ──
  const [usuarios, setUsuarios] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);

  // ── Estudiantes state ──
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false);
  const [estudianteEditando, setEstudianteEditando] = useState(null);

  // ── Acudientes state ──
  const [acudientes, setAcudientes] = useState([]);
  const [cargandoAcudientes, setCargandoAcudientes] = useState(false);
  const [acudienteEditando, setAcudienteEditando] = useState(null);

  // ── Conductores state ──
  const [conductores, setConductores] = useState([]);
  const [cargandoConductores, setCargandoConductores] = useState(false);
  const [conductorEditando, setConductorEditando] = useState(null);

  // Variables para agregar ruta
  const [nuevaRutaNombre, setNuevaRutaNombre] = useState("");
  const [nuevaRutaConductor, setNuevaRutaConductor] = useState("");
  const [nuevaRutaPlaca, setNuevaRutaPlaca] = useState("");

  // Variables para estudiante
  const [nuevoEstudianteNombre, setNuevoEstudianteNombre] = useState("");
  const [nuevoEstudianteApellido, setNuevoEstudianteApellido] = useState("");
  const [nuevoEstudianteAcudiente, setNuevoEstudianteAcudiente] = useState("");
  const [nuevoEstudianteColegio, setNuevoEstudianteColegio] = useState("");
  const [nuevoEstudianteCurso, setNuevoEstudianteCurso] = useState("");
  const [nuevoEstudianteRuta, setNuevoEstudianteRuta] = useState("");

  // Variables para acudiente
  const [nuevoAcudienteNombre, setNuevoAcudienteNombre] = useState("");
  const [nuevoAcudienteApellido, setNuevoAcudienteApellido] = useState("");
  const [nuevoAcudienteCorreo, setNuevoAcudienteCorreo] = useState("");
  const [nuevoAcudienteContrasena, setNuevoAcudienteContrasena] = useState("");
  const [nuevoAcudienteTelefono, setNuevoAcudienteTelefono] = useState("");
  const [nuevoAcudienteDireccion, setNuevoAcudienteDireccion] = useState("");

  // Variables para conductor
  const [nuevoConductorNombre, setNuevoConductorNombre] = useState("");
  const [nuevoConductorApellido, setNuevoConductorApellido] = useState("");
  const [nuevoConductorCorreo, setNuevoConductorCorreo] = useState("");
  const [nuevoConductorContrasena, setNuevoConductorContrasena] = useState("");
  const [nuevoConductorTelefono, setNuevoConductorTelefono] = useState("");
  const [nuevoConductorLicencia, setNuevoConductorLicencia] = useState("");
  const [nuevoConductorCategoria, setNuevoConductorCategoria] = useState("");
  const [nuevoConductorVehiculo, setNuevoConductorVehiculo] = useState("");

  useEffect(() => {
    cargarUsuarios();
    cargarVehiculos();
    cargarRutas();
    cargarEstudiantes();
    cargarAcudientes();
    cargarConductores();
  }, []);

  // ════════════════════════════════════════
  //  CARGAS GENERALES
  // ════════════════════════════════════════
  const cargarUsuarios = async () => {
    try {
      const response = await fetch(`${API_BASE}/Usuario`);
      if (response.ok) setUsuarios(await response.json());
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    }
  };

  const cargarVehiculos = async () => {
    try {
      const response = await fetch(`${API_BASE}/Vehiculo`);
      if (response.ok) setVehiculos(await response.json());
    } catch (err) {
      console.error("Error al cargar vehiculos:", err);
    }
  };

  const obtenerInfoUsuario = (idUsuario) => {
    return usuarios.find(u => u.idUsuario === idUsuario) || {};
  };

  // ════════════════════════════════════════
  //  RUTAS
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
      console.error("Error al cargar rutas:", err);
    }
  };

  const agregarRuta = async (e) => {
    e.preventDefault();
    if (!nuevaRutaNombre || !nuevaRutaConductor) return;
    const descripcion = `Conductor: ${nuevaRutaConductor} | Vehículo: ${nuevaRutaPlaca || "SIN PLACA"}`;
    try {
      const response = await fetch(`${API_BASE}/Ruta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreRuta: nuevaRutaNombre, descripcion: descripcion })
      });
      if (response.ok) {
        await cargarRutas();
        setNuevaRutaNombre(""); setNuevaRutaConductor(""); setNuevaRutaPlaca("");
      } else alert("Error al guardar la ruta en el servidor.");
    } catch (err) {
      alert("No se pudo conectar con el servidor.");
    }
  };

  const eliminarRuta = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/Ruta/${id}`, { method: "DELETE" });
      if (response.ok) setRutas(rutas.filter(r => r.id !== id));
    } catch (err) {
      alert("No se pudo conectar con el servidor para eliminar.");
    }
  };

  // ════════════════════════════════════════
  //  ESTUDIANTES
  // ════════════════════════════════════════
  const cargarEstudiantes = async () => {
    setCargandoEstudiantes(true);
    try {
      const response = await fetch(`${API_BASE}/Estudiante`);
      if (response.ok) setEstudiantes(await response.json());
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
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      });
      if (response.ok) {
        await cargarEstudiantes();
        limpiarFormularioEstudiante();
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.mensaje || "Error al guardar el estudiante.");
      }
    } catch (err) {
      alert("Error de red.");
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
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
      });
      if (response.ok) {
        await cargarEstudiantes();
        limpiarFormularioEstudiante();
      } else alert("Error al actualizar el estudiante.");
    } catch (err) {
      alert("Error de red.");
    }
  };

  const eliminarEstudiante = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este estudiante?")) return;
    try {
      const response = await fetch(`${API_BASE}/Estudiante/${id}`, { method: "DELETE" });
      if (response.ok) {
        await cargarEstudiantes();
        if (estudianteEditando && estudianteEditando.idEstudiante === id) limpiarFormularioEstudiante();
      }
    } catch (err) {
      alert("Error de red.");
    }
  };

  const iniciarEdicionEstudiante = (est) => {
    setEstudianteEditando(est);
    setNuevoEstudianteNombre(est.nombre); setNuevoEstudianteApellido(est.apellido);
    setNuevoEstudianteAcudiente(est.idAcudiente ? String(est.idAcudiente) : "");
    setNuevoEstudianteColegio(est.colegio || ""); setNuevoEstudianteCurso(est.cursoGrado || "");
    setNuevoEstudianteRuta(est.idRuta ? String(est.idRuta) : "");
  };

  const limpiarFormularioEstudiante = () => {
    setEstudianteEditando(null); setNuevoEstudianteNombre(""); setNuevoEstudianteApellido("");
    setNuevoEstudianteAcudiente(""); setNuevoEstudianteColegio(""); setNuevoEstudianteCurso(""); setNuevoEstudianteRuta("");
  };

  // ════════════════════════════════════════
  //  ACUDIENTES
  // ════════════════════════════════════════
  const cargarAcudientes = async () => {
    setCargandoAcudientes(true);
    try {
      const response = await fetch(`${API_BASE}/Acudiente`);
      if (response.ok) setAcudientes(await response.json());
    } catch (err) {
      console.error("Error al cargar acudientes:", err);
    } finally {
      setCargandoAcudientes(false);
    }
  };

  const agregarAcudiente = async (e) => {
    e.preventDefault();
    if (!nuevoAcudienteNombre || !nuevoAcudienteApellido || !nuevoAcudienteCorreo || !nuevoAcudienteContrasena) return;
    try {
      const userRes = await fetch(`${API_BASE}/Usuario`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idRol: 3, nombre: nuevoAcudienteNombre, apellido: nuevoAcudienteApellido,
          correo: nuevoAcudienteCorreo, contrasena: nuevoAcudienteContrasena, telefono: nuevoAcudienteTelefono || null
        })
      });
      if (!userRes.ok) {
         const data = await userRes.json();
         throw new Error(data.mensaje || "Error al crear usuario.");
      }
      const userData = await userRes.json();

      const acudienteRes = await fetch(`${API_BASE}/Acudiente`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario: userData.idUsuario, direccionResidencia: nuevoAcudienteDireccion || null })
      });

      if (acudienteRes.ok) {
        await cargarUsuarios();
        await cargarAcudientes();
        limpiarFormularioAcudiente();
      } else throw new Error("Error al crear acudiente.");
    } catch (err) {
      alert(err.message);
    }
  };

  const actualizarAcudiente = async (e) => {
    e.preventDefault();
    if (!acudienteEditando || !nuevoAcudienteNombre || !nuevoAcudienteApellido || !nuevoAcudienteCorreo) return;
    try {
      const userRes = await fetch(`${API_BASE}/Usuario/${acudienteEditando.idUsuario}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoAcudienteNombre, apellido: nuevoAcudienteApellido,
          correo: nuevoAcudienteCorreo, contrasena: nuevoAcudienteContrasena || null, telefono: nuevoAcudienteTelefono || null
        })
      });
      if (!userRes.ok) throw new Error("Error al actualizar usuario.");

      const acudienteRes = await fetch(`${API_BASE}/Acudiente/${acudienteEditando.idAcudiente}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idUsuario: acudienteEditando.idUsuario, direccionResidencia: nuevoAcudienteDireccion || null })
      });

      if (acudienteRes.ok) {
        await cargarUsuarios();
        await cargarAcudientes();
        limpiarFormularioAcudiente();
      } else throw new Error("Error al actualizar acudiente.");
    } catch (err) {
      alert(err.message);
    }
  };

  const eliminarAcudiente = async (idAcudiente, idUsuario) => {
    if (!window.confirm("¿Estás seguro de eliminar este acudiente? Se eliminará su usuario asociado.")) return;
    try {
      const res = await fetch(`${API_BASE}/Acudiente/${idAcudiente}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar acudiente.");
      await fetch(`${API_BASE}/Usuario/${idUsuario}`, { method: "DELETE" });
      await cargarUsuarios();
      await cargarAcudientes();
      if (acudienteEditando && acudienteEditando.idAcudiente === idAcudiente) limpiarFormularioAcudiente();
    } catch (err) {
      alert(err.message);
    }
  };

  const iniciarEdicionAcudiente = (acu) => {
    setAcudienteEditando(acu);
    const uInfo = obtenerInfoUsuario(acu.idUsuario);
    setNuevoAcudienteNombre(uInfo.nombre || "");
    setNuevoAcudienteApellido(uInfo.apellido || "");
    setNuevoAcudienteCorreo(uInfo.correo || "");
    setNuevoAcudienteContrasena(""); // Opcional en edición
    setNuevoAcudienteTelefono(uInfo.telefono || "");
    setNuevoAcudienteDireccion(acu.direccionResidencia || "");
  };

  const limpiarFormularioAcudiente = () => {
    setAcudienteEditando(null); setNuevoAcudienteNombre(""); setNuevoAcudienteApellido("");
    setNuevoAcudienteCorreo(""); setNuevoAcudienteContrasena(""); setNuevoAcudienteTelefono(""); setNuevoAcudienteDireccion("");
  };

  // ════════════════════════════════════════
  //  CONDUCTORES
  // ════════════════════════════════════════
  const cargarConductores = async () => {
    setCargandoConductores(true);
    try {
      const response = await fetch(`${API_BASE}/Conductor`);
      if (response.ok) setConductores(await response.json());
    } catch (err) {
      console.error("Error al cargar conductores:", err);
    } finally {
      setCargandoConductores(false);
    }
  };

  const agregarConductor = async (e) => {
    e.preventDefault();
    if (!nuevoConductorNombre || !nuevoConductorApellido || !nuevoConductorCorreo || !nuevoConductorContrasena || !nuevoConductorLicencia) return;
    try {
      const userRes = await fetch(`${API_BASE}/Usuario`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idRol: 2, nombre: nuevoConductorNombre, apellido: nuevoConductorApellido,
          correo: nuevoConductorCorreo, contrasena: nuevoConductorContrasena, telefono: nuevoConductorTelefono || null
        })
      });
      if (!userRes.ok) throw new Error("Error al crear usuario.");
      const userData = await userRes.json();

      const conductorRes = await fetch(`${API_BASE}/Conductor`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUsuario: userData.idUsuario, idVehiculo: nuevoConductorVehiculo ? parseInt(nuevoConductorVehiculo) : null,
          numeroLicencia: nuevoConductorLicencia, categoriaLicencia: nuevoConductorCategoria || null
        })
      });

      if (conductorRes.ok) {
        await cargarUsuarios(); await cargarConductores(); limpiarFormularioConductor();
      } else {
         const data = await conductorRes.json();
         throw new Error(data.mensaje || "Error al crear conductor.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const actualizarConductor = async (e) => {
    e.preventDefault();
    if (!conductorEditando || !nuevoConductorNombre || !nuevoConductorApellido || !nuevoConductorCorreo || !nuevoConductorLicencia) return;
    try {
      const userRes = await fetch(`${API_BASE}/Usuario/${conductorEditando.idUsuario}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoConductorNombre, apellido: nuevoConductorApellido,
          correo: nuevoConductorCorreo, contrasena: nuevoConductorContrasena || null, telefono: nuevoConductorTelefono || null
        })
      });
      if (!userRes.ok) throw new Error("Error al actualizar usuario.");

      const conductorRes = await fetch(`${API_BASE}/Conductor/${conductorEditando.idConductor}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idUsuario: conductorEditando.idUsuario, idVehiculo: nuevoConductorVehiculo ? parseInt(nuevoConductorVehiculo) : null,
          numeroLicencia: nuevoConductorLicencia, categoriaLicencia: nuevoConductorCategoria || null
        })
      });

      if (conductorRes.ok) {
        await cargarUsuarios(); await cargarConductores(); limpiarFormularioConductor();
      } else {
         const data = await conductorRes.json();
         throw new Error(data.mensaje || "Error al actualizar conductor.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const eliminarConductor = async (idConductor, idUsuario) => {
    if (!window.confirm("¿Estás seguro de eliminar este conductor? Se eliminará su usuario asociado.")) return;
    try {
      const res = await fetch(`${API_BASE}/Conductor/${idConductor}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar conductor.");
      await fetch(`${API_BASE}/Usuario/${idUsuario}`, { method: "DELETE" });
      await cargarUsuarios(); await cargarConductores();
      if (conductorEditando && conductorEditando.idConductor === idConductor) limpiarFormularioConductor();
    } catch (err) {
      alert(err.message);
    }
  };

  const iniciarEdicionConductor = (cond) => {
    setConductorEditando(cond);
    const uInfo = obtenerInfoUsuario(cond.idUsuario);
    setNuevoConductorNombre(uInfo.nombre || ""); setNuevoConductorApellido(uInfo.apellido || "");
    setNuevoConductorCorreo(uInfo.correo || ""); setNuevoConductorContrasena(""); 
    setNuevoConductorTelefono(uInfo.telefono || ""); setNuevoConductorLicencia(cond.numeroLicencia || "");
    setNuevoConductorCategoria(cond.categoriaLicencia || ""); setNuevoConductorVehiculo(cond.idVehiculo ? String(cond.idVehiculo) : "");
  };

  const limpiarFormularioConductor = () => {
    setConductorEditando(null); setNuevoConductorNombre(""); setNuevoConductorApellido("");
    setNuevoConductorCorreo(""); setNuevoConductorContrasena(""); setNuevoConductorTelefono("");
    setNuevoConductorLicencia(""); setNuevoConductorCategoria(""); setNuevoConductorVehiculo("");
  };

  const obtenerNombreRuta = (idRuta) => {
    const ruta = rutas.find(r => r.id === idRuta);
    return ruta ? ruta.nombre : "Sin asignar";
  };
  
  const obtenerPlacaVehiculo = (idVehiculo) => {
    const veh = vehiculos.find(v => v.idVehiculo === idVehiculo);
    return veh ? veh.placa : "Sin asignar";
  };

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    navigate("/login", { replace: true });
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
          <button className={`menu-item ${activeTab === "resumen" ? "active" : ""}`} onClick={() => setActiveTab("resumen")}>
            <LayoutDashboard size={20} /><span>Resumen</span>
          </button>
          <button className={`menu-item ${activeTab === "rutas" ? "active" : ""}`} onClick={() => setActiveTab("rutas")}>
            <RouteIcon size={20} /><span>Gestionar Rutas</span>
          </button>
          <button className={`menu-item ${activeTab === "estudiantes" ? "active" : ""}`} onClick={() => setActiveTab("estudiantes")}>
            <Users size={20} /><span>Estudiantes</span>
          </button>
          <button className={`menu-item ${activeTab === "acudientes" ? "active" : ""}`} onClick={() => setActiveTab("acudientes")}>
            <Contact size={20} /><span>Acudientes</span>
          </button>
          <button className={`menu-item ${activeTab === "conductores" ? "active" : ""}`} onClick={() => setActiveTab("conductores")}>
            <UserSquare2 size={20} /><span>Conductores</span>
          </button>
        </nav>

        <button className="sidebar-logout-btn" onClick={cerrarSesion}>
          <LogOut size={20} /><span>Cerrar Sesión</span>
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
              {/* Omitiendo por brevedad, es el mismo contenido de resumen */}
              <div className="metrics-grid">
                <div className="metric-card"><div className="metric-icon routes"><RouteIcon size={24} /></div><div className="metric-data"><span className="metric-value">{rutas.length}</span><span className="metric-label">Rutas Creadas</span></div></div>
                <div className="metric-card"><div className="metric-icon drivers"><Users size={24} /></div><div className="metric-data"><span className="metric-value">{conductores.length}</span><span className="metric-label">Conductores</span></div></div>
                <div className="metric-card"><div className="metric-icon vehicles"><Bus size={24} /></div><div className="metric-data"><span className="metric-value">{vehiculos.length}</span><span className="metric-label">Vehículos</span></div></div>
                <div className="metric-card"><div className="metric-icon students"><ClipboardList size={24} /></div><div className="metric-data"><span className="metric-value">{estudiantes.length}</span><span className="metric-label">Alumnos Asignados</span></div></div>
              </div>
            </div>
          )}

          {/* TAB 2: GESTIONAR RUTAS */}
          {activeTab === "rutas" && (
             <div className="tab-pane">
              <div className="section-header"><h3>Registro de Rutas Escolares</h3></div>
              <div className="crud-container">
                <form className="crud-form card-form" onSubmit={agregarRuta}>
                  <h4>Crear Nueva Ruta</h4>
                  <div className="form-group"><label>Nombre</label><input type="text" value={nuevaRutaNombre} onChange={(e) => setNuevaRutaNombre(e.target.value)} required/></div>
                  <div className="form-group"><label>Conductor</label><input type="text" value={nuevaRutaConductor} onChange={(e) => setNuevaRutaConductor(e.target.value)} required/></div>
                  <div className="form-group"><label>Placa</label><input type="text" value={nuevaRutaPlaca} onChange={(e) => setNuevaRutaPlaca(e.target.value)}/></div>
                  <button type="submit" className="add-btn"><Plus size={16} /><span>Guardar Ruta</span></button>
                </form>
                <div className="crud-list flex-grow"><div className="table-responsive"><table className="admin-table">
                  <thead><tr><th>Ruta</th><th>Conductor</th><th>Vehículo</th><th>Paradas</th><th>Acción</th></tr></thead>
                  <tbody>{rutas.map(r => (<tr key={r.id}><td><strong>{r.nombre}</strong></td><td>{r.conductor}</td><td><span className="badge-plate">{r.vehiculo}</span></td><td>{r.paradas} paradas</td><td><button className="delete-row-btn" onClick={() => eliminarRuta(r.id)}><Trash2 size={16} /></button></td></tr>))}</tbody>
                </table></div></div>
              </div>
            </div>
          )}

          {/* TAB 3: ESTUDIANTES */}
          {activeTab === "estudiantes" && (
            <div className="tab-pane">
              <div className="section-header"><h3>Base de Alumnos Registrados</h3></div>
              <div className="crud-container">
                <form className={`crud-form card-form ${estudianteEditando ? "edit-mode" : ""}`} onSubmit={estudianteEditando ? actualizarEstudiante : agregarEstudiante}>
                  <h4>{estudianteEditando ? "Editar Estudiante" : "Crear Nuevo Estudiante"}</h4>
                  <div className="form-group"><label>Nombre</label><input type="text" value={nuevoEstudianteNombre} onChange={(e) => setNuevoEstudianteNombre(e.target.value)} required/></div>
                  <div className="form-group"><label>Apellido</label><input type="text" value={nuevoEstudianteApellido} onChange={(e) => setNuevoEstudianteApellido(e.target.value)} required/></div>
                  <div className="form-group"><label>Acudiente</label><select value={nuevoEstudianteAcudiente} onChange={(e) => setNuevoEstudianteAcudiente(e.target.value)} required><option value="">Seleccionar...</option>{acudientes.map(a => { const uInfo = obtenerInfoUsuario(a.idUsuario); return <option key={a.idAcudiente} value={a.idAcudiente}>#{a.idAcudiente} - {uInfo.nombre} {uInfo.apellido}</option>;})}</select></div>
                  <div className="form-group"><label>Colegio</label><input type="text" value={nuevoEstudianteColegio} onChange={(e) => setNuevoEstudianteColegio(e.target.value)}/></div>
                  <div className="form-group"><label>Grado</label><input type="text" value={nuevoEstudianteCurso} onChange={(e) => setNuevoEstudianteCurso(e.target.value)}/></div>
                  <div className="form-group"><label>Ruta Asignada</label><select value={nuevoEstudianteRuta} onChange={(e) => setNuevoEstudianteRuta(e.target.value)}><option value="">Sin ruta asignada</option>{rutas.map(r => (<option key={r.id} value={r.id}>{r.nombre}</option>))}</select></div>
                  <button type="submit" className="add-btn"><Plus size={16} /><span>{estudianteEditando ? "Actualizar" : "Guardar"}</span></button>
                  {estudianteEditando && <button type="button" className="cancel-btn" onClick={limpiarFormularioEstudiante}><X size={16} /><span>Cancelar</span></button>}
                </form>

                <div className="crud-list flex-grow">
                  {cargandoEstudiantes ? (<div className="loading-state"><div className="loading-spinner"></div></div>) : estudiantes.length === 0 ? (<div className="empty-state"><Users size={40} /><p>No hay estudiantes registrados</p></div>) : (
                    <div className="table-responsive"><table className="admin-table">
                      <thead><tr><th>Estudiante</th><th>Acudiente</th><th>Colegio</th><th>Ruta Asignada</th><th>Acciones</th></tr></thead>
                      <tbody>{estudiantes.map(est => {
                          const acu = acudientes.find(a => a.idAcudiente === est.idAcudiente);
                          const acNombre = acu ? `${obtenerInfoUsuario(acu.idUsuario).nombre} ${obtenerInfoUsuario(acu.idUsuario).apellido}` : "Sin asignar";
                          return (
                        <tr key={est.idEstudiante}>
                          <td><strong>{est.nombre} {est.apellido}</strong></td>
                          <td>{acNombre}</td>
                          <td>{est.colegio || "-"}</td>
                          <td><span className="route-tag">{est.idRuta ? obtenerNombreRuta(est.idRuta) : "-"}</span></td>
                          <td><div className="action-buttons"><button className="edit-row-btn" onClick={() => iniciarEdicionEstudiante(est)}><Pencil size={16} /></button><button className="delete-row-btn" onClick={() => eliminarEstudiante(est.idEstudiante)}><Trash2 size={16} /></button></div></td>
                        </tr>
                      )})}</tbody>
                    </table></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACUDIENTES */}
          {activeTab === "acudientes" && (
            <div className="tab-pane">
              <div className="section-header"><h3>Gestión de Acudientes</h3></div>
              <div className="crud-container">
                <form className={`crud-form card-form ${acudienteEditando ? "edit-mode" : ""}`} onSubmit={acudienteEditando ? actualizarAcudiente : agregarAcudiente}>
                  <h4>{acudienteEditando ? "Editar Acudiente" : "Crear Nuevo Acudiente"}</h4>
                  <div className="form-group"><label>Nombre</label><input type="text" value={nuevoAcudienteNombre} onChange={(e) => setNuevoAcudienteNombre(e.target.value)} required/></div>
                  <div className="form-group"><label>Apellido</label><input type="text" value={nuevoAcudienteApellido} onChange={(e) => setNuevoAcudienteApellido(e.target.value)} required/></div>
                  <div className="form-group"><label>Correo Electrónico</label><input type="email" value={nuevoAcudienteCorreo} onChange={(e) => setNuevoAcudienteCorreo(e.target.value)} required/></div>
                  <div className="form-group"><label>Contraseña {acudienteEditando && "(Opcional)"}</label><input type="password" value={nuevoAcudienteContrasena} onChange={(e) => setNuevoAcudienteContrasena(e.target.value)} required={!acudienteEditando}/></div>
                  <div className="form-group"><label>Teléfono</label><input type="tel" value={nuevoAcudienteTelefono} onChange={(e) => setNuevoAcudienteTelefono(e.target.value)}/></div>
                  <div className="form-group"><label>Dirección Residencia</label><input type="text" value={nuevoAcudienteDireccion} onChange={(e) => setNuevoAcudienteDireccion(e.target.value)}/></div>
                  <button type="submit" className="add-btn"><Plus size={16} /><span>{acudienteEditando ? "Actualizar" : "Guardar"}</span></button>
                  {acudienteEditando && <button type="button" className="cancel-btn" onClick={limpiarFormularioAcudiente}><X size={16} /><span>Cancelar</span></button>}
                </form>

                <div className="crud-list flex-grow">
                  {cargandoAcudientes ? (<div className="loading-state"><div className="loading-spinner"></div></div>) : acudientes.length === 0 ? (<div className="empty-state"><Contact size={40} /><p>No hay acudientes registrados</p></div>) : (
                    <div className="table-responsive"><table className="admin-table">
                      <thead><tr><th>Acudiente</th><th>Correo</th><th>Teléfono</th><th>Dirección</th><th>Acciones</th></tr></thead>
                      <tbody>{acudientes.map(acu => {
                          const uInfo = obtenerInfoUsuario(acu.idUsuario);
                          return (
                        <tr key={acu.idAcudiente}>
                          <td><strong>{uInfo.nombre} {uInfo.apellido}</strong></td>
                          <td>{uInfo.correo}</td>
                          <td>{uInfo.telefono || "-"}</td>
                          <td>{acu.direccionResidencia || "-"}</td>
                          <td><div className="action-buttons"><button className="edit-row-btn" onClick={() => iniciarEdicionAcudiente(acu)}><Pencil size={16} /></button><button className="delete-row-btn" onClick={() => eliminarAcudiente(acu.idAcudiente, acu.idUsuario)}><Trash2 size={16} /></button></div></td>
                        </tr>
                      )})}</tbody>
                    </table></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONDUCTORES */}
          {activeTab === "conductores" && (
             <div className="tab-pane">
              <div className="section-header"><h3>Gestión de Conductores</h3></div>
              <div className="crud-container">
                <form className={`crud-form card-form ${conductorEditando ? "edit-mode" : ""}`} onSubmit={conductorEditando ? actualizarConductor : agregarConductor}>
                  <h4>{conductorEditando ? "Editar Conductor" : "Crear Nuevo Conductor"}</h4>
                  <div className="form-group"><label>Nombre</label><input type="text" value={nuevoConductorNombre} onChange={(e) => setNuevoConductorNombre(e.target.value)} required/></div>
                  <div className="form-group"><label>Apellido</label><input type="text" value={nuevoConductorApellido} onChange={(e) => setNuevoConductorApellido(e.target.value)} required/></div>
                  <div className="form-group"><label>Correo Electrónico</label><input type="email" value={nuevoConductorCorreo} onChange={(e) => setNuevoConductorCorreo(e.target.value)} required/></div>
                  <div className="form-group"><label>Contraseña {conductorEditando && "(Opcional)"}</label><input type="password" value={nuevoConductorContrasena} onChange={(e) => setNuevoConductorContrasena(e.target.value)} required={!conductorEditando}/></div>
                  <div className="form-group"><label>Teléfono</label><input type="tel" value={nuevoConductorTelefono} onChange={(e) => setNuevoConductorTelefono(e.target.value)}/></div>
                  <div className="form-group"><label>Licencia</label><input type="text" value={nuevoConductorLicencia} onChange={(e) => setNuevoConductorLicencia(e.target.value)} required/></div>
                  <div className="form-group"><label>Categoría (Ej. C1)</label><input type="text" value={nuevoConductorCategoria} onChange={(e) => setNuevoConductorCategoria(e.target.value)}/></div>
                  <div className="form-group"><label>Vehículo Asignado</label><select value={nuevoConductorVehiculo} onChange={(e) => setNuevoConductorVehiculo(e.target.value)}><option value="">Sin asignar</option>{vehiculos.map(v => (<option key={v.idVehiculo} value={v.idVehiculo}>{v.placa}</option>))}</select></div>
                  <button type="submit" className="add-btn"><Plus size={16} /><span>{conductorEditando ? "Actualizar" : "Guardar"}</span></button>
                  {conductorEditando && <button type="button" className="cancel-btn" onClick={limpiarFormularioConductor}><X size={16} /><span>Cancelar</span></button>}
                </form>

                <div className="crud-list flex-grow">
                  {cargandoConductores ? (<div className="loading-state"><div className="loading-spinner"></div></div>) : conductores.length === 0 ? (<div className="empty-state"><UserSquare2 size={40} /><p>No hay conductores registrados</p></div>) : (
                    <div className="table-responsive"><table className="admin-table">
                      <thead><tr><th>Conductor</th><th>Correo</th><th>Licencia</th><th>Cat</th><th>Vehículo</th><th>Acciones</th></tr></thead>
                      <tbody>{conductores.map(cond => {
                          const uInfo = obtenerInfoUsuario(cond.idUsuario);
                          return (
                        <tr key={cond.idConductor}>
                          <td><strong>{uInfo.nombre} {uInfo.apellido}</strong></td>
                          <td>{uInfo.correo}</td>
                          <td>{cond.numeroLicencia}</td>
                          <td>{cond.categoriaLicencia || "-"}</td>
                          <td><span className="badge-plate">{cond.idVehiculo ? obtenerPlacaVehiculo(cond.idVehiculo) : "Sin asignar"}</span></td>
                          <td><div className="action-buttons"><button className="edit-row-btn" onClick={() => iniciarEdicionConductor(cond)}><Pencil size={16} /></button><button className="delete-row-btn" onClick={() => eliminarConductor(cond.idConductor, cond.idUsuario)}><Trash2 size={16} /></button></div></td>
                        </tr>
                      )})}</tbody>
                    </table></div>
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
