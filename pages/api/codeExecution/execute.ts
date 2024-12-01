import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';

// Turn exec function into one that returns a promise
const execPromise = util.promisify(exec);
// Initialize directory for temporary files
const TEMP_DIR = path.resolve(process.cwd(), 'temp');

interface Request {
  method: string;
  body: {
    code: string;
    language: string;
    input?: string;
  };
}

interface Response {
  status: (code: number) => Response;
  json: (body: any) => void;
  end: (message: string) => void;
}


export default async function handler(req: Request, res: Response) {
  if (req.method === 'POST') {
    const { code, language, input } = req.body;

    try {
      // Call the runCode function which returns back stdout and stderr of the program
      const result = await runCode(code, language, input);
      res.status(200).json(result);

    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }

  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function runCode(code: string, language: string, input: string | undefined): Promise<{ output: string }> {
  const filePath = path.join(TEMP_DIR, 'code.txt');

  // Create input.txt for program inputs
  const inputFilePath = path.join(TEMP_DIR, 'input.txt');

  // Write the code to a temporary file and write input to inputFile if necessary
  await fs.writeFile(filePath, code);
  await fs.writeFile(inputFilePath, input || '')

  // Set the compile/run command based on programming language
  let imageName;
  switch (language) {
    case 'python':
      imageName = `myimage:python`;
      break;
    case 'java':
      imageName = `myimage:java`;
      break;
    case 'c':
      imageName = `myimage:c`;
      break;
    case 'cpp':
      imageName = `myimage:cpp`;
      break
    case 'csharp':
      imageName = `myimage:csharp`;
      break;
    case 'js':
      imageName = `myimage:javascript`;
      break;
    case 'ts':
      imageName = `myimage:typescript`;
      break;
    case 'rust':
      imageName = `myimage:rust`;
      break;
    case 'php':
      imageName = `myimage:php`;
      break;
    case 'go':
      imageName = `myimage:go`;
      break;
    default:
      throw new Error('Unsupported language');
  }

  // Create and run the docker container
  const containerName = `container_${Math.floor(1000 + Math.random() * 9000)}`;
  // Set execution limits
  const options = {
    timeout: 30000, // 30 seconds
    maxBuffer: 100 * 1024 * 1024, // 100MB
  };

  try {
    await execPromise(`docker create --name ${containerName} ${imageName}`);
    // Copy the files into the Docker container
    await execPromise(`docker cp ${filePath} ${containerName}:/usr/src/app/code.txt`);
    await execPromise(`docker cp ${inputFilePath} ${containerName}:/usr/src/app/input.txt`);

    // Run the Docker container and capture the output
    const { stdout, stderr } = await execPromise(`docker start -a ${containerName}`, options);

    return {
      output: stdout,
    };

  } catch (error: any) {
    if (error.signal === 'SIGTERM') {
      return {
        output: "Time limit exceeded.",
      }
    }

    // Check if the error was due to buffer overflow
    if (error.message.includes('stdout maxBuffer length exceeded')) {
      return {
        output: "Memory limit exceeded.",
      }
    }

    return {
      output: error.stderr || '',
    };

  } finally {
    await execPromise(`docker rm -f ${containerName}`);
  }
}

