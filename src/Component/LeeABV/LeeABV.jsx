import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import './LeeABV.css'; // Asegúrate de que este archivo CSS exista y esté en la ruta correcta

// Configuración de Supabase (asumiendo que usas Vite o un bundler similar para .env)
const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_APP_SUPABASE_ANON_KEY;

// Nombre de la tabla de la que quieres leer y descargar datos
const TABLE_NAME = 'RegistroBlockchain2'; // <--- ¡CAMBIA ESTO AL NOMBRE DE TU TABLA!

const SECRET_KEY = "Holamundo"; // <--- CLAVE SECRETA

let supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.error("Supabase URL or Anon Key is missing. Make sure to set them in your .env file.");
}

function SupabaseDataViewer() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false); // Inicialmente no cargamos hasta autenticar
  const [error, setError] = useState(null);
  const [columns, setColumns] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Nuevo estado
  const [inputKey, setInputKey] = useState(''); // Nuevo estado para el input de la clave
  const [authError, setAuthError] = useState(''); // Nuevo estado para errores de autenticación

  // useEffect ahora depende de isAuthenticated para cargar datos
  useEffect(() => {
    if (!isAuthenticated) return; // No cargar datos si no está autenticado

    if (!supabase) {
      setError("Supabase client no está inicializado. Verifica las variables de entorno.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: fetchedData, error: fetchError } = await supabase
          .from(TABLE_NAME)
          .select('*');

        if (fetchError) {
          throw fetchError;
        }

        if (fetchedData && fetchedData.length > 0) {
          setData(fetchedData);
          setColumns(Object.keys(fetchedData[0]));
        } else {
          setData([]);
          setColumns([]);
        }
      } catch (err) {
        console.error("Error fetching data from Supabase:", err);
        setError(err.message || "Error al cargar los datos.");
        setData([]);
        setColumns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]); // Se ejecuta cuando isAuthenticated cambia

  const handleKeySubmit = (event) => {
    event.preventDefault();
    setAuthError(''); // Limpiar errores previos
    if (inputKey === SECRET_KEY) {
      setIsAuthenticated(true);
    } else {
      setAuthError('Clave incorrecta. Inténtalo de nuevo.');
      setInputKey(''); // Limpiar el campo de clave
    }
  };

  const handleDownloadExcel = () => {
    // ... (sin cambios en esta función)
    if (data.length === 0) {
      alert("No hay datos para descargar.");
      return;
    }
    const dataForSheet = data.map(row => {
      const orderedRow = {};
      columns.forEach(colName => {
        if (typeof row[colName] === 'object' && row[colName] !== null) {
          orderedRow[colName] = JSON.stringify(row[colName]);
        } else {
          orderedRow[colName] = row[colName];
        }
      });
      return orderedRow;
    });
    const worksheet = XLSX.utils.json_to_sheet(dataForSheet, { header: columns });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DatosSupabase");
    XLSX.writeFile(workbook, `${TABLE_NAME}_data.xlsx`);
  };

  // Renderizado del formulario de clave si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="data-viewer-container key-prompt-container">
        <div className="data-viewer-header">
          <h2>Acceso Restringido</h2>
        </div>
        <form onSubmit={handleKeySubmit} className="key-form">
          <p>Por favor, ingresa la clave para acceder a los datos:</p>
          <input
            type="password" // Usar password para ocultar la clave
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="key-input"
            placeholder="Ingresa la clave"
            required
          />
          <button type="submit" className="key-submit-button">
            Acceder
          </button>
          {authError && <p className="auth-error-message">{authError}</p>}
        </form>
      </div>
    );
  }

  // Renderizado del visor de datos si está autenticado
  // (Mismo código que antes para esta parte)
  if (!supabase && !loading) {
     return <div className="error-message">Error: Supabase client no está inicializado. Revisa la consola y tus variables de entorno.</div>;
  }

  if (loading) {
    return <p className="loading-message">Cargando datos...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  return (
    <div className="data-viewer-container">
      <div className="data-viewer-header">
        <h2>Datos de la Tabla: {TABLE_NAME}</h2>
      </div>
      {data.length > 0 ? (
        <>
          <button
            onClick={handleDownloadExcel}
            className="download-button"
          >
            Descargar como Excel (.xlsx)
          </button>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map(colName => (
                    <th key={colName}>
                      {colName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, rowIndex) => (
                  <tr key={row.id || `row-${rowIndex}`}>
                    {columns.map(colName => (
                      <td key={`${row.id || `row-${rowIndex}`}-${colName}`}>
                        {typeof row[colName] === 'object' && row[colName] !== null
                          ? JSON.stringify(row[colName])
                          : row[colName] === null || row[colName] === undefined ? '' : String(row[colName])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="no-data-message">No se encontraron datos en la tabla "{TABLE_NAME}".</p>
      )}
    </div>
  );
}

export default SupabaseDataViewer;