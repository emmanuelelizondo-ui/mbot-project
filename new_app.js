// Cargamos estado de localStorage o inicializamos
const state = JSON.parse(localStorage.getItem('mbotAppState') || '{}');
let data;
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
    var _a, _b;
    const container = document.getElementById('tag-container');
    if (!container)
        return;
    container.innerHTML = '';
    const bases = ((_b = (_a = data.estructura_general) === null || _a === void 0 ? void 0 : _a.fundamentos_estratégicos) === null || _b === void 0 ? void 0 : _b.bases_didácticas) || [];
    bases.forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'chip';
        span.textContent = tag;
        container.appendChild(span);
    });
}
function showSection(viewId) {
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    const section = document.getElementById('view-' + viewId);
    if (section)
        section.classList.add('active');
}
function renderResumen() {
    var _a, _b, _c, _d, _e;
    const cont = document.getElementById('view-resumen');
    if (!cont)
        return;
    cont.innerHTML = '';
    // Fundamentos estratégicos
    const sec1 = document.createElement('div');
    sec1.className = 'section';
    const h2 = document.createElement('h2');
    h2.textContent = 'Fundamentos estratégicos';
    sec1.appendChild(h2);
    const enfoque = ((_b = (_a = data.estructura_general) === null || _a === void 0 ? void 0 : _a.fundamentos_estratégicos) === null || _b === void 0 ? void 0 : _b.enfoque) || '';
    const pEnfoque = document.createElement('p');
    pEnfoque.innerHTML = `<strong>Enfoque:</strong> ${enfoque}`;
    sec1.appendChild(pEnfoque);
    const h3c = document.createElement('h3');
    h3c.textContent = 'Competencias a desarrollar';
    sec1.appendChild(h3c);
    const ulC = document.createElement('ul');
    (((_d = (_c = data.estructura_general) === null || _c === void 0 ? void 0 : _c.fundamentos_estratégicos) === null || _d === void 0 ? void 0 : _d.competencias_a_desarrollar) || []).forEach((c) => {
        const li = document.createElement('li');
        li.textContent = c;
        ulC.appendChild(li);
    });
    sec1.appendChild(ulC);
    cont.appendChild(sec1);
    // Búsqueda rápida
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
    const entries = [];
    (_e = data.fases_implementacion) === null || _e === void 0 ? void 0 : _e.forEach((fase, i) => {
        fase.acciones.forEach((accion, j) => {
            entries.push({ text: `${i + 1}. ${fase.fase} – ${accion}`, id: `fase${i}-accion${j}` });
        });
        fase.requerimientos.forEach((req) => {
            entries.push({ text: `${i + 1}. ${fase.fase} (Req) – ${req}`, id: null });
        });
    });
    function renderQuick(filter = '') {
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
    if (!cont)
        return;
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
    function renderList(filter = '') {
        var _a;
        listDiv.innerHTML = '';
        (_a = data.fases_implementacion) === null || _a === void 0 ? void 0 : _a.forEach((fase, i) => {
            const joined = `${fase.fase} ${fase.acciones.join(' ')} ${fase.requerimientos.join(' ')}`.toLowerCase();
            if (filter && !joined.includes(filter.toLowerCase()))
                return;
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
            fase.acciones.forEach((accion, j) => {
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.flexWrap = 'wrap';
                row.style.gap = '0.5rem';
                row.style.alignItems = 'center';
                const spanTitle = document.createElement('span');
                spanTitle.style.flex = '1 1 200px';
                spanTitle.style.fontWeight = '600';
                spanTitle.textContent = accion;
                row.appendChild(spanTitle);
                const taskId = `fase${i}-accion${j}`;
                const tData = getTask(taskId);
                // Responsables
                const tagsDiv = document.createElement('div');
                tagsDiv.className = 'responsables';
                tData.responsables.forEach((resp, idx) => {
                    const tag = document.createElement('span');
                    tag.className = 'responsable-tag';
                    tag.style.backgroundColor = resp.color;
                    tag.textContent = resp.name;
                    const rem = document.createElement('span');
                  
  rem.className = 'remove';
                    rem.textContent = '×';
                    rem.addEventListener('click', () => {
                        removeResponsible(taskId, idx);
                        renderList(input.value);
                    });
                    tag.appendChild(rem);
                    tagsDiv.appendChild(tag);
                });
                row.appendChild(tagsDiv);
                // Input para agregar responsable
                const inpName = document.createElement('input');
                inpName.type = 'text';
                inpName.placeholder = 'Responsable';
                const inpColor = document.createElement('input');
                inpColor.type = 'color';
                inpColor.value = randomColor();
                const btnAdd = document.createElement('button');
                btnAdd.textContent = '+';
                btnAdd.style.background = '#10b981';
                btnAdd.style.border = 'none';
                btnAdd.style.color = '#fff';
                btnAdd.style.padding = '0.25rem 0.5rem';
                btnAdd.style.borderRadius = '4px';
                btnAdd.style.cursor = 'pointer';
                btnAdd.addEventListener('click', () => {
                    const name = inpName.value.trim();
                    if (name) {
                        addResponsible(taskId, name, inpColor.value);
                        inpName.value = '';
                        inpColor.value = randomColor();
        
                renderList(input.value);
                    }
                });
                const inputsWrap = document.createElement('div');
                inputsWrap.style.display = 'flex';
                inputsWrap.style.gap = '0.25rem';
                inputsWrap.appendChild(inpName);
                inputsWrap.appendChild(inpColor);
                inputsWrap.appendChild(btnAdd);
                row.appendChild(inputsWrap);
                // Fechas y estado
                const startInput = document.createElement('input');
                startInput.type = 'date';
                startInput.value = tData.startDate || '';
                startInput.addEventListener('change', (e) => {
                    updateTask(taskId, 'startDate', e.target.value);
                    renderList(input.value);
                });
                row.appendChild(startInput);
                const endInput = document.createElement('input');
                endInput.type = 'date';
                endInput.value = tData.endDate || '';
                endInput.addEventListener('change', (e) => {
                    updateTask(taskId, 'endDate', e.target.value);
                    renderList(input.value);
                });
                row.appendChild(endInput);
                const select = document.createElement('select');
                ['Por hacer', 'En progreso', 'Completado'].forEach(val => {
                    const opt = document.createElement('option');
          
          opt.value = val;
                    opt.textContent = val;
                    if (tData.status === val)
                        opt.selected = true;
                    select.appendChild(opt);
                });
                select.addEventListener('change', (e) => {
                    updateTask(taskId, 'status', e.target.value);
                    renderList(input.value);
                });
                row.appendChild(select);
                // Colorear fila en función de fechas y estado
                const todayStr = new Date().toISOString().split('T')[0];
                if (tData.status !== 'Completado' && tData.startDate && tData.endDate) {
                    if (todayStr >= tData.startDate && todayStr <= tData.endDate) {
                        row.style.backgroundColor = '#fff9e6';
                    }
                    else if (todayStr > tData.endDate) {
                        row.style.backgroundColor = '#ffe6e6';
                    }
                }
                actDiv.appendChild(row);
            });
            inner.appendChild(actDiv);
            // Requerimientos
            const reqDiv = document.createElement('div');
            const reqTitle = document.createElement('h3');
            reqTitle.textContent = 'Requerimientos';
            reqDiv.appendChild(reqTitle);
            const ulReq = document.createElement('ul');
            fase.requerimientos.forEach((req) => {
                const li = document.createElement('li');
                li.textContent = req;
                ulReq.appendChild(li);
            });
            reqDiv.appendChild(ulReq);
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
    var _a, _b;
    const cont = document.getElementById('view-equipo');
    if (!cont)
        return;
    cont.innerHTML = '';
    const sec = document.createElement('div');
    sec.className = 'section';
    const h2 = document.createElement('h2');
    h2.textContent = 'Equipo Operativo';
    sec.appendChild(h2);
    const ul = document.createElement('ul');
    (((_b = (_a = data.estructura_general) === null || _a === void 0 ? void 0 : _a.equipo_operativo) === null || _b === void 0 ? void 0 : _b.roles_clave) || []).forEach((role) => {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = role.nombre;
        li.appendChild(strong);
        const subUl = document.createElement('ul');
        (role.responsabilidades || []).forEach((resp) => {
            const liSub = document.createElement('li');
            liSub.textContent = resp;
            subUl.appendChild(liSub);
        });
        if (role.trayectos) {
            const liTray = document.createElement('li');
            liTray.innerHTML = `<em>Trayectos:</em> ${role.trayectos.join(', ')}`;
            subUl.appendChild(liTray);
        }
        li.appendChild(subUl);
        ul.appendChild(li);
    });
    sec.appendChild(ul);
    cont.appendChild(sec);
}
function renderTrayecto() {
    const cont = document.getElementById('view-trayecto');
    if (!cont)
        return;
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
    (data.trayectos_formativos.estructura || []).forEach((mod) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>Módulo ${mod.modulo}: ${mod.nombre}</strong> — ${mod.contenido}`;
        ul.appendChild(li);
    });
    sec.appendChild(ul);
    cont.appendChild(sec);
}
function renderChecklist() {
    const cont = document.getElementById('view-checklist');
    if (!cont)
        return;
    cont.innerHTML = '';
    const sec = document.createElement('div');
    sec.className = 'section';
    const h2 = document.createElement('h2');
    h2.textContent = 'Checklist';
    sec.appendChild(h2);
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    ['Fase', 'Acción', 'Responsables', 'Inicio', 'Fin', 'Estado'].forEach(title => {
        const th = document.createElement('th');
        th.textContent = title;
        trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    data.fases_implementacion.forEach((fase, i) => {
        fase.acciones.forEach((accion, j) => {
            const id = `fase${i}-accion${j}`;
            const tData = getTask(id);
            const row = document.createElement('tr');
            const today = new Date().toISOString().split('T')[0];
            if (tData.status !== 'Completado' && tData.startDate && tData.endDate) {
                if (today >= tData.startDate && today <= tData.endDate) {
                    row.style.backgroundColor = '#fff9e6';
                }
                else if (today > tData.endDate) {
                    row.style.backgroundColor = '#ffe6e6';
                }
            }
            const tdFase = document.createElement('td');
            tdFase.textContent = fase.fase;
            row.appendChild(tdFase);
            const tdAcc = document.createElement('td');
            tdAcc.textContent = accion;
            row.appendChild(tdAcc);
            const tdResp = document.createElement('td');
            tData.responsables.forEach((resp) => {
                const span = document.createElement('span');
                span.className = 'responsable-tag';
                span.style.backgroundColor = resp.color;
                span.textContent = resp.name;
                tdResp.appendChild(span);
                tdResp.appendChild(document.createTextNode(' '));
            });
            row.appendChild(tdResp);
            const tdStart = document.createElement('td');
            tdStart.textContent = tData.startDate || '';
            row.appendChild(tdStart);
            const tdEnd = document.createElement('td');
            tdEnd.textContent = tData.endDate || '';
            row.appendChild(tdEnd);
            const tdStatus = document.createElement('td');
            tdStatus.textContent = tData.status;
            row.appendChild(tdStatus);
            tbody.appendChild(row);
        });
    });
    table.appendChild(tbody);
    sec.appendChild(table);
    cont.appendChild(sec);
}
function renderCalendar() {
    const cont = document.getElementById('view-calendario');
    if (!cont)
        return;
    cont.innerHTML = '';
    const sec = document.createElement('div');
    sec.className = 'section';
    const h2 = document.createElement('h2');
    h2.textContent = 'Calendario';
    sec.appendChild(h2);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const tasksByDay = {};
    data.fases_implementacion.forEach((fase, i) => {
        fase.acciones.forEach((accion, j) => {
            const id = `fase${i}-accion${j}`;
            const tData = getTask(id);
            if (tData.startDate && tData.endDate) {
                const startDate = new Date(tData.startDate);
                const endDate = new Date(tData.endDate);
                for (let d = 1; d <= daysInMonth; d++) {
                    const current = new Date(year, month, d);
                    if (current >= startDate && current <= endDate) {
                        if (!tasksByDay[d])
                            tasksByDay[d] = [];
                        const color = tData.responsables.length ? tData.responsables[0].color : '#6c757d';
                        tasksByDay[d].push({ accion, color });
                    }
                }
            }
        });
    });
    const table = document.createElement('table');
    table.className = 'calendar';
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach(dow => {
        const th = document.createElement('th');
        th.textContent = dow;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    let dayCounter = 1 
- firstDay;
    for (let row = 0; row < 6; row++) {
        const trRow = document.createElement('tr');
        for (let col = 0; col < 7; col++) {
            const td = document.createElement('td');
            if (dayCounter > 0 && dayCounter <= daysInMonth) {
                const dayNum = dayCounter;
                const dDiv = document.createElement('div');
                dDiv.className = 'day-number';
                dDiv.textContent = String(dayNum);
                td.appendChild(dDiv);
                const tasks = tasksByDay[dayNum] || [];
                tasks.forEach(t => {
                    const span = document.createElement('span');
                    span.className = 'task-entry';
                    span.style.backgroundColor = t.color;
                    span.textContent = t.accion;
                    td.appendChild(span);
                });
            }
            dayCounter++;
            trRow.appendChild(td);
        }
        tbody.appendChild(trRow);
    }
    table.appendChild(tbody);
    sec.appendChild(table);
    cont.appendChild(sec);
}
function renderDiagrama() {
    const cont = document.getElementById('view-diagrama');
    if (!cont)
        return;
    cont.innerHTML = '';
    const sec = document.createElement('div');
    sec.className = 'section';
    const h2 = document.createElement('h2');
    h2.textContent = 'Diagrama de acciones';
    sec.appendChild(h2);
    const p = document.createElement('p');
    p.textContent = 'Esta sección puede incluir un diagrama visual de acciones. Pendiente de implementación.';
    sec.appendChild(p);
    cont.appendChild(sec);
}
// Helpers de color aleatorio
function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}
// Helper para obtener/crear tarea
function getTask(id) {
    if (!state.tasks)
        state.tasks = {};
    if (!state.tasks[id]) {
        state.tasks[id] = { responsables: [], startDate: '', endDate: '', status: 'Por hacer' };
    }
    return state.tasks[id];
}
function updateTask(id, field, value) {
    const task = getTask(id);
    // @ts-ignore
    task[field] = value;
    saveState();
}
function addResponsible(id, name, color) {
    const task = getTask(id);
    task.responsables.push({ name, color });
    saveState();
}
function removeResponsible(id, index) {
    const task = getTask(id);
    if (index >= 0 && index < task.responsables.length) {
        task.responsables.splice(index, 1);
        saveState();
    }
}
function saveState() {
    localStorage.setItem('mbotAppState', JSON.stringify(state));
}
// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    init().catch(err => {
        console.error(err);
        const main = document.querySelector('main');
        if (main) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'section';
            errorDiv.style.backgroundColor = '#ffe6e6';
            errorDiv.style.color = '#b91c1c';
            errorDiv.innerHTML = '<strong>Error:</strong> No se pudieron cargar los datos.';
            main.appendChild(errorDiv);
        }
    });
});
=== void 0 ? void 0 : _d.competencias_a_desarrollar) || []).forEach((c) => {
        const li = document.createElement('li');
        li.textContent = c;
        ulC.appendChild(li);
    });
    sec1.appendChild(ulC);
    cont.appendChild(sec1);
    // Búsqueda rápida
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
    const entries = [];
    (_e = data.fases_implementacion) === null || _e === void 0 ? void 0 : _e.forEach((fase, i) => {
        fase.acciones.forEach((accion, j) => {
            entries.push({ text: `${i + 1}. ${fase.fase} – ${accion}`, id: `fase${i}-accion${j}` });
        });
        fase.requerimientos.forEach((req) => {
            entries.push({ text: `${i + 1}. ${fase.fase} (Req) – ${req}`, id: null });
        });
    });
    function renderQuick(filter = '') {
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
    if (!cont)
        return;
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
    function renderList(filter = '') {
        var _a;
        listDiv.innerHTML = '';
        (_a = data.fases_implementacion) === null || _a === void 0 ? void 0 : _a.forEach((fase, i) => {
            const joined = `${fase.fase} ${fase.acciones.join(' ')} ${fase.requerimientos.join(' ')}`.toLowerCase();
            if (filter && !joined.includes(filter.toLowerCase()))
                return;
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
            fase.acciones.forEach((accion, j) => {
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.flexWrap = 'wrap';
                row.style.gap = '0.5rem';
                row.style.alignItems = 'center';
                const spanTitle = document.createElement('span');
                spanTitle.style.flex = '1 1 200px';
                spanTitle.style.fontWeight = '600';
                spanTitle.textContent = accion;
                row.appendChild(spanTitle);
                const taskId = `fase${i}-accion${j}`;
                const tData = getTask(taskId);
                // Responsables
                const tagsDiv = document.createElement('div');
                tagsDiv.className = 'responsables';
                tData.responsables.forEach((resp, idx) => {
                    const tag = document.createElement('span');
                    tag.className = 'responsable-tag';
                    tag.style.backgroundColor = resp.color;
                    tag.textContent = resp.name;
                    const rem = document.createElement('span');
                    rem.className = 'remove';
                    rem.textContent = '×';
                    rem.addEventListener('click', () => {
                        removeResponsible(taskId, idx);
                        renderList(input.value);
                    });
                    tag.appendChild(rem);
                    tagsDiv.appendChild(tag);
                });
                row.appendChild(tagsDiv);
                // Input para agregar responsable
                const inpName = document.createElement('input');
                inpName.type = 'text';
                inpName.placeholder = 'Responsable';
                const inpColor = document.createElement('input');
                inpColor.type = 'color';
                inpColor.value = randomColor();
                const btnAdd = document.createElement('button');
                btnAdd.textContent = '+';
                btnAdd.style.background = '#10b981';
                btnAdd.style.border = 'none';
                btnAdd.style.color = '#fff';
                btnAdd.style.padding = '0.25rem 0.5rem';
                btnAdd.style.borderRadius = '4px';
                btnAdd.style.cursor = 'pointer';
                btnAdd.addEventListener('click', () => {
                    const name = inpName.value.trim();
                    if (name) {
                        addResponsible(taskId, name, inpColor.value);
                        inpName.value = '';
                        inpColor.value = randomColor();
                        renderList(input.value);
                    }
                });
                const inputsWrap = document.createElement('div');
                inputsWrap.style.display = 'flex';
                inputsWrap.style.gap = '0.25rem';
                inputsWrap.appendChild(inpName);
                inputsWrap.appendChild(inpColor);
                inputsWrap.appendChild(btnAdd);
                row.appendChild(inputsWrap);
                // Fechas y estado
                const startInput = document.createElement('input');
                startInput.type = 'date';
                startInput.value = tData.startDate || '';
                startInput.addEventListener('change', (e) => {
                    updateTask(taskId, 'startDate', e.target.value);
                    renderList(input.value);
                });
                row.appendChild(startInput);
                const endInput = document.createElement('input');
                endInput.type = 'date';
                endInput.value = tData.endDate || '';
                endInput.addEventListener('change', (e) => {
                    updateTask(taskId, 'endDate', e.target.value);
                    renderList(input.value);
                });
                row.appendChild(endInput);
                const select = document.createElement('select');
                ['Por hacer', 'En progreso', 'Completado'].forEach(val => {
                    const opt = document.createElement('option');
                    opt.value = val;
                    opt.textContent = val;
                    if (tData.status === val)
                        opt.selected = true;
                    select.appendChild(opt);
                });
                select.addEventListener('change', (e) => {
                    updateTask(taskId, 'status', e.target.value);
                    renderList(input.value);
                });
                row.appendChild(select);
                // Colorear fila en función de fechas y estado
                const todayStr = new Date().toISOString().split('T')[0];
                if (tData.status !== 'Completado' && tData.startDate && tData.endDate) {
                    if (todayStr >= tData.startDate && todayStr <= tData.endDate) {
                        row.style.backgroundColor = '#fff9e6';
                    }
                    else if (todayStr > tData.endDate) {
                        row.style.backgroundColor = '#ffe6e6';
                    }
                }
                actDiv.appendChild(row);
            });
            inner.appendChild(actDiv);
            // Requerimientos
            const reqDiv = document.createElement('div');
            const reqTitle = document.createElement('h3');
            reqTitle.textContent = 'Requerimientos';
            reqDiv.appendChild(reqTitle);
            const ulReq = document.createElement('ul');
            fase.requerimientos.forEach((req) => {
                const li = document.createElement('li');
                li.textContent = req;
                ulReq.appendChild(li);
            });
            reqDiv.appendChild(ulReq);
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
    var _a, _b;
    const cont = document.getElementById('view-equipo');
    if (!cont)
        return;
    cont.innerHTML = '';
    const sec = document.createElement('div');
    sec.className = 'section';
    const h2 = document.createElement('h2');
    h2.textContent = 'Equipo Operativo';
    sec.appendChild(h2);
    const ul = document.createElement('ul');
    (((_b = (_a = data.estructura_general) === null || _a === void 0 ? void 0 : _a.equipo_operativo) === null || _b === void 0 ? void 0 : _b.roles_clave) || []).forEach((role) => {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = role.nombre;
        li.appendChild(strong);
        const subUl = document.createElement('ul');
        (role.responsabilidades || []).forEach((resp) => {
            const liSub = document.createElement('li');
            liSub.textContent = resp;
            subUl.appendChild(liSub);
        });
        if (role.trayectos) {
            const liTray = document.createElement('li');
            liTray.innerHTML = `<em>Trayectos:</em> ${role.trayectos.join(', ')}`;
            subUl.appendChild(liTray);
        }
        li.appendChild(subUl);
        ul.appendChild(li);
    });
    sec.appendChild(ul);
    cont.appendChild(sec);
}
function renderTrayecto() {
    const cont = document.getElementById('view-trayecto');
    if (!cont)
        return;
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
    (data.trayectos_formativos.estructura || []).forEach((mod) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>Módulo ${mod.modulo}: ${mod.nombre}</strong> — ${mod.contenido}`;
        ul.appendChild(li);
    });
    sec.appendChild(ul);
    cont.appendChild(sec);
}
function renderChecklist() {
    const cont = document.getElementById('view-checklist');
    if (!cont)
        return;
    cont.innerHTML = '';
    const sec = document.createElement('div');
    sec.className = 'section';
    const h2 = document.createElement('h2');
    h2.textContent = 'Checklist';
    sec.appendChild(h2);
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    ['Fase', 'Acción', 'Responsables', 'Inicio', 'Fin', 'Estado'].forEach(title => {
        const th = document.createElement('th');
        th.textContent = title;
        trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    data.fases_implementacion.forEach((fase, i) => {
        fase.acciones.forEach((accion, j) => {
            const id = `fase${i}-accion${j}`;
            const tData = getTask(id);
            const row = document.createElement('tr');
            const today = new Date().toISOString().split('T')[0];
            if (tData.status !== 'Completado' && tData.startDate && tData.endDate) {
                if (today >= tData.startDate && today <= tData.endDate) {
                    row.style.backgroundColor = '#fff9e6';
                }
                else if (today > tData.endDate) {
                    row.style.backgroundColor = '#ffe6e6';
                }
            }
            const tdFase = document.createElement('td');
            tdFase.textContent = fase.fase;
            row.appendChild(tdFase);
            const tdAcc = document.createElement('td');
            tdAcc.textContent = accion;
            row.appendChild(tdAcc);
            const tdResp = document.createElement('td');
            tData.responsables.forEach((resp) => {
                const span = document.createElement('span');
                span.className = 'responsable-tag';
                span.style.backgroundColor = resp.color;
                span.textContent = resp.name;
                tdResp.appendChild(span);
                tdResp.appendChild(document.createTextNode(' '));
            });
            row.appendChild(tdResp);
            const tdStart = document.createElement('td');
            tdStart.textContent = tData.startDate || '';
            row.appendChild(tdStart);
            const tdEnd = document.createElement('td');
            tdEnd.textContent = tData.endDate || '';
            row.appendChild(tdEnd);
            const tdStatus = document.createElement('td');
            tdStatus.textContent = tData.status;
            row.appendChild(tdStatus);
            tbody.appendChild(row);
        });
    });
    table.appendChild(tbody);
    sec.appendChild(table);
    cont.appendChild(sec);
}
function renderCalendar() {
    const cont = document.getElementById('view-calendario');
    if (!cont)
        return;
    cont.innerHTML = '';
    const sec = document.createElement('div');
    sec.className = 'section';
    const h2 = document.createElement('h2');
    h2.textContent = 'Calendario';
    sec.appendChild(h2);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const tasksByDay = {};
    data.fases_implementacion.forEach((fase, i) => {
        fase.acciones.forEach((accion, j) => {
            const id = `fase${i}-accion${j}`;
            const tData = getTask(id);
            if (tData.startDate && tData.endDate) {
                const startDate = new Date(tData.startDate);
                const endDate = new Date(tData.endDate);
                for (let d = 1; d <= daysInMonth; d++) {
                    const current = new Date(year, month, d);
                    if (current >= startDate && current <= endDate) {
                        if (!tasksByDay[d])
                            tasksByDay[d] = [];
                        const color = tData.responsables.length ? tData.responsables[0].color : '#6c757d';
                        tasksByDay[d].push({ accion, color });
                    }
                }
            }
        });
    });
    const table = document.createElement('table');
    table.className = 'calendar';
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].forEach(dow => {
        const th = document.createElement('th');
        th.textContent = dow;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    let dayCounter = 1 
- firstDay;
    for (let row = 0; row < 6; row++) {
        const trRow = document.createElement('tr');
        for (let col = 0; col < 7; col++) {
            const td = document.createElement('td');
            if (dayCounter > 0 && dayCounter <= daysInMonth) {
                const dayNum = dayCounter;
                const dDiv = document.createElement('div');
                dDiv.className = 'day-number';
                dDiv.textContent = String(dayNum);
                td.appendChild(dDiv);
                const tasks = tasksByDay[dayNum] || [];
                tasks.forEach(t => {
                    const span = document.createElement('span');
                    span.className = 'task-entry';
                    span.style.backgroundColor = t.color;
                    span.textContent = t.accion;
                    td.appendChild(span);
                });
            }
            dayCounter++;
            trRow.appendChild(td);
        }
        tbody.appendChild(trRow);
    }
    table.appendChild(tbody);
    sec.appendChild(table);
    cont.appendChild(sec);
}
function renderDiagrama() {
    const cont = document.getElementById('view-diagrama');
    if (!cont)
        return;
    cont.innerHTML = '';
    const sec = document.createElement('div');
    sec.className = 'section';
    const h2 = document.createElement('h2');
    h2.textContent = 'Diagrama de acciones';
    sec.appendChild(h2);
    const p = document.createElement('p');
    p.textContent = 'Esta sección puede incluir un diagrama visual de acciones. Pendiente de implementación.';
    sec.appendChild(p);
    cont.appendChild(sec);
}
// Helpers de color aleatorio
function randomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}
// Helper para obtener/crear tarea
function getTask(id) {
    if (!state.tasks)
        state.tasks = {};
    if (!state.tasks[id]) {
        state.tasks[id] = { responsables: [], startDate: '', endDate: '', status: 'Por hacer' };
    }
    return state.tasks[id];
}
function updateTask(id, field, value) {
    const task = getTask(id);
    // @ts-ignore
    task[field] = value;
    saveState();
}
function addResponsible(id, name, color) {
    const task = getTask(id);
    task.responsables.push({ name, color });
    saveState();
}
function removeResponsible(id, index) {
    const task = getTask(id);
    if (index >= 0 && index < task.responsables.length) {
        task.responsables.splice(index, 1);
        saveState();
    }
}
function saveState() {
    localStorage.setItem('mbotAppState', JSON.stringify(state));
}
// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    init().catch(err => {
        console.error(err);
        const main = document.querySelector('main');
        if (main) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'section';
            errorDiv.style.backgroundColor = '#ffe6e6';
            errorDiv.style.color = '#b91c1c';
            errorDiv.innerHTML = '<strong>Error:</strong> No se pudieron cargar los datos.';
            main.appendChild(errorDiv);
        }
    });
});
