import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import "./SelectorBuscable.css";

// Ignora mayúsculas y tildes al buscar ("jose" encuentra "José")
const normalizar = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/**
 * Desplegable con búsqueda: al hacer clic muestra el listado completo
 * y al escribir lo filtra por la etiqueta y el subtítulo.
 *
 * opciones: [{ value, label, sublabel?, disabled? }]
 */
function SelectorBuscable({
  opciones,
  value,
  onChange,
  placeholder = "Buscar o seleccionar...",
  textoSinResultados = "No hay resultados",
  permitirVaciar = true,
  textoVacio = "Sin asignar",
  disabled = false,
  id,
}) {
  const idAuto = useId();
  const idLista = `${id || idAuto}-lista`;
  const contenedorRef = useRef(null);
  const listaRef = useRef(null);
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [resaltado, setResaltado] = useState(-1);

  const seleccionada = opciones.find((o) => o.value === value) || null;

  const filtradas = useMemo(() => {
    const termino = normalizar(busqueda);
    if (!termino) return opciones;
    return opciones.filter(
      (o) => normalizar(o.label).includes(termino) || normalizar(o.sublabel).includes(termino)
    );
  }, [opciones, busqueda]);

  // Cerrar al hacer clic fuera del componente
  useEffect(() => {
    if (!abierto) return;
    const alClicFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false);
        setBusqueda("");
      }
    };
    document.addEventListener("mousedown", alClicFuera);
    return () => document.removeEventListener("mousedown", alClicFuera);
  }, [abierto]);

  // Mantener visible la opción resaltada al navegar con el teclado
  useEffect(() => {
    if (!abierto || resaltado < 0 || !listaRef.current) return;
    listaRef.current.querySelector(`[data-indice="${resaltado}"]`)?.scrollIntoView({ block: "nearest" });
  }, [resaltado, abierto]);

  const abrir = () => {
    if (disabled) return;
    setAbierto(true);
    setResaltado(-1);
  };

  const elegir = (opcion) => {
    if (opcion.disabled) return;
    onChange(opcion.value, opcion);
    setAbierto(false);
    setBusqueda("");
  };

  const vaciar = (e) => {
    e.stopPropagation();
    onChange("", null);
    setBusqueda("");
  };

  const siguienteHabilitada = (desde, paso) => {
    let i = desde;
    for (let n = 0; n < filtradas.length; n++) {
      i = (i + paso + filtradas.length) % filtradas.length;
      if (!filtradas[i].disabled) return i;
    }
    return -1;
  };

  const alPresionarTecla = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!abierto) {
        abrir();
        return;
      }
      setResaltado((r) => siguienteHabilitada(r < 0 && e.key === "ArrowUp" ? 0 : r, e.key === "ArrowDown" ? 1 : -1));
    } else if (e.key === "Enter") {
      // Evita que Enter envíe el formulario mientras el listado está abierto
      if (abierto) {
        e.preventDefault();
        const opcion = filtradas[resaltado] || (filtradas.length === 1 ? filtradas[0] : null);
        if (opcion) elegir(opcion);
      }
    } else if (e.key === "Escape") {
      if (abierto) {
        e.preventDefault();
        e.stopPropagation();
        setAbierto(false);
        setBusqueda("");
      }
    } else if (e.key === "Tab") {
      setAbierto(false);
      setBusqueda("");
    }
  };

  return (
    <div className={`selector-buscable ${abierto ? "abierto" : ""} ${disabled ? "deshabilitado" : ""}`} ref={contenedorRef}>
      <div className="selector-control" onClick={abrir}>
        <Search size={16} className="selector-icono-busqueda" />
        <input
          id={id}
          type="text"
          role="combobox"
          aria-expanded={abierto}
          aria-controls={idLista}
          aria-autocomplete="list"
          autoComplete="off"
          disabled={disabled}
          // Cerrado: muestra lo seleccionado. Abierto: lo que el usuario escribe para buscar
          value={abierto ? busqueda : seleccionada?.label || ""}
          placeholder={abierto && seleccionada ? seleccionada.label : placeholder}
          onFocus={abrir}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setResaltado(-1);
            if (!abierto) setAbierto(true);
          }}
          onKeyDown={alPresionarTecla}
        />
        {permitirVaciar && seleccionada && !disabled && (
          <button type="button" className="selector-btn-vaciar" onClick={vaciar} aria-label="Quitar selección" title="Quitar selección">
            <X size={14} />
          </button>
        )}
        <ChevronDown size={16} className="selector-flecha" />
      </div>

      {abierto && (
        <div className="selector-panel">
        <ul className="selector-lista" id={idLista} role="listbox" ref={listaRef}>
          {permitirVaciar && !busqueda && (
            <li
              role="option"
              aria-selected={!seleccionada}
              className={`selector-opcion vacia ${!seleccionada ? "seleccionada" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => elegir({ value: "" })}
            >
              {textoVacio}
            </li>
          )}
          {filtradas.length === 0 ? (
            <li className="selector-sin-resultados">{textoSinResultados}</li>
          ) : (
            filtradas.map((o, i) => (
              <li
                key={o.value}
                data-indice={i}
                role="option"
                aria-selected={o.value === value}
                aria-disabled={o.disabled || undefined}
                className={[
                  "selector-opcion",
                  o.value === value ? "seleccionada" : "",
                  i === resaltado ? "resaltada" : "",
                  o.disabled ? "deshabilitada" : "",
                ].join(" ")}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => !o.disabled && setResaltado(i)}
                onClick={() => elegir(o)}
              >
                <span className="selector-opcion-label">{o.label}</span>
                {o.sublabel && <span className="selector-opcion-sublabel">{o.sublabel}</span>}
              </li>
            ))
          )}
        </ul>
        <div className="selector-contador">
          {busqueda
            ? `${filtradas.length} de ${opciones.length} ${opciones.length === 1 ? "resultado" : "resultados"}`
            : `${opciones.length} ${opciones.length === 1 ? "opción" : "opciones"} · escribe para filtrar`}
        </div>
        </div>
      )}
    </div>
  );
}

export default SelectorBuscable;
