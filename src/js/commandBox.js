const supportsTouch = () => 'ontouchstart' in document.documentElement;

const cmdBox = document.getElementById('cmd');

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

    // command running
    const commands = {
        goto: (args) => { if (args[1]) location.replace(`#${args[1]}`); }
    }
    const runCmd = cmd => {
        const args = cmd.split(' '); // get args
        if (args[0]) commands[args[0]](args); // run the command
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
