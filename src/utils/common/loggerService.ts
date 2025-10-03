import { Injectable, LoggerService } from '@nestjs/common';
import * as chalk from 'chalk';

type Status = 'success' | 'fail' | 'info' | 'error' | 'warn';

@Injectable()
export class AppLogger implements LoggerService {
    doLog(message: string, status: Status = 'success') {
        const { file, line, func } = this.getCallerInfo();
        const timestamp = new Date().toISOString();

        const location = `${file}:${line} (${func})`;
        const formattedMessage = `[${timestamp}] [${status.toUpperCase()}] [${location}] ${message}`;

        switch (status) {
            case 'success':
                console.log(chalk.green(`✅ ${formattedMessage}`));
                break;
            case 'fail':
            case 'error':
                console.error(chalk.red(`❌ ${formattedMessage}`));
                break;
            case 'warn':
                console.warn(chalk.yellow(`⚠️ ${formattedMessage}`));
                break;
            case 'info':
                console.info(chalk.cyan(`ℹ️ ${formattedMessage}`));
                break;
            default:
                console.log(formattedMessage);
                break;
        }
    }

    log(message: string) {
        this.doLog(message, 'success');
    }

    error(message: string, trace?: string) {
        this.doLog(message, 'error');
        if (trace) console.error(chalk.gray(trace));
    }

    warn(message: string) {
        this.doLog(message, 'warn');
    }

    debug(message: string) {
        const { file, line, func } = this.getCallerInfo();
        const timestamp = new Date().toISOString();
        console.debug(chalk.blue(`🐛 [${timestamp}] [${file}:${line} (${func})] ${message}`));
    }

    verbose(message: string) {
        this.doLog(message, 'info');
    }

    // Helper to get file, line number, and function name of caller
    private getCallerInfo(): { file: string; line: string; func: string } {
        const stack = new Error().stack;
        if (!stack) return { file: 'unknown', line: '0', func: 'unknown' };

        const stackLine = stack.split('\n')[3]; // caller
        const match = stackLine.match(/at (.+?) \((.*):(\d+):(\d+)\)/);
        if (match) {
            const func = match[1];
            const file = match[2].split('/').pop() || 'unknown';
            const line = match[3];
            return { file, line, func };
        }

        // fallback if regex fails
        return { file: 'unknown', line: '0', func: 'unknown' };
    }
}
