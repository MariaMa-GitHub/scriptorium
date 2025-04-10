import Docker from 'dockerode';

const docker = new Docker();

const LANGUAGES = {
    python: 'python',
    javascript: 'node',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    ruby: 'ruby',
    rust: 'rust',
    php: 'php',
    bash: 'bash',
    perl: 'perl'
};

const TIME_LIMIT = 10000; // 10 seconds
const MEMORY_LIMIT = 104857600; // 100MB in bytes
const CPU_PERIOD = 100000;
const CPU_QUOTA = 90000;  // 90% of CPU_PERIOD
const PIDS_LIMIT = 50;

export async function executeCode(code, language, input = '') {
    
    language = language.toLowerCase();
    
    if (!LANGUAGES[language]) {
        throw new Error('Unsupported language');
    }

    const containerConfig = {
        Image: `scriptorium-${LANGUAGES[language]}`,
        Cmd: ['/bin/sh'],
        WorkingDir: '/code',
        Tty: false,
        OpenStdin: true,
        StdinOnce: true,
        NetworkDisabled: true,
        HostConfig: {
            Memory: MEMORY_LIMIT,
            MemorySwap: MEMORY_LIMIT, // Same as Memory to prevent swap
            KernelMemory: MEMORY_LIMIT,
            MemoryReservation: MEMORY_LIMIT,
            CpuPeriod: CPU_PERIOD,
            CpuQuota: CPU_QUOTA,
            PidsLimit: PIDS_LIMIT,
            AutoRemove: true,
            OomKillDisable: false, // Allow container to be killed if it exceeds memory
            Binds: language === 'go' ? ['/tmp/go-cache:/root/.cache/go-build'] : [],
        }
    };

    try {
        const container = await docker.createContainer(containerConfig);
        await container.start();

        const fileName = getFileName(language);
        await execCommand(container, `echo '${escapeString(code)}' > ${fileName}`);

        if (input) {
            await execCommand(container, `echo '${escapeString(input)}' > input.txt`);
        }

        const command = getExecutionCommand(language, fileName, Boolean(input));
        
        const output = await new Promise((resolve, reject) => {
            let isResolved = false;
            let stdout = '';
            let stderr = '';
            
            const exec = container.exec({
                Cmd: ['sh', '-c', command],
                AttachStdout: true,
                AttachStderr: true
            });
        
            // Set timeout first
            const timeoutId = setTimeout(async () => {
                if (!isResolved) {
                    isResolved = true;
                    try {
                        await container.kill();
                    } catch (err) {
                        console.error('Error killing container:', err);
                    }
                    reject(new Error('Execution timed out'));
                }
            }, TIME_LIMIT);
        
            exec.then(exec => {
                exec.start().then(stream => {
                    container.modem.demuxStream(stream, {
                        write: data => { stdout += data.toString() }
                    }, {
                        write: data => { stderr += data.toString() }
                    });
        
                    stream.on('end', () => {
                        if (!isResolved) {
                            isResolved = true;
                            clearTimeout(timeoutId);
                            resolve({ stdout, stderr });
                        }
                    });
        
                    stream.on('error', (err) => {
                        if (!isResolved) {
                            isResolved = true;
                            clearTimeout(timeoutId);
                            reject(err);
                        }
                    });
                });
            });
        });
        
        return output;

        } catch (error) {
        throw new Error('Failed to execute code');
    }
}

async function execCommand(container, command) {
    const exec = await container.exec({
        Cmd: ['sh', '-c', command],
        AttachStdout: true,
        AttachStderr: true
    });
    
    return new Promise((resolve, reject) => {
        exec.start().then(stream => {
            let output = '';
            stream.on('data', data => output += data.toString());
            stream.on('end', () => resolve(output));
            stream.on('error', reject);
        });
    });
}

function escapeString(str) {
    return str.replace(/'/g, "'\\''");
}

function getFileName(language) {
    const extensions = {
        python: 'main.py',
        javascript: 'main.js',
        java: 'Main.java',
        c: 'main.c',
        cpp: 'main.cpp',
        ruby: 'main.rb',
        rust: 'main.rs',
        php: 'main.php',
        bash: 'main.sh',
        perl: 'main.pl'
    };
    return extensions[language] || 'main.txt';
}

function getExecutionCommand(language, fileName, hasInput) {
    const inputRedirect = hasInput ? ' < input.txt' : '';
    
    const commands = {
        python: `python3 ${fileName}${inputRedirect}`,
        javascript: `node ${fileName}${inputRedirect}`,
        java: `javac ${fileName} && java Main${inputRedirect}`,
        c: `gcc ${fileName} -o main && ./main${inputRedirect}`,
        cpp: `g++ ${fileName} -o main && ./main${inputRedirect}`,
        ruby: `ruby ${fileName}${inputRedirect}`,
        rust: `rustc ${fileName} && ./main${inputRedirect}`,
        php: `php ${fileName}${inputRedirect}`,
        bash: `bash ${fileName}${inputRedirect}`,
        perl: `perl ${fileName}${inputRedirect}`
    };
    
    return commands[language] || '';
}