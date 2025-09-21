// Estado persistido de tareas y responsables
type TaskState = {
  responsables: { name: string; color: string }[];
  startDate: string;
  endDate: string;
  status: string;
};

// Cargamos estado de localStorage o inicializamos
const state: { tasks?: { [id: string]: TaskState } } = JSON.parse(localStorage.getItem('mbotAppState') || '{}');

let data: any;

// Inicialización principal
async function init() {
  // Carga de datos
  const response = await fetch('./mbot_project.json');
  data = await response.json();

  // Rellenamos versión
  const verEl = document.getElementById('version');
  if (verEl) {
    verEl.textContent = data.version ? `Versión ${data.version}` : 'Versión 1.0';
  }

  // Renderizado de chips (bases didácticas)
  renderTags();
  // Render de cada sección
  renderResumen();
  renderFases();
  renderEquipo();
  renderTrayecto();
  renderChecklist();
  renderCalendar();
  renderDiagrama();

  // Configura navegación
  const navButtons = document.querySelectorAll('nav button');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showSection(btn.getAttribute('data-view') || 'resumen');
    });
  });

  // Mostrar vista inicial
  showSection('resumen');
}

function renderTags() {
  const container = document.getElementById('tag-container');
  if (!container) return;
  container.innerHTML = '';
  const bases = data.estructura_general?.fundamentos_estratégicos?.bases_didácticas || [];
  bases.forEach((tag: string) => {
    const span = document.createElement('span');
    span.className = 'chip';
    span.textContent = tag;
    container.appendChild(span);
  });
}

function showSection(viewId: string) {
  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.remove('active');
  });
  const section = document.getElementById('view-' + viewId);
  if (section) section.classList.add('active');
}

function renderResumen() {
  const cont = document.getElementById('view-resumen');
  if (!cont) return;
  cont.innerHTML = '';
  // Fundamentos estratégicos
  const sec1 = document.createElement('div');
  sec1.className = 'section';
  const h2 = document.createElement('h2');
  h2.textContent = 'Fundamentos estratégicos';
  sec1.appendChild(h2);
  const enfoque = data.estructura_general?.fundamentos_estratégicos?.enfoque || '';
  const pEnfoque = document.createElement('p');
  pEnfoque.innerHTML = `<strong>Enfoque:</strong> ${enfoque}`;
  sec1.appendChild(pEnfoque);
  const h3c = document.createElement('h3');
  h3c.textContent = 'Competencias a desarrollar';
  sec1.appendChild(h3c);
  const ulC = document.createElement('ul');
  (data.estructura_general?.fundamentos_estratégicos?.competencias_a_desarrollar || []).forEach((c: string) => {
    const li = document.createElement('li');
    li.textContent = c;
    ulC.appendChild(li);
  });
  sec1.appendChild(ulC);
  cont.appendChild(sec1);

  // Búsqueda 
  const sec2 = document.createElement('div');
  sec2.className = 'section';
  const h2q = document.createElement('h2');
  h2q.textContent = 'Búsqueda rápida en fases';
  sec2.appendChild(h2q);
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = "Busca acciones o requerimientos (p.ej., 'webinar', 'insignias')";
  input.className = 'filter-input';
  sec2.appendChild(input);
  const ol = document.createElement('ol');
  ol.className = 'quick-search';
  sec2.appendChild(ol);

  const entries: { text: string; id: string | null }[] = [];
  data.fases_implementacion?.forEach((fase: any, i: number) => {
    fase.acciones.forEach((accion: string, j: number) => {
      entries.push({ text: `${i + 1}. ${fase.fase} – ${accion}`, id: `fase${i}-accion${j}` });
    });
    fase.requerimientos.forEach((req: string) => {
      entries.push({ text: `${i + 1}. ${fase.fase} (Req) – ${req}`, id: null });
    });
  });
  function renderQuick(filter: string = '') {
    ol.innerHTML = '';
    entries.filter(e => e.text.toLowerCase().includes(filter.toLowerCase())).forEach(e => {
      const li = document.createElement('li');
      li.textContent = e.text;
      ol.appendChild(li);
    });
  }
  renderQuick('');
  input.addEventListener('input', () => {
    renderQuick(input.value);
  });
  cont.appendChild(sec2);
}

function renderFases() {
  const cont = document.getElementById('view-fases');
  if (!cont) return;
  cont.innerHTML = '';
  const h2 = document.createElement('h2');
  h2.textContent = 'Fases de implementación';
  cont.appendChild(h2);
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = "Filtra por palabras clave (p.ej., 'formulario', 'insignias')";
  input.className = 'filter-input';
  cont.appendChild(input);
  const listDiv = document.createElement('div');
  cont.appendChild(listDiv);
  function renderList(filter: string = '') {
    listDiv.innerHTML = '';
    data.fases_implementacion?.forEach((fase: any, i: number) => {
      const joined = `${fase.fase} ${fase.acciones.join(' ')} ${fase.requerimientos.join(' ')}`.toLowerCase();
      if (filter && !joined.includes(filter.toLowerCase())) return;
      const det = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = `${i + 1}. ${fase.fase}`;
      det.appendChild(summary);
      const inner = document.createElement('div');
      inner.style.display = 'grid';
      inner.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
      inner.style.gap = '1rem';
      // Acciones
      const actDiv = document.createElement('div');
      const actTitle = document.createElement('h3');
      actTitle.textContent = 'Acciones';
      actDiv.appendChild(actTitle);
      fase.acciones.forEach((accion: string, j: number) => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.gap = '0.5rem';
        row.style.alignItems = 'center';
        const spanTitle = document.createElement('span');
        spanTitle.style.flex = '1 1 200px';
        spanTitle.style.fontWeight = '500';
        spanTitle.textContent = accion;
        row.appendChild(spanTitle);
        const respDiv = document.createElement('div');
        respDiv.style.display = 'flex';
        respDiv.style.gap = '0.25rem';
        respDiv.style.flexWrap = 'wrap';
        const spanResp = document.createElement('span');
        spanResp.textContent = 'Responsables:';
        respDiv.appendChild(spanResp);
        const tId = `fase${i}-accion${j}`;
        const task = state.tasks?.[tId] || { responsables: [], startDate: '', endDate: '', status: '' };
        task.responsables.forEach((r, idx) => {
          const tag = document.createElement('span');
          tag.textContent = r.name;
          tag.style.background = r.color;
          tag.style.color = '#fff';
          tag.style.padding = '0.1rem 0.3rem';
          tag.style.borderRadius = '0.25rem';
          tag.style.cursor = 'pointer';
          tag.addEventListener('click', () => {
            removeResponsable(tId, idx);
            renderList(filter);
          });
          respDiv.appendChild(tag);
        });
        const btnAdd = document.createElement('button');
        btnAdd.textContent = '+';
        btnAdd.style.background = '#10b981';
        btnAdd.style.border = 'none';
        btnAdd.style.color = '#fff';
        btnAdd.style.padding = '0.25rem 0.5rem';
        btnAdd.style.borderRadius = '0.25rem';
        btnAdd.addEventListener('click', () => {
          const name = prompt('Nombre del responsable:');
          if (!name) return;
          const color = prompt('Color (e.g., #f59e0b):', '#f59e0b');
          if (!color) return;
          addResponsable(tId, { name, color });
          renderList(filter);
        });
        respDiv.appendChild(btnAdd);
        row.appendChild(respDiv);
        // Fechas
        const dateDiv = document.createElement('div');
        dateDiv.style.display = 'flex';
        dateDiv.style.gap = '0.5rem';
        const spanFecha = document.createElement('span');
        spanFecha.textContent = 'Fechas:';
        dateDiv.appendChild(spanFecha);
        const startInput = document.createElement('input');
        startInput.type = 'date';
        startInput.value = task.startDate || '';
        startInput.addEventListener('change', (ev: any) => {
          updateTaskDate(tId, 'startDate', ev.target.value);
          renderList(filter);
        });
        dateDiv.appendChild(startInput);
        const endInput = document.createElement('input');
        endInput.type = 'date';
        endInput.value = task.endDate || '';
        endInput.addEventListener('change', (ev: any) => {
          updateTaskDate(tId, 'endDate', ev.target.value);
          renderList(filter);
        });
        row.appendChild(endInput);
        const select = document.createElement('select');
        ['Por hacer','En progreso','Completado'].forEach(opt => {
          const option = document.createElement('option');
          option.textContent = opt;
          option.value = opt;
          if (task.status === opt) option.selected = true;
          select.appendChild(option);
        });
        select.addEventListener('change', (ev: any) => {
          updateTaskStatus(tId, (ev.target as HTMLSelectElement).value);
          renderList(filter);
        });
        row.appendChild(select);
        inner.appendChild(row);
      });
      // Requerimientos
      const reqDiv = document.createElement('div');
      const reqTitle = document.createElement('h3');
      reqTitle.textContent = 'Requerimientos';
      reqDiv.appendChild(reqTitle);
      fase.requerimientos.forEach((req: string) => {
        const p = document.createElement('p');
        p.textContent = req;
        reqDiv.appendChild(p);
      });
      inner.appendChild(reqDiv);
      det.appendChild(inner);
      listDiv.appendChild(det);
    });
  }
  renderList('');
  input.addEventListener('input', () => {
    renderList(input.value);
  });
}

function renderEquipo() {
  const cont = document.getElementById('view-equipo');
  if (!cont) return;
  cont.innerHTML = '';
  const h2 = document.createElement('h2');
  h2.textContent = 'Equipo Operativo';
  cont.appendChild(h2);
  const ul = document.createElement('ul');
  ul.style.listStyleType = 'disc';
  data.estructura_general?.equipo_operativo?.forEach((rol: any) => {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = rol.rol;
    li.appendChild(strong);
    const ul2 = document.createElement('ul');
    ul2.style.listStyleType = 'circle';
    rol.responsabilidades.forEach((resp: string) => {
      const li2 = document.createElement('li');
      li2.textContent = resp;
      ul2.appendChild(li2);
    });
    li.appendChild(ul2);
    ul.appendChild(li);
  });
  cont.appendChild(ul);


}

function renderTrayecto() {
  const cont = document.getElementById('view-trayecto');
  if (!cont) return;
  cont.innerHTML = '';
  const sec = document.createElement('div');
  sec.className = 'section';
  const h2 = document.createElement('h2');
  h2.textContent = 'Trayecto Formativo';
  sec.appendChild(h2);
  const pName = document.createElement('p');
  pName.innerHTML = `<strong>Nombre:</strong> ${data.trayectos_formativos.nombre}`;
  sec.appendChild(pName);
  const pMod = document.createElement('p');
  pMod.innerHTML = `<strong>Modalidad:</strong> ${data.trayectos_formativos.modalidad}`;
  sec.appendChild(pMod);
  const ul = document.createElement('ul');
  (data.trayectos_formativos.estructura || []).forEach((mod: any) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>Módulo ${mod.modulo}: ${mod.nombre}</strong> — ${mod.contenido}`;
    ul.appendChild(li);
  });
  sec.appendChild(ul);
  cont.appendChild(sec);
}

function renderChecklist() {
  const cont = document.getElementById('view-checklist');
  if (!cont) return;
  cont.innerHTML = '';
  const sec = document.createElement('div');
  sec.className = 'section';
  const h2 = document.createElement('h2');
  h2.textContent = 'Checklist';
  sec.appendChild(h2);
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  ['Fase','Acción','Responsables','Inicio','Fin','Estado'].forEach(title => {
    const th = document.createElement('th');
    th.textContent = title;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  data.fases_implementacion.forEach((fase: any, i: number) => {
      fase.acciones.forEach((accion: string, j: number) => {
        const tId = `fase${i}-accion${j}`;
        const tr = document.createElement('tr');
        const tdFase = document.createElement('td');
        tdFase.textContent = `${i + 1}. ${fase.fase}`;
        tr.appendChild(tdFase);
        const tdAcc = document.createElement('td');
        tdAcc.textContent = accion;
        tr.appendChild(tdAcc);
        const tdResp = document.createElement('td');
        const task = state.tasks?.[tId] || { responsables: [], startDate: '', endDate: '', status: '' };
        task.responsables.forEach((r, idx) => {
          const span = document.createElement('span');
          span.textContent = r.name;
          span.style.background = r.color;
          span.style.color = '#fff';
          span.style.padding = '0.1rem 0.3rem';
          span.style.borderRadius = '0.25rem';
          span.style.marginRight = '0.25rem';
          span.style.cursor = 'pointer';
          span.addEventListener('click', () => {
            removeResponsable(tId, idx);
            renderChecklist();
          });
          tdResp.appendChild(span);
        });
        tr.appendChild(tdResp);
        const tdStart = document.createElement('td');
        tdStart.textContent = task.startDate || '';
        tr.appendChild(tdStart);
        const tdEnd = document.createElement('td');
        tdEnd.textContent = task.endDate || '';
        tr.appendChild(tdEnd);
        const tdStatus = document.createElement('td');
        tdStatus.textContent = task.status || '';
        tr.appendChild(tdStatus);
        tbody.appendChild(tr);
      });
  });
  table.appendChild(tbody);
  sec.appendChild(table);
  cont.appendChild(sec);
}

function renderCalendar() {
  const cont = document.getElementById('view-calendario');
  if (!cont) return;
  cont.innerHTML = '';
  const sec = document.createElement('div');
  sec.className = 'section';
  const h2 = document.createElement('h2');
  h2.textContent = 'Calendario';
  sec.appendChild(h2);
  const table = document.createElement('table');
  table.className = 'calendar';
  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].forEach(d => {
    const th = document.createElement('th');
    th.textContent = d;
    trh.appendChild(th);
  });
  thead.appendChild(trh);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  const date = new Date();
  const month = date.getMonth();
  const year = date.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let dayCounter = 1;
  // Build tasks by day
  const tasksByDay: { [day: number]: { accion: string; color: string }[] } = {};
  data.fases_implementacion.forEach((fase: any, i: number) => {
    fase.acciones.forEach((accion: string, j: number) => {
      const tId = `fase${i}-accion${j}`;
      const tData = state.tasks?.[tId] || { responsables: [], startDate: '', endDate: '' };
      const startDate = tData.startDate ? new Date(tData.startDate) : null;
      const endDate = tData.endDate ? new Date(tData.endDate) : null;
      if (startDate && endDate) {
        const current = new Date(year, month, 1);
        while (current <= endDate) {
          const d = current.getDate();
          if (current >= startDate && current <= endDate) {
            if (!tasksByDay[d]) tasksByDay[d] = [];
            const color = tData.responsables.length ? tData.responsables[0].color : '#6c757d';
            tasksByDay[d].push({ accion, color });
          }
          current.setDate(current.getDate() + 1);
        }
      }
    });
  });
  for (let w = 0; w < 6; w++) {
    const tr = document.createElement('tr');
    for (let d = 0; d < 7; d++) {
      const td = document.createElement('td');
      const current = w * 7 + d;
      if (current >= firstDay && dayCounter <= daysInMonth) {
        td.textContent = dayCounter.toString();
        if (tasksByDay[dayCounter]) {
          tasksByDay[dayCounter].forEach(task => {
            const span = document.createElement('span');
            span.textContent = task.accion;
            span.style.display = 'block';
            span.style.background = task.color;
            span.style.color = '#fff';
            span.style.padding = '0.1rem 0.2rem';
            span.style.borderRadius = '0.25rem';
            span.style.fontSize = '0.6rem';
            td.appendChild(span);
          });
        }
        dayCounter++;
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  sec.appendChild(table);
  cont.appendChild(sec);
}

function renderDiagrama() {
  const cont = document.getElementById('view-diagrama');
  if (!cont) return;
  cont.innerHTML = '';
  const sec = document.createElement('div');
  sec.className = 'section';
  const h2 = document.createElement('h2');
  h2.textContent = 'Diagrama';
  sec.appendChild(h2);
  // Aquí podrías renderizar un diagrama de manera estática o con librería externa
  const p = document.createElement('p');
  p.textContent = 'Diagrama de acciones (en construcción)';
  sec.appendChild(p);
  cont.appendChild(sec);
}

function updateTaskStatus(tId: string, status: string) {
  if (!state.tasks) state.tasks = {};
  if (!state.tasks[tId]) state.tasks[tId] = { responsables: [], startDate: '', endDate: '', status: '' };
  state.tasks[tId].status = status;
  saveState();
}

function updateTaskDate(tId: string, key: 'startDate' | 'endDate', value: string) {
  if (!state.tasks) state.tasks = {};
  if (!state.tasks[tId]) state.tasks[tId] = { responsables: [], startDate: '', endDate: '', status: '' };
  (state.tasks[tId] as any)[key] = value;
  saveState();
}

function addResponsable(tId: string, resp: { name: string; color: string }) {
  if (!state.tasks) state.tasks = {};
  if (!state.tasks[tId]) state.tasks[tId] = { responsables: [], startDate: '', endDate: '', status: '' };
  state.tasks[tId].responsables.push(resp);
  saveState();
}

function removeResponsable(tId: string, index: number) {
  const task = state.tasks?.[tId];
  if (task && task.responsables.length) {
    task.responsables.splice(index, 1);
    saveState();
  }
}

function saveState() {
  localStorage.setItem('mbotAppState', JSON.stringify(state));
}

document.addEventListener('DOMContentLoaded', init);
