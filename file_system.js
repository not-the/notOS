var file_system = {
    'desktop': {
        type: 'dir',

        'Example.txt': {
            data: 'Hello. This is a sample text file. Try editing it.',
        },
        'Another file.txt': {
            data: 'another file!!!!!!!!11!1!'
        },
        'se1.png': {
            data: './assets/wallpaper/se1.png',
        },
        'sml.txt': {
            data: 'small filename',
        },
        'really long file name.txt': {
            data: 'well',
        },
    },
    'documents': {
        type: 'dir',
        'A Document.txt': {
            data: 'Important information',
        },
        'Folder': {
            type: 'dir',
            'important folder stuff.txt': {
                data: 'very important',
            }
        }
    },
    'pictures': {
        type: 'dir',
        'se1.png': { data: './assets/wallpaper/se1.png', },
        'scr00016.png': { data: './assets/wallpaper/scr00016.png', },
        'scr00023.png': { data: './assets/wallpaper/scr00023.png', },
        'scr00030.png': { data: './assets/wallpaper/scr00030.png', },
        'scr00040.png': { data: './assets/wallpaper/scr00040.png', },
        'scr00067.png': { data: './assets/wallpaper/scr00067.png', },
        'scr00121.png': { data: './assets/wallpaper/scr00121.png', },
        'scr00142.png': { data: './assets/wallpaper/scr00142.png', },
    },
    'apps': {
        type: 'dir',

        'files': {
            title: 'Files',
            icon: './assets/icon/icons8-file-folder-48.png',
            file_icon: './assets/icon/icons8-file-folder-48.png',
            html: /*html*/ `
                <style>
                    .app_files .content {
                        padding: 6px 8px;
                        display: flex;
                        flex-direction: column;
                    }
                    .app_files .content .status_bar {
                        border-top: 1px solid var(--border-color);
                        padding-top: 3px;
                    }
                    .app_files .content .inner {
                        width: 100%;
                        height: 100%;
                        margin-bottom: 6px;

                        display: flex;
                    }
                    .app_files .content .pane {
                        width: 100%;
                        min-width: 100px;
                        max-width: 200px;
                        resize: horizontal;
                        margin-top: 12px;
                        padding-right: 12px;
                        border-right: 1px solid var(--border-color);

                    }
                    .app_files .content .pane button {
                        color: var(--text-alt);
                        font-size: 11pt;
                        text-align: left;
                        cursor: pointer;

                        width: 100%;
                        margin: 1px 6px;
                        padding: 3px 6px;
                        border-radius: 3px;
                        border-bottom: 1px solid var(--border-color);
                        transition: 0.05s background-color ease-in;
                    }
                    .app_files .content .pane button:hover {
                        color: var(--text);
                        border-color: transparent;
                        background-color: var(--hover-color);
                        transition: unset;
                    }
                    .app_files .content .pane button.active {
                        color: var(--text);
                        border-color: transparent;
                        background-color: var(--border-color);
                    }

                </style>

                <div class="options">
                    BUTTONS GO HERE
                </div>

                <div class="inner">
                    <div class="pane">
                        <button class="active" data-directory-button="~/desktop">Desktop</button>
                        <button data-directory-button="~/documents">Documents</button>
                        <button data-directory-button="~/pictures">Pictures</button>
                        <button data-directory-button="~/apps">Apps</button>
                        <button data-directory-button="~/system">System</button>
                    </div>
                    <div class="view_folder state_icon" data-directory="~/desktop">

                    </div>
                </div>
                <div class="status_bar">11 files</div>
            `,
            script: (stage='start', proc, path) => {
                // Navigate function
                proc.memory.navigate = dir => {
                    let container = document.querySelector(`#app_container .window[data-process="${proc.id}"] .view_folder`);
                    container.setAttribute("data-directory", dir);
                    populateFolder(dir, proc);
                }

                // Buttons
                let buttons = document.querySelectorAll(`#app_container .window[data-process="${proc.id}"] button[data-directory-button]`);
                buttons.forEach(element => {
                    element.addEventListener('click', event => {
                        try {
                            proc.memory.navigate(event.srcElement.dataset.directoryButton);
                            buttons.forEach(e => e.classList.remove('active'));
                            element.classList.add('active');
                        } catch (error) { console.warn('Invalid directory'); console.error(error);  }
                    })
                })

                populateFolder(path, proc);
            },

            window: {
                width: '800',
                height: '500',
            },
        },

        'notes': {
            title: 'Notes',
            icon: './assets/icon/Bloc_Notes_SZ.png',
            file_icon: './assets/icon/blank_document.png',
            html: /*html*/ `
                <style>
                    .app_notes .content {
                        padding: 6px 8px;
                        display: flex;
                        flex-direction: column;
                    }
                    .app_notes .content textarea {
                        width: 100%;
                        height: 100%;
                        font-family: var(--font-system);
                        font-size: 11pt;
                        background: none;
                        color: var(--text);
                        border: none;
                        outline: none;
                        resize: none;
                    }
                    .app_notes .content .status_bar {
                        border-top: 1px solid var(--border-color);
                        padding-top: 3px;
                    }
                </style>

                <textarea name="" id="" cols="30" rows="10">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quis omnis quae praesentium rem qui sit laborum, iure dolor ex quibusdam illo quia aut similique, nisi voluptatibus. Ex fugit quae explicabo iusto, molestias minus? Omnis animi qui harum esse labore, quia quae aliquid, eligendi totam autem, blanditiis nihil. Aliquam, ipsa debitis?</textarea>
                <div class="status_bar">✓ Saved</div>
            `,
            script: (stage, proc, file) => {
                let target = getFile(file);

                let textarea = document.querySelector(`#app_container .window[data-process="${proc.id}"] .content textarea`);
                let status = document.querySelector(`#app_container .window[data-process="${proc.id}"] .content .status_bar`);
                textarea.value = target.data;

                proc.element.addEventListener('keydown', event => {
                    if(event.key == 's' && event.ctrlKey) {
                        event.preventDefault();
                        saveTXT();
                    }
                });

                textarea.addEventListener('input', () => {
                    status.innerText = 'Unsaved changes';
                });

                function saveTXT() {
                    // New file
                    if(target.type == 'temp') {
                        console.log('Create new file?');
                    }
                    target.data = textarea.value;
                    status.innerText = '✓ Saved';
                }
            },

            window: {
                width: '400',
                height: '600',
            },
        },
        'images': {
            title: 'Image Viewer',
            icon: './assets/icon/Antu_google-draws.svg',
            file_icon: './assets/icon/Antu_google-draws.svg',
            html: /*html*/ `
                <style>
                    .app_images .content {
                        padding: 6px 8px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }
                    .app_images .content .viewer_image {

                    }
                </style>

                <img src="" alt="" class="viewer_image">
            `,
            script: (stage, proc, file) => {
                let target = getFile(file);

                let image = document.querySelector(`#app_container .window[data-process="${proc.id}"] .content .viewer_image`);
                image.src = target.data;
            },

            window: {
                width: '800',
                height: '600',
            },
        },
        'dialog': {
            title: 'Dialog',
            icon: false,
            html: /*html*/ `
                <style>
                    .app_dialog .content {
                        padding: 6px 8px;
                        text-align: center;
                    }
                    .app_dialog .content p {
                        padding: 16px;
                    }
                    .app_dialog .content .dialog_buttons {
                        display: flex;
                    }
                    .app_dialog .content button {
                        color: black;
                        width: 90%;
                        background-color: #cccccc;
                    }
                </style>

                <p>This is a dialog</p>
                <div class="dialog_buttons">
                    <button>Cancel</button>
                    <button>OK</button>
                </div>
            `,
            script: (proc, options) => {
                let title = document.querySelector(`#app_container .window[data-process="${proc.id}"] .title_bar h2`);
                let text = document.querySelector(`#app_container .window[data-process="${proc.id}"] .content p`);
                title.innerText = options.title || 'Dialog';
                text.innerText = options.text || '';
            },

            window: {
                width: '400',
                height: '140',

                allow_actions: false,
            }
        }
    },
    'system': {
        type: 'dir',

        'config': {
            file_association: {
                'txt': 'notes',

                'img':  'images',
                'png':  'images',
                'jpg':  'images',
                'jpeg': 'images',
                'gif':  'images',
            },
            dock: {
                'pinned': [
                    'files',
                    'notes',
                    'images',
                ]
            },
        }
    }
}