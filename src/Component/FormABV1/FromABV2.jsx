// src/BlockchainRegistrationForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import './FormABV1.css'; // Asegúrate de que este archivo CSS exista y tenga los estilos necesarios
// import { submitFormDataToSingleTable } from './AirtableIntegration'; // Ya no se necesita
import { createClient } from '@supabase/supabase-js'; // Importar Supabase

import logoA from './LogoABV.png';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_APP_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Make sure to set them in your .env file.");
  // Podrías lanzar un error o mostrar un mensaje al usuario aquí
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BlockchainRegistrationForm = () => {
    const [numParticipants, setNumParticipants] = useState(1);
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
    
    const [billingData, setBillingData] = useState({
      RIFCedulaFacturacion: '',
      DenominacionFiscalFacturacion: '',
      DireccionFiscalFacturacion: '',
      TelefonoFacturacion: '',
      SectorOrganizacionFacturacion: ''
    });

    const initialParticipantState = {
      NacionalidadParticipante: 'V',
      CedulaParticipante: '',
      TipoTicketParticipante: 'Venta',
      IDValidadorParticipante: '',
      NombreParticipante: '',
      ApellidoParticipante: '',
      TelefonoCelularParticipante: '',
      TelefonoOficinaParticipante: '',
      EmailParticipante: '',
      NombreOrganizacionParticipante: '',
      RIFOrganizacionParticipante: '',
      CargoOrganizacionParticipante: '',
      SectorOrganizacionParticipante: ''
    };

    const [participants, setParticipants] = useState([{ ...initialParticipantState }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState('');

    const sectores = [
        // Sector Financiero y Relacionados
        'Banca Privada',
        'Banca Pública',
        'Seguros',
        'Bolsa de Valores',
        'Fintech',
        'Criptomonedas / Activos Digitales',
        'Microfinanzas',
        'Casas de Cambio',
      
        // Sector Público y Gubernamental
        'Gobierno / Sector Público', // General
        'Administración Tributaria',
        'Registros Públicos (Propiedad, Mercantil)',
        'Notarías',
        'Defensa y Seguridad Nacional',
      
        // Salud y Bienestar
        'Salud / Servicios Médicos',
        'Industria Farmacéutica',
        'Biotecnología',
        'Investigación Médica',
      
        // Industria y Manufactura
        'Industrial / Manufactura',
        'Automotriz',
        'Alimentos y Bebidas',
        'Textil y Confección',
        'Construcción',
      
        // Tecnología y Comunicaciones
        'Tecnología de la Información (TI)',
        'Desarrollo de Software',
        'Telecomunicaciones',
        'Ciberseguridad',
        'Inteligencia Artificial',
        'Internet de las Cosas (IoT)',
      
        // Educación e Investigación
        'Educación' ,
        'Investigación y Desarrollo (I+D)',
      
        // Comercio y Servicios
        'Comercio Minorista (Retail)',
        'Comercio Mayorista',
        'Logística y Cadena de Suministro',
        'Transporte',
        'Turismo y Hotelería',
        'Entretenimiento y Medios',
        'Consultoría (Legal, Financiera, Tecnológica)',
        'Servicios',
        'Ingenieria',
      
        // Recursos Naturales y Energía
        'Energía (Petróleo, Gas, Renovables)',
        'Minería',
        'Agricultura / Agroindustria',
      
        // Otros
        'Organizaciones No Gubernamentales (ONG)',
        'Fundaciones',
        'Legal / Despachos de Abogados',
        'Marketing y Publicidad',
        'Inmobiliario',
        'Otros' // Siempre es bueno tener una opción genérica
      ];

    useEffect(() => {
      const checkIsMobile = () => {
        if (typeof window !== 'undefined') {
            setIsMobile(window.innerWidth <= 768);
        }
      };
      
      if (typeof window !== 'undefined') {
          checkIsMobile();
          window.addEventListener('resize', checkIsMobile);
      }
      
      return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', checkIsMobile);
        }
      };
    }, []);

    useEffect(() => {
      setParticipants(currentParticipants => {
        const newCount = parseInt(numParticipants, 10) || 1;
        const currentCount = currentParticipants.length;
        if (newCount === currentCount) {
          return currentParticipants;
        }
        if (newCount > currentCount) {
          const additionalParticipants = Array(newCount - currentCount).fill(null).map(() => ({ ...initialParticipantState }));
          return [...currentParticipants, ...additionalParticipants];
        }
        return currentParticipants.slice(0, newCount);
      });
    }, [numParticipants, initialParticipantState]); // initialParticipantState aquí puede causar re-renders si no está memoizado, pero para este caso es aceptable.

    const handleNumParticipantsChange = (e) => {
      let count = parseInt(e.target.value, 10);
      if (isNaN(count) || count < 1) {
        count = 1;
      }
      if (count > 10) {
          count = 10;
      }
      setNumParticipants(count);
    };

    const handleBillingChange = (field, value) => {
      let processedValue = value;
      if (field === 'TelefonoFacturacion') {
          processedValue = value.replace(/[^\d+\-().\s]/g, '');
      } else if (field === 'RIFCedulaFacturacion') {
          processedValue = value.toUpperCase().replace(/[^VEJPG0-9-]/g, '').slice(0,12);
      }
      setBillingData(prev => ({ ...prev, [field]: processedValue }));
    };

    const handleParticipantChange = (index, field, value) => {
      const updatedParticipants = [...participants];
      let processedValue = value;

      if (field === 'CedulaParticipante') {
        processedValue = value.replace(/\D/g, '').slice(0, 8);
      } else if (field === 'TelefonoCelularParticipante' || field === 'TelefonoOficinaParticipante') {
          processedValue = value.replace(/[^\d+\-().\s]/g, ''); 
      } else if (field === 'RIFOrganizacionParticipante') {
          processedValue = value.toUpperCase().replace(/[^VEJPG0-9-]/g, '').slice(0,12);
      } else if (field === 'IDValidadorParticipante') {
          processedValue = value.toUpperCase();
      }

      updatedParticipants[index] = { ...updatedParticipants[index], [field]: processedValue };
      setParticipants(updatedParticipants);
    };

    const handleParticipantCedulaBlur = (index) => {
      const participant = participants[index];
      let cedulaValue = participant.CedulaParticipante.replace(/\D/g, '').slice(0, 8);
      if (cedulaValue.length > 0 && cedulaValue.length < 8) {
        cedulaValue = cedulaValue.padStart(8, '0');
      }
      const updatedParticipants = [...participants];
      updatedParticipants[index] = { ...updatedParticipants[index], CedulaParticipante: cedulaValue };
      setParticipants(updatedParticipants);
    };

    const handleSubmit = async (e) => {
      e.preventDefault(); 
      setSubmissionStatus('');

      if (!supabaseUrl || !supabaseAnonKey) {
        const message = "Error: La configuración de Supabase no está completa. Contacte al administrador.";
        setSubmissionStatus(message);
        alert(message);
        return;
      }

      // --- Validación (sin cambios) ---
      const requiredBillingFields = [
          { key: 'RIFCedulaFacturacion', label: 'RIF o Cédula (Facturación)'}, 
          { key: 'DenominacionFiscalFacturacion', label: 'Denominación Fiscal'}, 
          { key: 'DireccionFiscalFacturacion', label: 'Dirección Fiscal'}, 
          { key: 'TelefonoFacturacion', label: 'Teléfono (Facturación)'}, 
          { key: 'SectorOrganizacionFacturacion', label: 'Sector de la Organización (Facturación)'}
      ];
      for (const field of requiredBillingFields) {
          if (!billingData[field.key] || billingData[field.key].trim() === '') {
              const message = `Por favor, complete el campo de facturación: ${field.label}.`;
              setSubmissionStatus(`Error: ${message}`);
              alert(message);
              const inputElement = document.getElementById(field.key); 
              if (inputElement) inputElement.focus();
              return;
          }
      }

      for (let i = 0; i < participants.length; i++) {
          const p = participants[i];
          const participantNumber = i + 1;
          const requiredParticipantFields = [
              { key: 'NacionalidadParticipante', label: 'Nacionalidad'},
              { key: 'CedulaParticipante', label: 'Cédula'},
              { key: 'TipoTicketParticipante', label: 'Tipo de Ticket'},
              { key: 'NombreParticipante', label: 'Nombre'},
              { key: 'ApellidoParticipante', label: 'Apellido'},
              { key: 'TelefonoCelularParticipante', label: 'Teléfono Celular'},
              { key: 'EmailParticipante', label: 'Correo Electrónico'},
              { key: 'NombreOrganizacionParticipante', label: 'Nombre de la Organización'},
              { key: 'RIFOrganizacionParticipante', label: 'RIF de la Organización'},
              { key: 'CargoOrganizacionParticipante', label: 'Cargo en la Organización'},
              { key: 'SectorOrganizacionParticipante', label: 'Sector de la Organización'}
          ];
          
          for (const field of requiredParticipantFields) {
              if (!p[field.key] || (typeof p[field.key] === 'string' && p[field.key].trim() === '')) {
                  const message = `Por favor, complete el campo '${field.label}' para el participante ${participantNumber}.`;
                  setSubmissionStatus(`Error: ${message}`);
                  alert(message);
                  const inputElement = document.querySelector(`[name="participant-${i}-${field.key}"]`);
                  if (inputElement) inputElement.focus();
                  return;
              }
          }
          if (p.CedulaParticipante.length !== 8) {
              const message = `La cédula del participante ${participantNumber} debe tener 8 dígitos.`;
              setSubmissionStatus(`Error: ${message}`);
              alert(message);
              const cedulaInput = document.querySelector(`[name="participant-${i}-CedulaParticipante"]`);
              if (cedulaInput) cedulaInput.focus();
              return;
          }
          if (!/\S+@\S+\.\S+/.test(p.EmailParticipante)) {
               const message = `El correo electrónico del participante ${participantNumber} no es válido.`;
               setSubmissionStatus(`Error: ${message}`);
               alert(message);
               const emailInput = document.querySelector(`[name="participant-${i}-EmailParticipante"]`);
               if (emailInput) emailInput.focus();
              return;
          }
      }
      // --- Fin Validación ---

      setIsSubmitting(true);

      try {
        // Preparamos los datos para Supabase
        // Cada participante se insertará como una fila, incluyendo los datos de facturación
        const recordsToInsert = participants.map(participant => ({
            ...billingData, // Datos de facturación
            ...participant, // Datos del participante
            // Puedes añadir campos adicionales si es necesario, ej:
            // fecha_inscripcion: new Date().toISOString(), 
        }));

        // El nombre de la tabla debe coincidir con el de tu tabla en Supabase
        const { data, error } = await supabase
          .from('RegistroBlockchain2') // NOMBRE DE TU TABLA
          .insert(recordsToInsert)
          .select(); // Opcional: .select() para obtener los datos insertados de vuelta

        if (error) {
          console.error('Error de Supabase:', error);
          throw error; // Esto será atrapado por el bloque catch
        }

        setSubmissionStatus('¡Inscripción enviada exitosamente a Supabase!');
        console.log('Datos del formulario enviados a Supabase:', data); // 'data' contiene los registros insertados si usaste .select()
        alert('Formulario enviado y registrado en Supabase correctamente.');
        
        // Opcional: resetear el formulario
        // setNumParticipants(1);
        // setBillingData({ 
        //   RIFCedulaFacturacion: '', DenominacionFiscalFacturacion: '', DireccionFiscalFacturacion: '', 
        //   TelefonoFacturacion: '', SectorOrganizacionFacturacion: '' 
        // });
        // setParticipants([{ ...initialParticipantState }]);

      } catch (error) {
        console.error('Error al enviar el formulario a Supabase:', error);
        // El error de Supabase tiene una propiedad `message` más útil
        const errorMessage = error.message || 'Error desconocido al procesar la inscripción.';
        setSubmissionStatus(`Error al enviar la inscripción: ${errorMessage}. Por favor, intente de nuevo.`);
        alert(`Error al enviar la inscripción: ${errorMessage}. Por favor, intente de nuevo.`);
      } finally {
        setIsSubmitting(false);
      }
    };

    const tableRef = useRef(null);

    // El resto del componente (useEffect para tableRef, participantTableHeaders, renderParticipantCards, renderParticipantsTable, y el JSX del return)
    // puede permanecer igual, ya que solo maneja la UI y la lógica local del estado.
    // ... (pegar aquí el resto del código SIN CAMBIOS desde `tableRef` hasta el final del componente)
    // ...
    useEffect(() => {
      if (isMobile || typeof document === 'undefined') return; 
      
      const table = tableRef.current;
      if (!table) return;

      const cols = Array.from(table.querySelectorAll('th'));
      const activeResizers = [];

      cols.forEach((col) => {
        const resizer = col.querySelector('.resize-handle');
        if (!resizer) return;

        let x = 0;
        let w = 0;

        const mouseDownHandler = (e) => {
          e.preventDefault();
          x = e.clientX;
          w = col.offsetWidth;
          document.addEventListener('mousemove', mouseMoveHandler);
          document.addEventListener('mouseup', mouseUpHandler);
          resizer.classList.add('resizing');
        };

        const mouseMoveHandler = (e) => {
          const dx = e.clientX - x;
          const newWidth = w + dx;
          if (newWidth > 40) { 
              col.style.width = `${newWidth}px`;
          }
        };

        const mouseUpHandler = () => {
          document.removeEventListener('mousemove', mouseMoveHandler);
          document.removeEventListener('mouseup', mouseUpHandler);
          resizer.classList.remove('resizing');
        };

        resizer.addEventListener('mousedown', mouseDownHandler);
        activeResizers.push({ resizer, handler: mouseDownHandler }); 
      });

      return () => { 
        activeResizers.forEach(({ resizer, handler }) => {
          if (resizer) { 
            resizer.removeEventListener('mousedown', handler);
          }
        });
      };
    }, [participants.length, isMobile]);

    const participantTableHeaders = [
      { label: '#', width: '45px', isResizable: false },
      { label: 'Nacionalidad*', width: '110px' }, 
      { label: 'Cédula*', width: '110px' }, 
      { label: 'Tipo Ticket*', width: '120px' }, 
      { label: 'ID Validador', width: '130px' }, 
      { label: 'Nombre*', width: '180px' },  
      { label: 'Apellido*', width: '180px' },  
      { label: 'Tel. Celular*', width: '140px' }, 
      { label: 'Tel. Oficina', width: '140px' }, 
      { label: 'Email*', width: '240px' },       
      { label: 'Organización*', width: '220px' },  
      { label: 'RIF*', width: '130px' }, 
      { label: 'Cargo en la empresa*', width: '200px' },  
      { label: 'Sector de la empresa*', width: '190px' }   
    ];

    const renderParticipantCards = () => {
      return (
        <div className="participants-cards">
          {participants.map((participant, index) => (
            <div key={`card-${index}`} className="participant-card">
              <div className="participant-card-header">
                Participante #{index + 1}
              </div>
              <div className="participant-card-grid">
                <div className="participant-field">
                  <label htmlFor={`participant-${index}-NacionalidadParticipante-card`}>Nacionalidad<span style={{color: 'red'}}>*</span></label>
                  <select
                    id={`participant-${index}-NacionalidadParticipante-card`}
                    name={`participant-${index}-NacionalidadParticipante`} 
                    value={participant.NacionalidadParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'NacionalidadParticipante', e.target.value)} 
                    className="form-select"
                    required
                  >
                    <option value="V">V</option>
                    <option value="E">E</option>
                  </select>
                </div>
                
                <div className="participant-field">
                  <label htmlFor={`participant-${index}-CedulaParticipante-card`}>Cédula<span style={{color: 'red'}}>*</span></label>
                  <input
                    id={`participant-${index}-CedulaParticipante-card`}
                    name={`participant-${index}-CedulaParticipante`} 
                    type="text"
                    value={participant.CedulaParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'CedulaParticipante', e.target.value)} 
                    onBlur={() => handleParticipantCedulaBlur(index)}
                    className="form-input"
                    placeholder="Ej: 12345678"
                    maxLength="8"
                    required
                  />
                </div>
  
                <div className="participant-field">
                  <label htmlFor={`participant-${index}-TipoTicketParticipante-card`}>Tipo de Ticket<span style={{color: 'red'}}>*</span></label>
                  <select
                    id={`participant-${index}-TipoTicketParticipante-card`}
                    name={`participant-${index}-TipoTicketParticipante`} 
                    value={participant.TipoTicketParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'TipoTicketParticipante', e.target.value)} 
                    className="form-select"
                    required
                  >
                    <option value="Venta">Venta</option>
                    <option value="Cortesia">Cortesía</option>
                  </select>
                </div>
  
                <div className="participant-field">
                  <label htmlFor={`participant-${index}-IDValidadorParticipante-card`}>ID Validador</label>
                  <input
                    id={`participant-${index}-IDValidadorParticipante-card`}
                    name={`participant-${index}-IDValidadorParticipante`} 
                    type="text"
                    value={participant.IDValidadorParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'IDValidadorParticipante', e.target.value)} 
                    className="form-input"
                    placeholder="Cortesia"
                  />
                </div>
  
                <div className="participant-field">
                  <label htmlFor={`participant-${index}-NombreParticipante-card`}>Nombre<span style={{color: 'red'}}>*</span></label>
                  <input
                    id={`participant-${index}-NombreParticipante-card`}
                    name={`participant-${index}-NombreParticipante`} 
                    type="text"
                    value={participant.NombreParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'NombreParticipante', e.target.value)} 
                    className="form-input"
                    required
                  />
                </div>
  
                <div className="participant-field">
                  <label htmlFor={`participant-${index}-ApellidoParticipante-card`}>Apellido<span style={{color: 'red'}}>*</span></label>
                  <input
                    id={`participant-${index}-ApellidoParticipante-card`}
                    name={`participant-${index}-ApellidoParticipante`} 
                    type="text"
                    value={participant.ApellidoParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'ApellidoParticipante', e.target.value)} 
                    className="form-input"
                    required
                  />
                </div>
  
                <div className="participant-field">
                  <label htmlFor={`participant-${index}-TelefonoCelularParticipante-card`}>Teléfono Celular<span style={{color: 'red'}}>*</span></label>
                  <input
                    id={`participant-${index}-TelefonoCelularParticipante-card`}
                    name={`participant-${index}-TelefonoCelularParticipante`} 
                    type="tel"
                    value={participant.TelefonoCelularParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'TelefonoCelularParticipante', e.target.value)} 
                    className="form-input"
                    placeholder="Ej: 04XX-XXXXXXX"
                    required
                  />
                </div>
  
                <div className="participant-field">
                  <label htmlFor={`participant-${index}-TelefonoOficinaParticipante-card`}>Teléfono Oficina</label>
                  <input
                    id={`participant-${index}-TelefonoOficinaParticipante-card`}
                    name={`participant-${index}-TelefonoOficinaParticipante`} 
                    type="tel"
                    value={participant.TelefonoOficinaParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'TelefonoOficinaParticipante', e.target.value)} 
                    className="form-input"
                    placeholder="Ej: 02XX-XXXXXXX"
                  />
                </div>
  
                <div className="participant-field full-width">
                  <label htmlFor={`participant-${index}-EmailParticipante-card`}>Email<span style={{color: 'red'}}>*</span></label>
                  <input
                    id={`participant-${index}-EmailParticipante-card`}
                    name={`participant-${index}-EmailParticipante`} 
                    type="email"
                    value={participant.EmailParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'EmailParticipante', e.target.value)} 
                    className="form-input"
                    placeholder="usuario@dominio.com"
                    required
                  />
                </div>
  
                <div className="participant-field full-width">
                  <label htmlFor={`participant-${index}-NombreOrganizacionParticipante-card`}>Nombre de la Organización<span style={{color: 'red'}}>*</span></label>
                  <input
                    id={`participant-${index}-NombreOrganizacionParticipante-card`}
                    name={`participant-${index}-NombreOrganizacionParticipante`} 
                    type="text"
                    value={participant.NombreOrganizacionParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'NombreOrganizacionParticipante', e.target.value)} 
                    className="form-input"
                    required
                  />
                </div>
  
                <div className="participant-field">
                  <label htmlFor={`participant-${index}-RIFOrganizacionParticipante-card`}>RIF de la Organización<span style={{color: 'red'}}>*</span></label>
                  <input
                    id={`participant-${index}-RIFOrganizacionParticipante-card`}
                    name={`participant-${index}-RIFOrganizacionParticipante`} 
                    type="text"
                    value={participant.RIFOrganizacionParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'RIFOrganizacionParticipante', e.target.value)} 
                    className="form-input"
                    placeholder="Ej: J-123456789"
                    required
                  />
                </div>
  
                <div className="participant-field">
                  <label htmlFor={`participant-${index}-CargoOrganizacionParticipante-card`}>Cargo en la Organización<span style={{color: 'red'}}>*</span></label>
                  <input
                    id={`participant-${index}-CargoOrganizacionParticipante-card`}
                    name={`participant-${index}-CargoOrganizacionParticipante`} 
                    type="text"
                    value={participant.CargoOrganizacionParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'CargoOrganizacionParticipante', e.target.value)} 
                    className="form-input"
                    required
                  />
                </div>
  
                <div className="participant-field">
                  <label htmlFor={`participant-${index}-SectorOrganizacionParticipante-card`}>Sector de la Organización<span style={{color: 'red'}}>*</span></label>
                  <select
                    id={`participant-${index}-SectorOrganizacionParticipante-card`}
                    name={`participant-${index}-SectorOrganizacionParticipante`} 
                    value={participant.SectorOrganizacionParticipante} 
                    onChange={(e) => handleParticipantChange(index, 'SectorOrganizacionParticipante', e.target.value)} 
                    className="form-select"
                    required
                  >
                    <option value="">Seleccione</option>
                    {sectores.map(sector => (
                      <option key={`${index}-card-${sector}`} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };
  
    const renderParticipantsTable = () => {
      return (
        <div className="table-wrapper">
          <table className="participants-table" ref={tableRef}>
            <thead>
              <tr>
                {participantTableHeaders.map((headerInfo, idx) => (
                  <th 
                    key={`th-${idx}`} 
                    style={{ 
                        position: 'relative', 
                        whiteSpace: 'nowrap',
                        width: headerInfo.width 
                    }}
                  >
                    {headerInfo.label.endsWith('*') ? <>{headerInfo.label.slice(0,-1)}<span style={{color: 'red'}}>*</span></> : headerInfo.label}
                    {(headerInfo.isResizable !== false && idx > 0) && <div className="resize-handle"></div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {participants.map((participant, index) => (
                <tr key={`tr-${index}`}>
                  <td>{index + 1}</td>
                  <td>
                    <select
                      name={`participant-${index}-NacionalidadParticipante`} 
                      aria-label={`Nacionalidad participante ${index + 1}`}
                      value={participant.NacionalidadParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'NacionalidadParticipante', e.target.value)} 
                      className="form-select compact"
                      required
                    >
                      <option value="V">V</option>
                      <option value="E">E</option>
                    </select>
                  </td>
                  <td>
                    <input
                      name={`participant-${index}-CedulaParticipante`} 
                      aria-label={`Cédula participante ${index + 1}`}
                      type="text"
                      value={participant.CedulaParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'CedulaParticipante', e.target.value)} 
                      onBlur={() => handleParticipantCedulaBlur(index)}
                      className="form-input compact"
                      placeholder="Ej: 12345678"
                      maxLength="8"
                      required
                    />
                  </td>
                  <td>
                    <select
                      name={`participant-${index}-TipoTicketParticipante`} 
                      aria-label={`Tipo de ticket participante ${index + 1}`}
                      value={participant.TipoTicketParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'TipoTicketParticipante', e.target.value)} 
                      className="form-select compact"
                      required
                    >
                      <option value="Venta">Venta</option>
                      <option value="Cortesia">Cortesía</option>
                    </select>
                  </td>
                  <td>
                    <input
                      name={`participant-${index}-IDValidadorParticipante`} 
                      aria-label={`ID Validador participante ${index + 1}`}
                      type="text"
                      value={participant.IDValidadorParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'IDValidadorParticipante', e.target.value)} 
                      className="form-input compact"
                     
                    />
                  </td>
                  <td>
                    <input
                      name={`participant-${index}-NombreParticipante`} 
                      aria-label={`Nombre participante ${index + 1}`}
                      type="text"
                      value={participant.NombreParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'NombreParticipante', e.target.value)} 
                      className="form-input compact"
                      required
                    />
                  </td>
                  <td>
                    <input
                      name={`participant-${index}-ApellidoParticipante`} 
                      aria-label={`Apellido participante ${index + 1}`}
                      type="text"
                      value={participant.ApellidoParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'ApellidoParticipante', e.target.value)} 
                      className="form-input compact"
                      required
                    />
                  </td>
                  <td>
                    <input
                      name={`participant-${index}-TelefonoCelularParticipante`} 
                      aria-label={`Teléfono celular participante ${index + 1}`}
                      type="tel"
                      value={participant.TelefonoCelularParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'TelefonoCelularParticipante', e.target.value)} 
                      className="form-input compact"
                      placeholder="Ej: 04XX-XXXXXXX"
                      required
                    />
                  </td>
                  <td>
                    <input
                      name={`participant-${index}-TelefonoOficinaParticipante`} 
                      aria-label={`Teléfono oficina participante ${index + 1}`}
                      type="tel"
                      value={participant.TelefonoOficinaParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'TelefonoOficinaParticipante', e.target.value)} 
                      className="form-input compact"
                      placeholder="Ej: 02XX-XXXXXXX"
                    />
                  </td>
                  <td>
                    <input
                      name={`participant-${index}-EmailParticipante`} 
                      aria-label={`Email participante ${index + 1}`}
                      type="email"
                      value={participant.EmailParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'EmailParticipante', e.target.value)} 
                      className="form-input compact"
                      placeholder="usuario@dominio.com"
                      required
                    />
                  </td>
                  <td>
                    <input
                      name={`participant-${index}-NombreOrganizacionParticipante`} 
                      aria-label={`Nombre organización participante ${index + 1}`}
                      type="text"
                      value={participant.NombreOrganizacionParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'NombreOrganizacionParticipante', e.target.value)} 
                      className="form-input compact"
                      required
                    />
                  </td>
                  <td>
                    <input
                      name={`participant-${index}-RIFOrganizacionParticipante`} 
                      aria-label={`RIF organización participante ${index + 1}`}
                      type="text"
                      value={participant.RIFOrganizacionParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'RIFOrganizacionParticipante', e.target.value)} 
                      className="form-input compact"
                      placeholder="Ej: J-123456789"
                      required
                    />
                  </td>
                  <td>
                    <input
                      name={`participant-${index}-CargoOrganizacionParticipante`} 
                      aria-label={`Cargo organización participante ${index + 1}`}
                      type="text"
                      value={participant.CargoOrganizacionParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'CargoOrganizacionParticipante', e.target.value)} 
                      className="form-input compact"
                      required
                    />
                  </td>
                  <td>
                    <select
                      name={`participant-${index}-SectorOrganizacionParticipante`} 
                      aria-label={`Sector organización participante ${index + 1}`}
                      value={participant.SectorOrganizacionParticipante} 
                      onChange={(e) => handleParticipantChange(index, 'SectorOrganizacionParticipante', e.target.value)} 
                      className="form-select compact"
                      required
                    >
                      <option value="">Seleccione</option>
                      {sectores.map(sector => (
                        <option key={`${index}-table-${sector}`} value={sector}>{sector}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };
  
    return (
      <div className="container">
        <div className="form-wrapper">
          <div className="header-card">
          <div className="logo-container">
            <img src={logoA} className="App-logo" alt="logo" />
          </div>
            <h1>Asociación Bancaria de Venezuela</h1>
            <h2>Formulario para Inscripción sobre Blockchain</h2>
          </div>
  
          <form onSubmit={handleSubmit} className="form-content">
            <div className="section-card">
              <div className="section-header">
                  <div className="section-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                  <h3 className="section-title">Número de Participantes</h3>
              </div>
              <div className="form-group" style={{padding: '20px 30px'}}>
                <label htmlFor="numParticipants">Indique el número de participantes a inscribir:<span style={{color: 'red'}}>*</span></label>
                <input
                  type="number"
                  id="numParticipants"
                  name="numParticipants"
                  className="form-input"
                  value={numParticipants}
                  onChange={handleNumParticipantsChange}
                  min="1"
                  max="50" 
                  required
                  aria-describedby="numParticipantsHelp"
                />
                <small id="numParticipantsHelp" className="form-text text-muted">Mínimo 1, máximo 10 participantes.</small>
              </div>
            </div>
  
            <div className="section-card">
              <div className="section-header">
                  <div className="section-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                  </div>
                  <h3 className="section-title">Datos de Facturación</h3>
              </div>
              <div className="billing-fields">
                <div className="form-group">
                  <label htmlFor="RIFCedulaFacturacion">RIF o Cédula:<span style={{color: 'red'}}>*</span></label>
                  <input type="text" id="RIFCedulaFacturacion" name="RIFCedulaFacturacion" className="form-input" value={billingData.RIFCedulaFacturacion} onChange={(e) => handleBillingChange('RIFCedulaFacturacion', e.target.value)} placeholder="Ej: V-12345678, J-123456789" required />
                </div>
                <div className="form-group">
                  <label htmlFor="DenominacionFiscalFacturacion">Denominación Fiscal:<span style={{color: 'red'}}>*</span></label>
                  <input type="text" id="DenominacionFiscalFacturacion" name="DenominacionFiscalFacturacion" className="form-input" value={billingData.DenominacionFiscalFacturacion} onChange={(e) => handleBillingChange('DenominacionFiscalFacturacion', e.target.value)} required />
                </div>
                <div className="form-group full-width">
                  <label htmlFor="DireccionFiscalFacturacion">Dirección Fiscal:<span style={{color: 'red'}}>*</span></label>
                  <input type="text" id="DireccionFiscalFacturacion" name="DireccionFiscalFacturacion" className="form-input" value={billingData.DireccionFiscalFacturacion} onChange={(e) => handleBillingChange('DireccionFiscalFacturacion', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="TelefonoFacturacion">Teléfono:<span style={{color: 'red'}}>*</span></label>
                  <input type="tel" id="TelefonoFacturacion" name="TelefonoFacturacion" className="form-input" value={billingData.TelefonoFacturacion} onChange={(e) => handleBillingChange('TelefonoFacturacion', e.target.value)} placeholder="Ej: 0212-5555555" required />
                </div>
                <div className="form-group">
                  <label htmlFor="SectorOrganizacionFacturacion">Sector de la Organización:<span style={{color: 'red'}}>*</span></label>
                  <select 
                      id="SectorOrganizacionFacturacion" 
                      name="SectorOrganizacionFacturacion"
                      className="form-select" 
                      value={billingData.SectorOrganizacionFacturacion} 
                      onChange={(e) => handleBillingChange('SectorOrganizacionFacturacion', e.target.value)} 
                      required
                  >
                    <option value="">Seleccione un sector</option>
                    {sectores.map(sector => (
                      <option key={`billing-${sector}`} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <div className="section-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                </div>
                <h3 className="section-title">Datos de los Participantes</h3>
              </div>
              {isMobile ? renderParticipantCards() : renderParticipantsTable()}
            </div>

            {submissionStatus && (
              <div className={`submission-status ${submissionStatus.startsWith('Error') ? 'error' : 'success'}`}>
                {submissionStatus}
              </div>
            )}
            <div className="submit-container">
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Inscripción'}
              </button>
            </div>
          </form>

          <div className="footer">
            <p>
              Los campos marcados con <span style={{color: 'red'}}>*</span> son obligatorios
            </p>
          </div>
        </div>
      </div>
    );
};

export default BlockchainRegistrationForm;
