// Shorthand
function style(element, classname, state) { state ? element.classList.add(classname) : element.classList.remove(classname); }


var pX = 0;
var pY = 0;

// DOM
const container = document.getElementById('app_container');

// Variables
const process_template = {
    memory: {}, // data

    max: false,
    min: false,

    width: '400',
    height: '600',
    x: 48,
    y: 48,
    z: 1,
    allow_actions: true,

    app: 'notes',
    id: 1,
    element: undefined,
}
var processes = {}
var pid = 1;

var dragging = false;
let dragOffset = {
    x: 0,
    y: 0,
}

/** Takes directory string an returns file */
function getFile(file) {
    let target = file_system;

    if(typeof file == 'string') {
        let dir = file.split('/');
        dir.shift();
        for(i in dir) {
            let f = dir[i];
            // console.log(f);
            target = target[f];
        }
    } else target = { data: '', type: 'temp', }
    return target;
}

/** Launches an application */
function launch(name='notes', file, options) {
    let app = file_system.apps[name];

    if(app == undefined) return console.warn('Application does not exist');

    // Create process
    let proc = processes[pid] = JSON.parse(JSON.stringify(process_template));
    proc.app = name;
    proc.id = pid;
    proc.width = app.window.width;
    proc.height = app.window.height;
    proc.allow_actions = app.window.allow_actions;
    // let offset = (Object.keys(processes).length || 1) * 24;
    // console.log(offset);
    // proc.x = offset;
    // proc.y = offset;

    // HTML
    var wrapper = document.createElement('div');
    wrapper.innerHTML = appHTML(app, proc);
    container.append(wrapper.firstElementChild);
    proc.element = document.querySelector(`#app_container .window[data-process="${proc.id}"]`);

    // Title bar
    let titlebar = document.querySelector(`#app_container .window[data-process="${proc.id}"] > .title_bar`);
    titlebar.addEventListener('mousedown', event => {
        dragging = proc.id;
        // console.log(event.target.tagName);
        if(event.target.tagName == 'BUTTON') return;
        dragWindow(event, app, proc);
    });
    titlebar.addEventListener('dblclick', event => {
        if(event.target.tagName == 'BUTTON') return;
        windowAction('max', proc.id);
    })

    // Update dock
    let dockicon = document.getElementById(`dock_${name}`);
    if(dockicon != null) dockicon.classList.add('active');

    // Script
    if(app.script != undefined) app.script('start', proc, file);

    pid++; // Increment
    /** Template */
    function appHTML(app, proc) {
        let icon = app.icon == false ? '' : `<img src="${app.icon}" alt="" class="title_icon">`;
        let title_buttons = proc.allow_actions == false ? '' : `
        <button onclick="windowAction('min', ${proc.id})">_</button>
        <button onclick="windowAction('max', ${proc.id})">[]</button>
        <button class="button_close" onclick="windowAction('close', ${proc.id})">X</button>`;
        return `
        <div class="window app_${proc.app}" data-process="${proc.id}" data-app="${proc.app}" data-open-file="~/desktop/Example.txt" style="width: ${proc.width}px; height: ${proc.height}px; top: ${proc.y}; left: ${proc.x}; z-index: ${proc.z};">
            <!-- Title bar -->
            <div class="title_bar">
                ${icon}
                <h2>${app.title}</h2>
                ${title_buttons}
            </div>

            <div class="content">
                ${app.html}
            </div>
        </div>`;
    }
}

/** Close/max/min window */
function windowAction(action, id) {
    if(action == undefined || id == undefined) return console.warn('Invalid window action');
    let proc = processes[id];
    let app = file_system.apps[proc.app];
    if(proc == undefined) return console.warn(`Process (${id}) does not exist`);
    // if(proc.allow_actions == false) return console.warn('This window has disabled this feature');

    // Action
    if(action == 'close') {
        proc.element.classList.add('window_close');
        proc.close_timer = setTimeout(() => {
            proc.element.remove();
            delete processes[proc.id];
        }, 100);
        let dockicon = document.getElementById(`dock_${proc.app}`);
        if(dockicon != null) dockicon.classList.remove('active');
    }
    else if(action == 'max') {
        proc.max = !proc.max;
        style(proc.element, 'state_max', proc.max);
    }
    else if(action == 'min') {
        proc.min = !proc.min;
        style(proc.element, 'state_min', proc.min);
    }
    else console.warn('Invalid window action');
}

/** Drag window */
function dragWindow(event, app, proc) {
    if(dragging == false) return;
    if(proc.max) windowAction('max', proc.id);

    if(event != false) {
        let rect = event.target.getBoundingClientRect();
        dragOffset.x = event.clientX - rect.left;
        dragOffset.y = event.clientY - rect.top;
    }

    let [x, y] = [pX - dragOffset.x, pY - dragOffset.y];

    proc.x = x;
    proc.y = y;
    proc.element.style.left = `${x}px`;
    proc.element.style.top = `${y}px`;

    requestAnimationFrame(() => { dragWindow(false, app, proc); });
}

/** Toggles a system menu or overlay */
function menu(id) {

}

/** Opens a file */
function openFile(event) {
    let element = event.srcElement;
    if(element.tagName != 'FIGURE') element = element.parentNode;
    console.log(element);

    let path = element.dataset.directory;
    if(isFolder(getFile(path))) {
        let proc = processes[element.dataset.process];
        proc.memory.navigate(path);
    };

    // Normal file
    let file_ext = path.split('.')[1];
    if(typeof file_ext != 'string') return console.warn('Invalid file extension');
    // if(file_ext == undefined) {
    //     let split = path.split('/');
    //     let name = split[split.length];
    //     return launch(name);
    // }
    let app = fileAssociation(path);
    
    launch(app, path);
}

/** Takes a path or filename and returns the associated app */
function fileAssociation(path) {
    let file_ext = path.split('.')[1];
    return file_system.system.config.file_association[file_ext];
}


/** Populate dock */
function populateDock() {
    let pinned = file_system.system.config.dock.pinned;
    let html = '';
    for(i in pinned) {
        let name = pinned[i];
        let app = file_system.apps[name];
        if(app == undefined) { console.warn('Dock: app doesnt exist'); continue; }
        html += `
        <button id="dock_${name}" class="dock_app" onclick="launch('${name}', undefined, { open_existing: true, })">
            <img src=".${app.icon}" alt="">
            <div class="dock_indicator"></div>
        </button>`;
    }

    document.getElementById('dock_apps').innerHTML = html;
}

function isFolder(file) {
    return file.type == 'dir';
}

/** Populate folder */
function populateFolder(path='~/desktop', proc={id:-1}) {
    let folder = getFile(path);
    if(!isFolder(folder)) return console.warn(`(${path}) is not a folder`);
    let html = '';

    for(filename in folder) {
        let file = folder[filename];
        if(filename == 'type' && typeof file == 'string') continue;
        html += template(path, filename, file);
    }

    // Export HTML
    let containers = document.querySelectorAll(`.view_folder[data-directory="${path}"`);
    containers.forEach(element => element.innerHTML = html);

    /** Template */
    function template(path, filename, file) {
        let app = fileAssociation(filename);
        let icon;
        try {
            icon = file_system.apps[app]['file_icon'];
        } catch (error) {
            if(isFolder(file)) icon = './assets/icon/icons8-file-folder-48.png'
            console.warn(error);
        }
        if(icon == undefined) icon = './assets/icon/blank_document.png';
        return `
        <figure class="file" data-process="${proc.id}" data-directory="${path}/${filename}" role="button" tabindex="0" ondblclick="openFile(event)" oncontextmenu="contextMenu(event)">
            <img src="${icon}" alt="${filename}">
            <figcaption>${filename}</figcaption>
        </figure>`;
    }
}

const context_menu_container = document.getElementById('context_menu_container');
const context_menu = document.getElementById('context_menu');
/** Context menu */
function contextMenu(event) {
    event.preventDefault();
    let source = event.srcElement;
    console.log(source);

    let y = pY;
    let x = pX;
    let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if(x + 240 >= vw) x = vw - 240;

    // Update page
    // populateContextMenu(event.srcElement.id);
    context_menu.style.top = `${y}px`;
    context_menu.style.left = `${x}px`;
    context_menu.focus();

    /** Populate context menu */
    function populateContextMenu(id) {
        let html = '';
        let data = contextData?.[id];
        if(data == undefined) return;
        for(i = 0; i < data.length; i++) {
            console.log(data.name);
            console.log(data.code);
            html += `<div class="context_item" tabindex="0" role="button" onclick="${data.code}">${data.name}</div>`;
        }
        context_menu.innerHTML = html;
    }
}

document.addEventListener('mouseup', () => {
    let proc = processes[dragging];
    if(proc != null) {
        if(proc.y < 0) proc.y = 0;
        proc.element.style.left = `${proc.x}px`;
        proc.element.style.top = `${proc.y}px`;
    }
    dragging = false;
})

// On load
onload = () => {
    populateFolder(path='~/desktop');
    populateDock();
}

(onmousemove = event => {
    pX = event.x;
    pY = event.y;
})()
