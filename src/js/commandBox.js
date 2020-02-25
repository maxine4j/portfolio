const supportsTouch = () => 'ontouchstart' in document.documentElement;

const config = {
    github: 'https://github.com/tim-ings',
    email: 'tim@tim-ings.com',
    resume: 'tim-ings-resume',
}

const cmdBox = document.getElementById('cmd');
const cmdLog = document.getElementById('log');

if (supportsTouch()) { // disable on mobile
    cmdBox.style.display = 'none';
} else {
    // set up the cmd input box
    cmdBox.style.maxWidth = `${cmdBox.maxLength}ch`;

    // prevent custom selection
    const selectEnd = () => cmdBox.setSelectionRange(cmdBox.value.length, cmdBox.value.length);
    cmdBox.addEventListener('keydown', selectEnd);
    cmdBox.addEventListener('keyup', selectEnd);
    cmdBox.addEventListener('mousedown', ev => ev.preventDefault());

    // ensure the input is the same width as the text
    const updateWidth = () => { cmdBox.style.width = `${cmdBox.value.length}ch`; }
    cmdBox.addEventListener('input', updateWidth);
    updateWidth();

    const cout = s => {
        const msg = document.createElement('pre');
        msg.textContent = (s || '').toString().replace('\t', '    ');
        cmdLog.appendChild(msg);
    }

    const lnout = (text, href, click=false) => {
        const a = document.createElement('a');
        a.textContent = text;
        a.href = href;
        a.download = '';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        cmdLog.appendChild(a);
        if (click) a.click();
    }

    // command running
    const commands = {
        help: {
            run: args => {
                cout('Available commands:');
                for (const k in commands) cout('\t- ' + k);
                cout('Tip: run multiple commands with `&&` for example `clear && close`')
            },
            man: "Displays list of available commands",
        },
        man: {
            run: args => {
                if (args[1] in commands) cout(commands[args[1]].man);
                else cout(`No manual entry for ${args[1] || '\"\"'}`);
            },
            man: "Displays the manual page for the given command",
        },
        goto: {
            run: args => {
                const valids = ['featured', 'websites', 'games', 'programs', 'addons'];
                if (args[1] && valids.indexOf(args[1]) >= 0) location.replace(`#${args[1]}`);
                else {
                    cout(`Unknown category: ${args[1] || '\"\"'}`);
                    cout(`Available categories:\n    - ${valids.join('\n    - ')}`);
                }
            },
            man: "Scrolls to the given project category",
        },
        github: {
            run: args => lnout(config.github, config.github, true),
            man: "Opens my GitHub profile",
        },
        resume: {
            run: args => {
                const valids = { pdf: 'pdf', doc: 'docx', world: 'docx', word: 'docx', office: 'docx' };
                const file = `tim-ings-resume.${valids[args[1]] || 'pdf'}`;
                lnout(file, `./content/${file}`, true);
            },
            man: "Download my résumé. Provide argument `docx` for microsoft office format.",
        },
        mail: {
            run: args => lnout(config.email, `mailto:${config.email}`, true),
            man: "Send me an email",
        },
        reload: {
            run: args => location.reload(),
            man: "Reloads the page",
        },
        clear: {
            run: args => cmdLog.textContent = '',
            man: "Clear the terminal screen",
        },
        close: {
            run: args => cmdLog.classList.add('hidden'),
            man: "Closes the terminal",
        },
        js: {
            run: args => {
                try { cout(eval(args.slice(1).join(' '))) }
                catch (e) { cout(e) }
            },
            man: "Runs command as javascript",
        }
    }
    const runCmd = inp => {
        cmdLog.classList.remove('hidden'); // show the console
        const cmds = inp.split('&&').map(p => p.split(' ').filter(p => p !== ''));
        cout(`$ ${inp}`);
        for (const args of cmds) {
            if (args[0] in commands) commands[args[0]].run(args); // run the command 
            else { cout(`tish: ${args[0]}: command not found\n\n`); commands.help.run(); break; }
        }
        cout('\n');
    }

    window.addEventListener('keydown', ev => {
        if (ev.key === 'ArrowUp' || ev.key === 'ArrowDown' || ev.key === ' ') return; // preserve keyboard scrolling

        cmdBox.focus(); // focus the cmd box on any typing

        if (ev.key === "Enter") { // run the command and clear the box
            runCmd(cmdBox.value);
            cmdBox.value = "";
            ev.preventDefault();
            updateWidth();
        }
    });

    const demoType = (text, speed=50, erase=true, eraseSpeed=20, eraseGap=1000) => {
        return new Promise(resolve => {
            for (let i = 0; i < text.length; i++) {
                setTimeout(() => {
                    cmdBox.value += text[i];
                    updateWidth();
                }, speed * i);
                if (erase) {
                    setTimeout(() => {
                        cmdBox.value = cmdBox.value.slice(0, cmdBox.value.length - 1);
                        updateWidth();
                        if (i >= text.length - 1) resolve();
                    }, eraseSpeed * i + (text.length * speed) + eraseGap);
                }
            }
        });
    }

    window.addEventListener('load', ev => {
        setTimeout(() => {
            demoType('hello world')
            .then(() => demoType('try typing a command'))
            .then(() => demoType('goto games', 30, true, 15, 300))
            .then(() => demoType('github', 30, true, 15, 300))
            .then(() => demoType('js demoType("hello")', 15, true, 10, 300))
            .then(() => demoType('help', 30, true, 15, 1000))
        }, 1000);
    });
}
