import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Route as RouteIcon,
  Users,
  Bus,
  LogOut,
  Plus,
  Trash2,
  ClipboardList,
  Pencil,
  X,
  UserSquare2,
  Contact,
  Menu
} from "lucide-react";
import "./Admin.css";

const API_BASE = "https://schooltrack.seminario1.eleueleo.com/api";

function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("resumen");
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [showModalAcudiente, setShowModalAcudiente] = useState(false);

  // ── Conductores state ──
  const [conductores, setConductores] = useState([]);
  const [cargandoConductores, setCargandoConductores] = useState(false);
  const [conductorEditando, setConductorEditando] = useState(null);
  const [showModalConductor, setShowModalConductor] = useState(false);

  // ── Vehículos state ──
  const [cargandoVehiculos, setCargandoVehiculos] = useState(false);
  const [vehiculoEditando, setVehiculoEditando] = useState(null);
  const [showModalVehiculo, setShowModalVehiculo] = useState(false);

  // Modal de crear ruta
  const [showModalRuta, setShowModalRuta] = useState(false);

  // Modal de editar ruta
  const [showModalEditarRuta, setShowModalEditarRuta] = useState(false);
  const [rutaEditando, setRutaEditando] = useState(null);
  const [editRutaNombre, setEditRutaNombre] = useState("");
  const [editRutaConductor, setEditRutaConductor] = useState("");
  const [editRutaPlaca, setEditRutaPlaca] = useState("");

  // Modal de estudiante (crear / editar)
  const [showModalEstudiante, setShowModalEstudiante] = useState(false);

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

  // Variables para vehículo
  const [nuevoVehiculoPlaca, setNuevoVehiculoPlaca] = useState("");
  const [nuevoVehiculoModelo, setNuevoVehiculoModelo] = useState("");
  const [nuevoVehiculoCapacidad, setNuevoVehiculoCapacidad] = useState("");
  const [nuevoVehiculoSoat, setNuevoVehiculoSoat] = useState("");
  const [nuevoVehiculoTecno, setNuevoVehiculoTecno] = useState("");

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
        setNuevaRutaNombre("");
        setNuevaRutaConductor("");
        setNuevaRutaPlaca("");
        setShowModalRuta(false);
      } else {
        alert("Error al guardar la ruta en el servidor.");
      }
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

  const abrirModalEditar = (ruta) => {
    setRutaEditando(ruta);
    setEditRutaNombre(ruta.nombre);
    setEditRutaConductor(ruta.conductor);
    setEditRutaPlaca(ruta.vehiculo === "Sin placa" ? "" : ruta.vehiculo);
    setShowModalEditarRuta(true);
  };

  const actualizarRuta = async (e) => {
    e.preventDefault();
    if (!editRutaNombre || !editRutaConductor) return;
    const descripcion = `Conductor: ${editRutaConductor} | Vehículo: ${editRutaPlaca || "SIN PLACA"}`;
    try {
      const response = await fetch(`${API_BASE}/Ruta/${rutaEditando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idRuta: rutaEditando.id, nombreRuta: editRutaNombre, descripcion: descripcion })
      });
      if (response.ok) {
        await cargarRutas();
        setShowModalEditarRuta(false);
        setRutaEditando(null);
      } else {
        alert("Error al actualizar la ruta en el servidor.");
      }
    } catch (err) {
      alert("No se pudo conectar con el servidor para actualizar.");
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
        setShowModalEstudiante(false);
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
        setShowModalEstudiante(false);
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
  //  VEHICULOS
  // ════════════════════════════════════════

  const limpiarFormularioVehiculo = () => {
    setNuevoVehiculoPlaca("");
    setNuevoVehiculoModelo("");
    setNuevoVehiculoCapacidad("");
    setNuevoVehiculoSoat("");
    setNuevoVehiculoTecno("");
  };

  const iniciarEdicionVehiculo = (veh) => {
    setVehiculoEditando(veh);
    setNuevoVehiculoPlaca(veh.placa || "");
    setNuevoVehiculoModelo(veh.modelo || "");
    setNuevoVehiculoCapacidad(veh.capacidadPasajeros ? veh.capacidadPasajeros.toString() : "");
    setNuevoVehiculoSoat(veh.soatVencimiento ? veh.soatVencimiento.split('T')[0] : "");
    setNuevoVehiculoTecno(veh.tecnomecanicaVencimiento ? veh.tecnomecanicaVencimiento.split('T')[0] : "");
    setShowModalVehiculo(true);
  };

  const agregarVehiculo = async (e) => {
    e.preventDefault();
    if (!nuevoVehiculoPlaca || !nuevoVehiculoCapacidad) return;
    try {
      const body = {
        placa: nuevoVehiculoPlaca,
        modelo: nuevoVehiculoModelo,
        capacidadPasajeros: parseInt(nuevoVehiculoCapacidad),
        soatVencimiento: nuevoVehiculoSoat ? nuevoVehiculoSoat + "T00:00:00" : null,
        tecnomecanicaVencimiento: nuevoVehiculoTecno ? nuevoVehiculoTecno + "T00:00:00" : null
      };
      const response = await fetch(`${API_BASE}/Vehiculo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        await cargarVehiculos();
        limpiarFormularioVehiculo();
        setShowModalVehiculo(false);
      } else alert("Error al crear vehículo.");
    } catch (err) {
      alert("Error de red.");
    }
  };

  const actualizarVehiculo = async (e) => {
    e.preventDefault();
    if (!nuevoVehiculoPlaca || !nuevoVehiculoCapacidad) return;
    try {
      const body = {
        idVehiculo: vehiculoEditando.idVehiculo,
        placa: nuevoVehiculoPlaca,
        modelo: nuevoVehiculoModelo,
        capacidadPasajeros: parseInt(nuevoVehiculoCapacidad),
        soatVencimiento: nuevoVehiculoSoat ? nuevoVehiculoSoat + "T00:00:00" : null,
        tecnomecanicaVencimiento: nuevoVehiculoTecno ? nuevoVehiculoTecno + "T00:00:00" : null
      };
      const response = await fetch(`${API_BASE}/Vehiculo/${vehiculoEditando.idVehiculo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (response.ok) {
        await cargarVehiculos();
        limpiarFormularioVehiculo();
        setShowModalVehiculo(false);
      } else alert("Error al actualizar vehículo.");
    } catch (err) {
      alert("Error de red.");
    }
  };

  const eliminarVehiculo = async (idVehiculo) => {
    if (!window.confirm("¿Seguro que deseas eliminar este vehículo?")) return;
    try {
      const response = await fetch(`${API_BASE}/Vehiculo/${idVehiculo}`, { method: "DELETE" });
      if (response.ok) {
        await cargarVehiculos();
      } else alert("Error al eliminar vehículo. Verifica que no esté en uso.");
    } catch (err) {
      alert("Error de red.");
    }
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
        setShowModalAcudiente(false);
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
        setShowModalAcudiente(false);
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
    setShowModalConductor(true);
  };

  const limpiarFormularioConductor = () => {
    setConductorEditando(null); setNuevoConductorNombre(""); setNuevoConductorApellido("");
    setNuevoConductorCorreo(""); setNuevoConductorContrasena(""); setNuevoConductorTelefono("");
    setNuevoConductorLicencia(""); setNuevoConductorCategoria(""); setNuevoConductorVehiculo("");
    setShowModalConductor(false);
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
      {/* BARRA MÓVIL (VISIBLE SOLO EN MÓVILES Y TABLETS PEOUEÑAS) */}
      <div className="mobile-admin-bar">
        <button
          className="mobile-menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Abrir menú de navegación"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="mobile-brand">
          <Bus size={24} />
          <span>SchoolTrack</span>
        </div>
      </div>

      {/* OVERLAY PARA CERRAR MENÚ AL HACER CLIC FUERA */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
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
          <button className={`menu-item ${activeTab === "resumen" ? "active" : ""}`} onClick={() => { setActiveTab("resumen"); setSidebarOpen(false); }}>
            <LayoutDashboard size={20} /><span>Resumen</span>
          </button>
          <button className={`menu-item ${activeTab === "rutas" ? "active" : ""}`} onClick={() => { setActiveTab("rutas"); setSidebarOpen(false); }}>
            <RouteIcon size={20} /><span>Gestionar Rutas</span>
          </button>
          <button className={`menu-item ${activeTab === "estudiantes" ? "active" : ""}`} onClick={() => { setActiveTab("estudiantes"); setSidebarOpen(false); }}>
            <Users size={20} /><span>Estudiantes</span>
          </button>
          <button className={`menu-item ${activeTab === "acudientes" ? "active" : ""}`} onClick={() => { setActiveTab("acudientes"); setSidebarOpen(false); }}>
            <Contact size={20} /><span>Acudientes</span>
          </button>
          <button className={`menu-item ${activeTab === "conductores" ? "active" : ""}`} onClick={() => { setActiveTab("conductores"); setSidebarOpen(false); }}>
            <UserSquare2 size={20} /><span>Conductores</span>
          </button>
          <button className={`menu-item ${activeTab === "vehiculos" ? "active" : ""}`} onClick={() => { setActiveTab("vehiculos"); setSidebarOpen(false); }}>
            <Bus size={20} /><span>Vehículos</span>
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
              <div className="section-header rutas-header">
                <h3>Registro de Rutas Escolares</h3>
                <button className="btn-crear-ruta" onClick={() => setShowModalRuta(true)}>
                  <Plus size={18} />
                  <span>Crear Nueva Ruta</span>
                </button>
              </div>

              {/* Listado de Rutas */}
              <div className="crud-list">
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
                            <div className="action-btns">
                              <button className="edit-row-btn" onClick={() => abrirModalEditar(r)} title="Editar ruta">
                                <Pencil size={16} />
                              </button>
                              <button className="delete-row-btn" onClick={() => eliminarRuta(r.id)} title="Eliminar ruta">
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

              {/* MODAL: Crear Nueva Ruta */}
              {showModalRuta && (
                <div className="modal-overlay" onClick={() => setShowModalRuta(false)}>
                  <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h4>Crear Nueva Ruta</h4>
                      <button className="modal-close-btn" onClick={() => setShowModalRuta(false)}>
                        <X size={18} />
                      </button>
                    </div>
                    <form onSubmit={agregarRuta}>
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
                      <div className="modal-actions">
                        <button type="button" className="btn-cancelar" onClick={() => setShowModalRuta(false)}>Cancelar</button>
                        <button type="submit" className="add-btn modal-submit-btn">
                          <Plus size={16} />
                          <span>Guardar Ruta</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* MODAL: Editar Ruta */}
              {showModalEditarRuta && (
                <div className="modal-overlay" onClick={() => setShowModalEditarRuta(false)}>
                  <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h4>Editar Ruta</h4>
                      <button className="modal-close-btn" onClick={() => setShowModalEditarRuta(false)}>
                        <X size={18} />
                      </button>
                    </div>
                    <form onSubmit={actualizarRuta}>
                      <div className="form-group">
                        <label>Nombre de la Ruta</label>
                        <input
                          type="text"
                          placeholder="Ej. Ruta 04 - Occidente"
                          value={editRutaNombre}
                          onChange={(e) => setEditRutaNombre(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Conductor Asignado</label>
                        <input
                          type="text"
                          placeholder="Nombre del conductor"
                          value={editRutaConductor}
                          onChange={(e) => setEditRutaConductor(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Placa del Vehículo</label>
                        <input
                          type="text"
                          placeholder="Ej. ABC-123"
                          value={editRutaPlaca}
                          onChange={(e) => setEditRutaPlaca(e.target.value)}
                        />
                      </div>
                      <div className="modal-actions">
                        <button type="button" className="btn-cancelar" onClick={() => setShowModalEditarRuta(false)}>Cancelar</button>
                        <button type="submit" className="add-btn modal-submit-btn">
                          <Pencil size={16} />
                          <span>Guardar Cambios</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ESTUDIANTES */}
          {activeTab === "estudiantes" && (
            <div className="tab-pane">
              <div className="section-header rutas-header">
                <h3>Base de Alumnos Registrados</h3>
                <button className="btn-crear-ruta" onClick={() => { setEstudianteEditando(null); limpiarFormularioEstudiante(); setShowModalEstudiante(true); }}>
                  <Plus size={18} />
                  <span>Crear Nuevo Estudiante</span>
                </button>
              </div>

              {/* Listado de Estudiantes */}
              <div className="crud-list">
                {cargandoEstudiantes ? (
                  <div className="loading-state"><div className="loading-spinner"></div></div>
                ) : estudiantes.length === 0 ? (
                  <div className="empty-state"><Users size={40} /><p>No hay estudiantes registrados</p></div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Estudiante</th>
                          <th>Acudiente</th>
                          <th>Colegio</th>
                          <th>Ruta Asignada</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {estudiantes.map(est => {
                          const acu = acudientes.find(a => a.idAcudiente === est.idAcudiente);
                          const acNombre = acu ? `${obtenerInfoUsuario(acu.idUsuario).nombre} ${obtenerInfoUsuario(acu.idUsuario).apellido}` : "Sin asignar";
                          return (
                            <tr key={est.idEstudiante}>
                              <td><strong>{est.nombre} {est.apellido}</strong></td>
                              <td>{acNombre}</td>
                              <td>{est.colegio || "-"}</td>
                              <td><span className="route-tag">{est.idRuta ? obtenerNombreRuta(est.idRuta) : "-"}</span></td>
                              <td>
                                <div className="action-btns">
                                  <button className="edit-row-btn" title="Editar estudiante" onClick={() => { iniciarEdicionEstudiante(est); setShowModalEstudiante(true); }}>
                                    <Pencil size={16} />
                                  </button>
                                  <button className="delete-row-btn" title="Eliminar estudiante" onClick={() => eliminarEstudiante(est.idEstudiante)}>
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* MODAL: Crear / Editar Estudiante */}
              {showModalEstudiante && (
                <div className="modal-overlay" onClick={() => { setShowModalEstudiante(false); setEstudianteEditando(null); limpiarFormularioEstudiante(); }}>
                  <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h4>{estudianteEditando ? "Editar Estudiante" : "Crear Nuevo Estudiante"}</h4>
                      <button className="modal-close-btn" onClick={() => { setShowModalEstudiante(false); setEstudianteEditando(null); limpiarFormularioEstudiante(); }}>
                        <X size={18} />
                      </button>
                    </div>
                    <form onSubmit={estudianteEditando ? actualizarEstudiante : agregarEstudiante}>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Nombre</label>
                          <input type="text" placeholder="Ej. Carlos" value={nuevoEstudianteNombre} onChange={(e) => setNuevoEstudianteNombre(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label>Apellido</label>
                          <input type="text" placeholder="Ej. Gómez" value={nuevoEstudianteApellido} onChange={(e) => setNuevoEstudianteApellido(e.target.value)} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Acudiente</label>
                        <select value={nuevoEstudianteAcudiente} onChange={(e) => setNuevoEstudianteAcudiente(e.target.value)} required>
                          <option value="">Seleccionar...</option>
                          {acudientes.map(a => { const uInfo = obtenerInfoUsuario(a.idUsuario); return <option key={a.idAcudiente} value={a.idAcudiente}>#{a.idAcudiente} - {uInfo.nombre} {uInfo.apellido}</option>; })}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Colegio</label>
                        <input type="text" placeholder="Ej. Colegio Central" value={nuevoEstudianteColegio} onChange={(e) => setNuevoEstudianteColegio(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Grado</label>
                        <input type="text" placeholder="Ej. 5° Primaria" value={nuevoEstudianteCurso} onChange={(e) => setNuevoEstudianteCurso(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Ruta Asignada</label>
                        <select value={nuevoEstudianteRuta} onChange={(e) => setNuevoEstudianteRuta(e.target.value)}>
                          <option value="">Sin ruta asignada</option>
                          {rutas.map(r => (<option key={r.id} value={r.id}>{r.nombre}</option>))}
                        </select>
                      </div>
                      <div className="modal-actions">
                        <button type="button" className="btn-cancelar" onClick={() => { setShowModalEstudiante(false); setEstudianteEditando(null); limpiarFormularioEstudiante(); }}>Cancelar</button>
                        <button type="submit" className="add-btn modal-submit-btn">
                          {estudianteEditando ? <Pencil size={16} /> : <Plus size={16} />}
                          <span>{estudianteEditando ? "Guardar Cambios" : "Guardar Estudiante"}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ACUDIENTES */}
          {activeTab === "acudientes" && (
            <div className="tab-pane">
              <div className="section-header rutas-header">
                <h3>Base de Acudientes Registrados</h3>
                <button className="btn-crear-ruta" onClick={() => { setAcudienteEditando(null); limpiarFormularioAcudiente(); setShowModalAcudiente(true); }}>
                  <Plus size={18} />
                  <span>Crear Nuevo Acudiente</span>
                </button>
              </div>

              {/* Listado de Acudientes */}
              <div className="crud-list">
                {cargandoAcudientes ? (
                  <div className="loading-state"><div className="loading-spinner"></div></div>
                ) : acudientes.length === 0 ? (
                  <div className="empty-state"><Contact size={40} /><p>No hay acudientes registrados</p></div>
                ) : (
                  <div className="table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Acudiente</th>
                          <th>Correo</th>
                          <th>Teléfono</th>
                          <th>Dirección</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {acudientes.map(acu => {
                          const uInfo = obtenerInfoUsuario(acu.idUsuario);
                          return (
                            <tr key={acu.idAcudiente}>
                              <td><strong>{uInfo.nombre} {uInfo.apellido}</strong></td>
                              <td>{uInfo.correo}</td>
                              <td>{uInfo.telefono || "-"}</td>
                              <td>{acu.direccionResidencia || "-"}</td>
                              <td>
                                <div className="action-btns">
                                  <button className="edit-row-btn" title="Editar acudiente" onClick={() => { iniciarEdicionAcudiente(acu); setShowModalAcudiente(true); }}>
                                    <Pencil size={16} />
                                  </button>
                                  <button className="delete-row-btn" title="Eliminar acudiente" onClick={() => eliminarAcudiente(acu.idAcudiente, acu.idUsuario)}>
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* MODAL: Crear / Editar Acudiente */}
              {showModalAcudiente && (
                <div className="modal-overlay" onClick={() => { setShowModalAcudiente(false); setAcudienteEditando(null); limpiarFormularioAcudiente(); }}>
                  <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h4>{acudienteEditando ? "Editar Acudiente" : "Crear Nuevo Acudiente"}</h4>
                      <button className="modal-close-btn" onClick={() => { setShowModalAcudiente(false); setAcudienteEditando(null); limpiarFormularioAcudiente(); }}>
                        <X size={18} />
                      </button>
                    </div>
                    <form onSubmit={acudienteEditando ? actualizarAcudiente : agregarAcudiente}>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Nombre</label>
                          <input type="text" placeholder="Ej. Juan" value={nuevoAcudienteNombre} onChange={(e) => setNuevoAcudienteNombre(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label>Apellido</label>
                          <input type="text" placeholder="Ej. Pérez" value={nuevoAcudienteApellido} onChange={(e) => setNuevoAcudienteApellido(e.target.value)} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input type="email" placeholder="Ej. juan.perez@email.com" value={nuevoAcudienteCorreo} onChange={(e) => setNuevoAcudienteCorreo(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label>Contraseña {acudienteEditando && "(Opcional)"}</label>
                        <input type="password" placeholder="Contraseña segura" value={nuevoAcudienteContrasena} onChange={(e) => setNuevoAcudienteContrasena(e.target.value)} required={!acudienteEditando} />
                      </div>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Teléfono</label>
                          <input type="tel" placeholder="Ej. 3001234567" value={nuevoAcudienteTelefono} onChange={(e) => setNuevoAcudienteTelefono(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Dirección Residencia</label>
                          <input type="text" placeholder="Ej. Calle 123 #45-67" value={nuevoAcudienteDireccion} onChange={(e) => setNuevoAcudienteDireccion(e.target.value)} />
                        </div>
                      </div>
                      <div className="modal-actions">
                        <button type="button" className="btn-cancelar" onClick={() => { setShowModalAcudiente(false); setAcudienteEditando(null); limpiarFormularioAcudiente(); }}>Cancelar</button>
                        <button type="submit" className="add-btn modal-submit-btn">
                          {acudienteEditando ? <Pencil size={16} /> : <Plus size={16} />}
                          <span>{acudienteEditando ? "Guardar Cambios" : "Guardar Acudiente"}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CONDUCTORES */}
          {activeTab === "conductores" && (
            <div className="tab-pane">
              <div className="section-header rutas-header">
                <h3>Gestión de Conductores</h3>
                <button className="btn-crear-ruta" onClick={() => { setConductorEditando(null); limpiarFormularioConductor(); setShowModalConductor(true); }}>
                  <Plus size={18} />
                  <span>Crear Nuevo Conductor</span>
                </button>
              </div>

              {showModalConductor && (
                <div className="modal-overlay" onClick={() => { setShowModalConductor(false); setConductorEditando(null); limpiarFormularioConductor(); }}>
                  <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h4>{conductorEditando ? "Editar Conductor" : "Crear Nuevo Conductor"}</h4>
                      <button className="modal-close-btn" onClick={() => { setShowModalConductor(false); setConductorEditando(null); limpiarFormularioConductor(); }}>
                        <X size={18} />
                      </button>
                    </div>
                    <form onSubmit={conductorEditando ? actualizarConductor : agregarConductor}>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Nombre</label>
                          <input type="text" placeholder="Ej. Luis" value={nuevoConductorNombre} onChange={(e) => setNuevoConductorNombre(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label>Apellido</label>
                          <input type="text" placeholder="Ej. Rodríguez" value={nuevoConductorApellido} onChange={(e) => setNuevoConductorApellido(e.target.value)} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input type="email" placeholder="Ej. luis@email.com" value={nuevoConductorCorreo} onChange={(e) => setNuevoConductorCorreo(e.target.value)} required />
                      </div>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Contraseña {conductorEditando && "(Opcional)"}</label>
                          <input type="password" placeholder="Contraseña segura" value={nuevoConductorContrasena} onChange={(e) => setNuevoConductorContrasena(e.target.value)} required={!conductorEditando} />
                        </div>
                        <div className="form-group">
                          <label>Teléfono</label>
                          <input type="tel" placeholder="Ej. 3001234567" value={nuevoConductorTelefono} onChange={(e) => setNuevoConductorTelefono(e.target.value)} />
                        </div>
                      </div>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Licencia</label>
                          <input type="text" placeholder="Ej. 123456789" value={nuevoConductorLicencia} onChange={(e) => setNuevoConductorLicencia(e.target.value)} required />
                        </div>
                        <div className="form-group">
                          <label>Categoría (Ej. C1)</label>
                          <input type="text" placeholder="Ej. C1" value={nuevoConductorCategoria} onChange={(e) => setNuevoConductorCategoria(e.target.value)} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Vehículo Asignado</label>
                        <select value={nuevoConductorVehiculo} onChange={(e) => setNuevoConductorVehiculo(e.target.value)}>
                          <option value="">Sin asignar</option>
                          {vehiculos.map(v => (<option key={v.idVehiculo} value={v.idVehiculo}>{v.placa}</option>))}
                        </select>
                      </div>
                      <div className="modal-actions">
                        <button type="button" className="btn-cancelar" onClick={() => { setShowModalConductor(false); setConductorEditando(null); limpiarFormularioConductor(); }}>Cancelar</button>
                        <button type="submit" className="add-btn modal-submit-btn">
                          {conductorEditando ? <Pencil size={16} /> : <Plus size={16} />}
                          <span>{conductorEditando ? "Guardar Cambios" : "Guardar Conductor"}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="crud-list" style={{ width: "100%", maxWidth: "100%" }}>
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
                      )
                    })}</tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: VEHICULOS */}
          {activeTab === "vehiculos" && (
            <div className="tab-pane">
              <div className="section-header rutas-header">
                <h3>Base de Vehículos</h3>
                <button className="btn-crear-ruta" onClick={() => { setVehiculoEditando(null); limpiarFormularioVehiculo(); setShowModalVehiculo(true); }}>
                  <Plus size={18} />
                  <span>Añadir Vehículo</span>
                </button>
              </div>

              {showModalVehiculo && (
                <div className="modal-overlay" onClick={() => { setShowModalVehiculo(false); setVehiculoEditando(null); limpiarFormularioVehiculo(); }}>
                  <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h4>{vehiculoEditando ? "Editar Vehículo" : "Añadir Nuevo Vehículo"}</h4>
                      <button className="modal-close-btn" onClick={() => { setShowModalVehiculo(false); setVehiculoEditando(null); limpiarFormularioVehiculo(); }}>
                        <X size={18} />
                      </button>
                    </div>
                    <form onSubmit={vehiculoEditando ? actualizarVehiculo : agregarVehiculo}>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Placa</label>
                          <input type="text" placeholder="Ej. ABC-123" value={nuevoVehiculoPlaca} onChange={(e) => setNuevoVehiculoPlaca(e.target.value.toUpperCase())} required maxLength={15} />
                        </div>
                        <div className="form-group">
                          <label>Capacidad Pasajeros</label>
                          <input type="number" placeholder="Ej. 19" value={nuevoVehiculoCapacidad} onChange={(e) => setNuevoVehiculoCapacidad(e.target.value)} required min={1} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Marca / Modelo</label>
                        <input type="text" placeholder="Ej. Chevrolet 2020" value={nuevoVehiculoModelo} onChange={(e) => setNuevoVehiculoModelo(e.target.value)} />
                      </div>
                      <div className="form-grid-2">
                        <div className="form-group">
                          <label>Vencimiento SOAT</label>
                          <input type="date" value={nuevoVehiculoSoat} onChange={(e) => setNuevoVehiculoSoat(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Vencimiento Tecnomecánica</label>
                          <input type="date" value={nuevoVehiculoTecno} onChange={(e) => setNuevoVehiculoTecno(e.target.value)} />
                        </div>
                      </div>
                      <div className="modal-actions">
                        <button type="button" className="btn-cancelar" onClick={() => { setShowModalVehiculo(false); setVehiculoEditando(null); limpiarFormularioVehiculo(); }}>Cancelar</button>
                        <button type="submit" className="add-btn modal-submit-btn">
                          {vehiculoEditando ? <Pencil size={16} /> : <Plus size={16} />}
                          <span>{vehiculoEditando ? "Guardar Cambios" : "Guardar Vehículo"}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="crud-list" style={{ width: "100%", maxWidth: "100%" }}>
                {cargandoVehiculos ? (<div className="loading-state"><div className="loading-spinner"></div></div>) : vehiculos.length === 0 ? (<div className="empty-state"><Bus size={40} /><p>No hay vehículos registrados</p></div>) : (
                  <div className="table-responsive"><table className="admin-table">
                    <thead><tr><th>Placa</th><th>Modelo</th><th>Capacidad</th><th>SOAT Venc.</th><th>Tecno Venc.</th><th>Acciones</th></tr></thead>
                    <tbody>{vehiculos.map(veh => (
                      <tr key={veh.idVehiculo}>
                        <td><span className="badge-plate">{veh.placa}</span></td>
                        <td>{veh.modelo || "-"}</td>
                        <td>{veh.capacidadPasajeros} pas.</td>
                        <td>{veh.soatVencimiento ? new Date(veh.soatVencimiento).toLocaleDateString() : "-"}</td>
                        <td>{veh.tecnomecanicaVencimiento ? new Date(veh.tecnomecanicaVencimiento).toLocaleDateString() : "-"}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="edit-row-btn" onClick={() => iniciarEdicionVehiculo(veh)}><Pencil size={16} /></button>
                            <button className="delete-row-btn" onClick={() => eliminarVehiculo(veh.idVehiculo)}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default Admin;
