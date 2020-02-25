const supportsTouch = () => 'ontouchstart' in document.documentElement;

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
            run: () => window.open('https://github.com/tim-ings'),
            man: "Opens my GitHub profile",
        },
        resume: {
            run: () => window.open('./resume'),
            man: "Opens my résumé",
        },
        mail: {
            run: () => window.open('mailto:tim@tim-ings.com'),
            man: "Send me an email"
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
}
