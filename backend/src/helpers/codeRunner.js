const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

// Static Complexity & Optimization Analyzer
const analyzeCodeQuality = (code, language) => {
  const complexityHints = [];
  const optimizations = [];
  const weaknesses = [];
  let estimatedTimeComplexity = 'O(1)';

  const normalizedCode = code.replace(/\s+/g, ' ');

  // 1. Detect loops for time complexity
  const forLoops = (normalizedCode.match(/for\s*\(/g) || []).length;
  const whileLoops = (normalizedCode.match(/while\s*\(/g) || []).length;
  const nestedForLoops = (normalizedCode.match(/for\s*\(.*for\s*\(/g) || []).length;
  const recursions = (normalizedCode.match(/(def|function|void|int|double)\s+(\w+)\(.*\).*\2\(/g) || []).length;

  if (nestedForLoops > 0) {
    estimatedTimeComplexity = 'O(N^2)';
    complexityHints.push('Nested loops detected, which typically results in quadratic time complexity.');
    optimizations.push('Try using a Hash Map, two-pointer approach, or sorting to reduce O(N^2) to O(N) or O(N log N).');
  } else if (forLoops + whileLoops === 1) {
    estimatedTimeComplexity = 'O(N)';
    complexityHints.push('Single loop detected, indicating linear time complexity.');
  } else if (forLoops + whileLoops > 1) {
    estimatedTimeComplexity = 'O(N)';
    complexityHints.push('Multiple sequential loops detected, indicating linear time complexity overall.');
    optimizations.push('Verify if sequential loops can be combined to save redundant scans.');
  }

  // 2. Binary search / divide & conquer detection
  if (normalizedCode.includes('mid =') || normalizedCode.includes('binarySearch') || normalizedCode.includes('split(')) {
    estimatedTimeComplexity = 'O(log N)';
    complexityHints.push('Logarithmic indicators found (splitting / middle computations).');
  }

  // 3. Weaknesses & optimization suggestions
  if (recursions > 0) {
    weaknesses.push('Recursive calls found. Watch out for Stack Overflow risks.');
    optimizations.push('Consider adding memoization (Dynamic Programming) to avoid computing repetitive states.');
  }

  // Unsafe libraries or practices
  if (language === 'cpp' || language === 'c') {
    if (normalizedCode.includes('gets(')) {
      weaknesses.push('Unsafe input function gets() detected.');
      optimizations.push('Replace gets() with fgets() to prevent Buffer Overflow vulnerabilities.');
    }
  }

  if (language === 'javascript' || language === 'typescript') {
    if (normalizedCode.includes('eval(')) {
      weaknesses.push('Use of eval() function is highly discouraged.');
      optimizations.push('Remove eval() to prevent security injection exploits and improve performance.');
    }
  }

  // Memory suggestions
  if (normalizedCode.includes('new ') || normalizedCode.includes('malloc') || normalizedCode.includes('push(')) {
    complexityHints.push('Memory allocation operations found.');
    optimizations.push('Avoid memory reallocation inside hot loops. Pre-allocate array bounds if known.');
  }

  return {
    complexityHint: `Estimated Time Complexity: ${estimatedTimeComplexity}`,
    optimizationSuggestions: optimizations.length > 0 ? optimizations : ['Keep code modular and avoid repetitive operations.'],
    codingWeakness: weaknesses.length > 0 ? weaknesses : ['No obvious runtime anti-patterns detected.'],
  };
};

// Execute Code local sandbox (using ephemeral Docker containers)
const runCodeLocalSandbox = (code, language, input = '') => {
  return new Promise((resolve) => {
    const tempDir = path.join(__dirname, '../uploads/sandbox');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const uniqueId = `run_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    let fileExt = 'txt';
    let dockerImage = 'alpine';
    let runCmd = '';

    switch (language) {
      case 'python':
        fileExt = 'py';
        dockerImage = 'python:3.10-slim';
        runCmd = `python /app/code.py`;
        break;
      case 'javascript':
      case 'typescript':
        fileExt = 'js';
        dockerImage = 'node:18-alpine';
        runCmd = `node /app/code.js`;
        break;
      case 'c':
        fileExt = 'c';
        dockerImage = 'gcc:latest';
        runCmd = `gcc /app/code.c -o /app/code && /app/code`;
        break;
      case 'cpp':
        fileExt = 'cpp';
        dockerImage = 'gcc:latest';
        runCmd = `g++ /app/code.cpp -o /app/code && /app/code`;
        break;
      default:
        resolve({
          status: 'error',
          error: `Language ${language} execution is not supported locally. Please use Judge0 API.`,
        });
        return;
    }

    const hostPath = path.join(tempDir, uniqueId);
    fs.mkdirSync(hostPath);

    fs.writeFileSync(path.join(hostPath, `code.${fileExt}`), code);
    fs.writeFileSync(path.join(hostPath, `input.txt`), input);

    // Build command to spin up isolated container
    // Limits: 128MB RAM, 0.5 CPU, 5 second timeout
    const command = `docker run --rm --net=none --memory="128m" --cpus="0.5" -v "${hostPath}:/app" ${dockerImage} sh -c "cat /app/input.txt | ${runCmd}"`;

    logger.debug(`Sandbox execution: ${command}`);

    const startTime = Date.now();
    exec(command, { timeout: 6000 }, (error, stdout, stderr) => {
      const executionTime = Date.now() - startTime;
      
      // Cleanup temporary files
      try {
        fs.rmSync(hostPath, { recursive: true, force: true });
      } catch (cleanupErr) {
        logger.warn('Failed to cleanup sandbox temp path: %s', cleanupErr.message);
      }

      if (error) {
        if (error.killed) {
          resolve({
            status: 'error',
            error: 'Time Limit Exceeded (5000ms limit)',
            executionTime,
            memoryUsage: 0,
          });
        } else {
          resolve({
            status: 'error',
            error: stderr || error.message,
            executionTime,
            memoryUsage: 0,
          });
        }
      } else {
        resolve({
          status: 'success',
          output: stdout,
          executionTime,
          memoryUsage: 12000, // mock approximate peak in KB
        });
      }
    });
  });
};

// Execute Code via external Judge0 API
const runCodeJudge0 = async (code, language, input = '') => {
  const judge0Url = process.env.JUDGE0_API_URL || 'https://judge0-extra-demo.p.rapidapi.com';
  const judge0Key = process.env.JUDGE0_API_KEY;

  if (!judge0Key) {
    logger.warn('Judge0 API credentials missing. Falling back to local Docker Sandbox.');
    return runCodeLocalSandbox(code, language, input);
  }

  // Map languages to Judge0 ID numbers
  const languageIds = {
    c: 50,
    cpp: 54,
    java: 62,
    python: 71,
    javascript: 63,
    typescript: 74,
    go: 60,
    rust: 73,
    php: 68,
  };

  const languageId = languageIds[language];
  if (!languageId) {
    throw new Error(`Language ${language} not supported on Judge0 config.`);
  }

  try {
    const response = await axios.post(`${judge0Url}/submissions?wait=true`, {
      source_code: Buffer.from(code).toString('base64'),
      language_id: languageId,
      stdin: Buffer.from(input).toString('base64'),
    }, {
      headers: {
        'x-rapidapi-host': judge0Url.replace('https://', ''),
        'x-rapidapi-key': judge0Key,
        'content-type': 'application/json',
      }
    });

    const sub = response.data;
    const stdout = sub.stdout ? Buffer.from(sub.stdout, 'base64').toString('utf8') : '';
    const stderr = sub.stderr ? Buffer.from(sub.stderr, 'base64').toString('utf8') : '';
    const compileOutput = sub.compile_output ? Buffer.from(sub.compile_output, 'base64').toString('utf8') : '';

    const statusId = sub.status?.id;

    if (statusId === 3) {
      return {
        status: 'success',
        output: stdout,
        executionTime: Math.round(parseFloat(sub.time || '0') * 1000), // convert to ms
        memoryUsage: sub.memory || 0, // KB
      };
    } else if (statusId === 6) {
      return {
        status: 'error',
        error: compileOutput,
        executionTime: 0,
        memoryUsage: 0,
      };
    } else {
      return {
        status: 'error',
        error: stderr || sub.status?.description || 'Execution failed',
        executionTime: Math.round(parseFloat(sub.time || '0') * 1000),
        memoryUsage: sub.memory || 0,
      };
    }
  } catch (error) {
    logger.error('Judge0 Request failed: %s. Re-routing to local Docker sandbox.', error.message);
    return runCodeLocalSandbox(code, language, input);
  }
};

const executeCode = async (code, language, input = '') => {
  // SQL / MQL Mock Handler
  if (language === 'sql' || language === 'mql') {
    return {
      status: 'success',
      output: `Executed query successfully.\n[MOCK RESULT]: Returned 10 mock rows from users collection.`,
      executionTime: 5,
      memoryUsage: 2500,
    };
  }

  const result = await runCodeJudge0(code, language, input);
  const analysis = analyzeCodeQuality(code, language);

  return {
    ...result,
    analysis,
  };
};

module.exports = {
  executeCode,
  analyzeCodeQuality,
};
